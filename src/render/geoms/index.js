import {isObject, isString, isArray} from "../../util.js";
import {each, values as objectValues} from "../../util.js";
import {propTypes, parseProps} from "../../props.js";
import {getValueSources} from "../../runtime/value.js";
import {getExpressionSources} from "../../runtime/expression.js";
import {createHashMap} from "../../hashmap.js";

import {setStyle, isStyleName} from "../style.js";
import {setTooltipEvents} from "../tooltip.js";
//import {setEvent, isEventName} from "../events.js";

import {getPanelsLayout} from "../panels.js";

import {textGeom} from "./text.js";
import {lineGeom} from "./line.js";
import {rectangleGeom} from "./rectangle.js";
import {circleGeom} from "./circle.js";
import {arcGeom} from "./arc.js";
import {curveGeom} from "./curve.js";
import {areaGeom} from "./area.js";
import {pathGeom} from "./path.js";
import {glyphGeom} from "./glyph.js";
//import {polylineGeom} from "./polyline.js";
//import {polygonGeom} from "./polygon.js";

//Geoms types
const geomsTypes = {
    //"polyline": polylineGeom,
    //"polygon": polygonGeom,
    "text": textGeom,
    "line": lineGeom,
    "rectangle": rectangleGeom,
    "circle": circleGeom,
    "arc": arcGeom,
    "curve": curveGeom,
    "area": areaGeom,
    "path": pathGeom,
    "glyph": glyphGeom
};

//Get a geom object
export function getGeom (name) {
    return geomsTypes[name];
}

//build geom data
let buildGeomData = function (context, props) {
    //Get data in context
    let data = context.source(props.source);
    //Check for transform to apply
    if (isArray(props.transform) || isObject(props.transform)) {
        data = data.map(function (item) {
            return context.transform(item, props.transform);
        });
    }
    //Return the parsed data
    return data;
};

//Get geom data
let getGeomData = function (data, props) {
    if (props.type === "curve" || props.type === "area") {
        return data; //Return the entire dataset
    }
    //Return only the first item
    return data[0];
};

//Build geom element
let createGeomElement = function (geom, parent, index, group) {
    return parent.append(geom.tag).attr("id", `geom__${group}__${index}`);
};

//Get a geom element
let getGeomElement = function (geom, parent, index, group) {
    return parent.selectAll(`#geom__${group}__${index}`);
};

//Check if render props contain a geom props
let hasGeomRenderProps = function (props, geom) {
    let keys = Object.keys(props);
    for (let i = 0; i < keys.length; i++) {
        if (typeof geom.props[keys[i]] !== "undefined") {
            return true; //Found a geom prop
        }
    }
    //No geom props found
    return false;
};

//Get rendering props
let getGeomRenderProps = function (props, event) {
    let renderProps = {}; //props.render.mount;
    //Check if init props are provided
    if (typeof props.render["init"] === "object" && props.render["init"] !== null) {
        renderProps = Object.assign({}, props.render["init"]);
    }
    //Check the current event
    if (typeof props.render[event] === "object" && props.render[event] !== null) {
        renderProps = Object.assign({}, renderProps, props.render[event]);
    }
    //Return the final props
    return renderProps;
};

//Get geom groups
let getGeomGroups = function (props) {
    if (props.type === "group") {
        if (isArray(props.geoms) === true) {
            return props.geoms; //Return the array of geoms
        }
        else if (isObject(props.geoms) === true) {
            return objectValues(props.geoms); //Return only values
        }
        //Default --> not valid geoms
        return [];
    }
    //Else: return this geom props as an array
    return [props];
};

//Apply geom style
let applyGeomStyle = function (context, datum, props, target) {
    let datumValue = (isArray(datum) === true) ? datum[0] : datum; //Get datum value
    return each(props, function (key, value) {
        if (value !== null && isStyleName(key) === true) {
            return setStyle(target, key, context.value(props[key], datumValue)); //Apply style
        }
    });
};

//Create a new geom node
export function createGeomNode (context, key, props) {
    //Initialize the geom node
    let node = context.addNode({
        "id": `geom:${key}`,
        "type": "geom",
        "props": props,
        "targets": createHashMap(),
        "source": null,
        "value": [],
    });
    //Get the source data
    context.panels.targets.add(node.id, node); //Bind to panels
    if (typeof props.source === "object" && props.source !== null) {
        if (typeof props.source.data === "string") {
            let source = context.data[props.source.data];
            Object.assign(node, {
                "source": source
            });
            //Add this geom node as a target node for this data object
            source.targets.add(node.id, node);
        }
        else if (typeof props.source.force === "string") {
            if (context.forces === null) {
                return context.error("No forces has been registered");
            }
            if (props.source.force !== "nodes" && props.source.force !== "links") {
                return context.error(`Geoms can only get data from 'nodes' or 'links' forces, but provided '${props.source.force}'`);
            }
            //Get source data
            context.forces.targets.add(node.id, node);
            node.source = context.forces; //Set the source as the forces node
        }
    } 
    //Get values sources
    getGeomGroups(node.props).forEach(function (groupProps) {
        //Check if this geom has a name field
        if (typeof groupProps["name"] === "string") {
            let name = groupProps["name"].trim();
            if (typeof context.geoms[name] !== "undefined") {
                context.log.warn(`There are more than one geoms with the '${name}' name assigned`);
            }
            context.geoms[name] = node; //Save the reference to this node
        }
        //Get sources
        return each(groupProps.render, function (key, renderProps) {
            return each(renderProps, function (propKey, propValue) {
                return getValueSources(context, propValue).forEach(function (source) {
                    //console.log(source);
                    source.targets.add(node.id, node); //Add this geom as a target node
                });
            })
        });
    });
    //Render this geom the first time
    //return updateShape(context, node, true);
}

//Update the provided node
export function updateGeomNode (context, node, forceRender) {
    context.current.panel = null;
    getPanelsLayout(context, node.props.panel).forEach(function (panelItem) {
        context.current.panel = panelItem.panel; //Save current panel
        //Check if there is a group for this geom group
        let element = panelItem.element; //Get element
        let target = element.selectAll(`g[data-geom='${node.id}']`);
        if (target.length === 0) {
            target = element.append("g").attr("data-geom", node.id); //Create a new geom group
        }
        //Render the geom
        return renderGeom(context, node, target, forceRender);
    });
    //Remove current panel
    context.current.panel = null;
}

//Render a geom
let renderGeom = function (context, node, parent, forceRender) {
    //Check for force rendering the geom
    if (forceRender === true) {
        //Clean the parent node
        //node.parent.empty();
        parent.empty();
        //Get data to apply
        Object.assign(node, {
            "value": buildGeomData(context, node.props)
        });
    }
    //Get geom groups
    getGeomGroups(node.props).forEach(function (props, groupIndex) {
        //Get the geom item
        let geom = getGeom(props.type);
        //Init props
        let updateProps = getGeomRenderProps(props, "update");
        let hoverProps = getGeomRenderProps(props, "hover");
        //Check for no force render
        if (forceRender === false) {
            //Check for no update render
            if (typeof props.render.update !== "object" || props.render.update === null) {
                return;
            }
            //Check if we should reload each rendered geom
            let reloadGeom = hasGeomRenderProps(props.render.update, geom); 
            //Access to all items
            return getGeomData(node.value, props).forEach(function (data, index) {
                //Select the element attached to this data node
                let element = getGeomElement(geom, parent, index, groupIndex);
                //Check for render props
                if (reloadGeom === true) {
                    geom.render(context, data, updateProps, element); //Redraw this element
                }
                //Apply style props
                applyGeomStyle(context, data, props.render.update, element);
            });
        }
        //Build geoms for each data group
        getGeomData(node.value, props).forEach(function (data, index) { 
            let element = createGeomElement(geom, parent, index, groupIndex);
            //Assign geom attributes
            element.attr("data-type", "geom"); //Set element type as geom
            element.attr("data-geom-type", geom.type); //Assign geom type
            element.attr("data-geom-index", groupIndex); //Assign geom group index
            element.attr("data-geom-datum", index); //Assign geom datum index
            element.attr("data-geom-name", (typeof props.name === "string") ? props.name : ""); //Assign geom name
            element.attr("data-geom-panel", context.current.panel.index); //Save current panel
            geom.render(context, data, updateProps, element);  // --> render init + update props
            //Apply style props
            applyGeomStyle(context, data, updateProps, element);
            //Register on hover events
            if (typeof props.render.hover === "object" && props.render.hover !== null) {
                //Register enter event listener --> apply hover props
                element.on("mouseenter", function (event) {
                    if (hasGeomRenderProps(props.render.hover, geom) === true) {
                        geom.render(context, data, hoverProps, element); //Redraw this element
                    }
                    //Apply style props
                    applyGeomStyle(context, data, props.render.hover, element);
                });
                //Check for update props provided
                if (typeof props.render.update === "object" && props.render.update !== null) {
                    //Register on leave event listener --> apply update props to this element
                    element.on("mouseleave", function (event) {
                        if (hasGeomRenderProps(props.render.update, geom) === true) {
                            geom.render(context, data, updateProps, element); //Redraw this element
                        }
                        //Apply style props
                        applyGeomStyle(context, data, props.render.update, element);
                    });
                }
            }
            //Register tooltip handlers
            if (typeof props.tooltip === "object" && props.tooltip !== null) {
                setTooltipEvents(context, element, data, props.tooltip);
            }
        });
    });
}


