import {createHashMap} from "../hashmap.js";
import {getValueSources} from "../runtime/value.js";
import {isArray, isObject, unique, range as rangeOf, each} from "../util.js";

import {getPanelsLayout} from "../render/panels.js";

//import {propTypes} from "../props.js";
import {color as colorScale} from "./color.js";
import {categorical as categoricalScale} from "./discrete.js";
import {point as pointScale} from "./discrete.js";
import {interval as intervalScale} from "./discrete.js";
import {linear as linearScale} from "./continuous.js";

//Export constants
export const CONTINUOUS_SCALE = 0;
export const DISCRETE_SCALE = 1;

//Build scale types
export const scaleTypes = {
    "linear": {
        "category": CONTINUOUS_SCALE,
        "scale": linearScale,
        "props": {
            "zero": false
        }
    },
    "color": {
        "category": CONTINUOUS_SCALE,
        "scale": colorScale,
        "props": {
            "zero": false
        }
    },
    "interval": {
        "category": DISCRETE_SCALE,
        "scale": intervalScale,
        "props": {
            "margin": 0,
            "spacing": 0,
        }
    },
    "point": {
        "category": DISCRETE_SCALE,
        "scale": pointScale,
        "props": {
            "margin": 0
        }
    },
    "categorical": {
        "category": DISCRETE_SCALE,
        "scale": categoricalScale,
        "props": {}
    }
};

//Get a scale
export function getScale (name) {
    return scaleTypes[name];
}

//Check if the provided scale is a discrete scale
export function isDiscreteScale (scale) {
    return getScale(scale.type).category === DISCRETE_SCALE;
}

//Check if the provided scale is a continuous scale
export function isContinuousScale (scale) {
    return getScale(scale.type).category === CONTINUOUS_SCALE;
}

//Parse scale range
let parseScaleRange = function (context, scale, value) {
    //Check for array range object --> parse each item
    if (isArray(value) === true) {
        return value.map(function (v) {
            return context.value(v, null);
        });
    }
    //Check for object value
    else if (isObject(value) === true) {
        //Check for width range value
        if (typeof value["draw"] === "string" && value["draw"] === "width") {
            //return [0, context.draw.computed.width];
            return [0, context.current.draw.width];
        }
        //Check for height range value
        else if (typeof value["draw"] === "string" && value["draw"] === "height") {
            //return [context.draw.computed.height, 0];
            return [context.current.draw.height, 0];
        }
        //Check for panel width value
        else if (typeof value["panel"] === "string" && value["panel"] === "width") {
            return [0, context.current.panel.width];
        }
        //Check for panel height value
        else if (typeof value["panel"] === "string" && value["panel"] === "height") {
            return [context.current.panel.height, 0];
        }
        //Other type --> parse from value or state
        else {
            return context.value(value, null, []);
        }
    }
    //Other range value --> throw error
    throw new Error("Invalid range provided");
};

//Parse scale domain
let parseScaleDomain = function (context, scale, value) {
    //Check if provided domain is an array
    if (isArray(value) === true) {
        return value.map(function (v) {
            return context.value(v, null);
        });
    }
    //Check if the provided value is an object
    if (isObject(value) === true) {
        //Check for state data
        if (typeof value["state"] === "string") {
            return context.state[value["state"]].value;
        }
        //Check for manual domain
        else if (typeof value["value"] !== "undefined") {
            return value["value"]; //Return value data
        }
        //Get domain from data
        let data = context.source(value)[0];
        //Generate a function to extract the domain value of a datum
        let valueOf = function (datum) {
            return (typeof value["field"] === "string") ? datum[value["field"]] : datum;
        };
        //Check for continuous scale
        if (scale.category === CONTINUOUS_SCALE) {
            return rangeOf(data, valueOf);
        }
        //Check for discrete scale
        else if (scale.category === DISCRETE_SCALE) {
            return unique(data, valueOf);
        }
        //Default: return the data object
        return data;
    }
    //Unknow domain type
    //throw new Error("Unknown domain type"); 
};

//Get scale sources
let getScaleSources = function (context, value) {
    let sources = [];
    //Check for string value --> no source
    if (typeof value === "string") {
        return sources;
    }
    //Check for array value --> parse items
    else if (isArray(value) === true) {
        //For each item in the value array
        value.forEach(function (item) {
            return getValueSources(context, item).forEach(function (source) {
                sources.push(source);
            }); 
        });
    }
    //Check for state value
    else if (typeof value.state === "string") {
        sources.push(context.state[value.state]);
    }
    //Check for data source
    else if (typeof value.data === "string") {
        sources.push(context.data[value.data]);
    }
    //Check for palette source
    else if (isObject(value.palette)) {
        getScaleSources(context, value.palette).forEach(function (item) {
            sources.push(item);
        });
    }
    //Return sources object
    return sources;
};

//Create a scale node
export function createScaleNode (context, name, props) {
    let node = context.addNode({
        "id": `scale:${name}`,
        "props": props,
        "targets": createHashMap(),
        "type": "scale"
    });
    //Get sources from the scale range and domain
    [props.range, props.domain].forEach(function (scaleProps) {
        return getScaleSources(context, scaleProps).forEach(function (source) {
            source.targets.add(node.id, node);
        });
    });
    //Build this scale
    //updateScale(context, scaleNode);
    //Save this scale
    context.scales[name] = node;
};

//Update the scale
export function updateScaleNode (context, node) {
    let scale = getScale(node.props.type);
    let panelItem = getPanelsLayout(context, node.props.panel)[0]; //Get panel item
    context.current.panel = panelItem.panel; //Save current panel
    //Build the scale domain and range
    let scaleRange = parseScaleRange(context, scale, node.props.range);
    let scaleDomain = parseScaleDomain(context, scale, node.props.domain);
    //console.log(scaleRange);
    //console.log(scaleDomain);
    if (scaleDomain === null) {
        //TODO: display warning
        context.current.panel = null; //Clear current panel
        return Object.assign(node, {"value": null}); //Scale is not available
    }
    //Add extra props to scale args
    let scaleArgs = {};
    each(scale.props, function (key, value) {
        //scaleArgs[key] = (typeof node.props[key] === value.type) ? node.props[key] : value.defaultValue;
        scaleArgs[key] = (typeof node.props[key] !== "undefined") ? node.props[key] : value;
    });
    //Update the scale args
    Object.assign(scaleArgs, {
        "domain": scaleDomain,
        "range": scaleRange
    });
    //Build the scale
    Object.assign(node, {
        "value": scale.scale(scaleArgs)
    });
    context.current.panel = null; //Clear current panel
}

