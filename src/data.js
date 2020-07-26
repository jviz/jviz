import {isArray, isObject} from "./util.js";
import {getTransformSources} from "./runtime/transform.js";
import {createHashMap} from "./hashmap.js";
import {load} from "./load.js";
import {csvParse} from "./dsv.js";

//Data format parsers
let dataParser = {
    "json": function (data, options) {
        //TODO: check for array of values --> convert to array of objects
        return JSON.parse(data); //Parse as json
    },
    "csv": function (data, options) {
        return csvParse(data, options);
    }
};

//Parse data
let parseData = function (data, format) {
    if (typeof format === "undefined" || format === null) {
        return data; //Return data withput format
    }
    //Get format values
    //let parsedData = []; //Parsed data
    if (typeof format === "string" && typeof dataParser[format] !== "undefined") {
        return dataParser[format](data, null); //Return parsed data
    }
    //Check for object and format.type value provided
    else if (isObject(format) && (typeof format.type === "string" && typeof dataParser[format.type] !== "undefined")) {
        return dataParser[format.type](data, format); //Parse and return data
    }
    //Other type --> throw error (TODO)
    return [];
};

//Parse data
export function parseDataSource (props) {
    return parseData(props.value, props.format);
};

//Load and parse a data node
export function loadDataSource (props) {
    return load(props.url).then(function (data) {
        return parseData(data, props.format);
    });
}

//Create data node
export function createDataNode (context, name, props) {
    //Import data from source
    let node = context.addNode({
        "id": `data:${name}`,
        "type": "data",
        "value": [],
        "targets": createHashMap(),
        "props": {}
    });
    //console.log(node);
    //Check the data props
    if (isArray(props.transform) || isObject(props.transform)) {
        Object.assign(node.props, {
            "transform": props.transform
        });
        //Get transform sources and add this data as a target 
        getTransformSources(context, props.transform).forEach(function (source) {
            source.targets.add(node.id, node);
        });
    }
    //Check if this data comes from an input
    if (typeof context.input[name] !== "undefined") {
        Object.assign(node, {
            "source": context.input[name]
        });
        //Add this data as a target
        context.input[name].targets.add(node.id, node);
    }
    //Check if the source is another dataset
    else if (typeof props.source === "string") {
        Object.assign(node, {
            "source": context.data[props.source]
        });
        //Add this data as a target reference of the source data
        context.data[props.source].targets.add(node.id, node);
    }
    else {
        //Other source: throw error
        //TODO
    }
    //Check for transformation to apply to this data
    //updateData(context, data);
    //Save the data to the context object
    context.data[name] = node;
}

//Update data node
export function updateDataNode (context, node) {
    //Check for transforms to this data
    //if (typeof node.props.transform === "object" && node.props.transform !== null) {
    if (typeof node.props.transform !== undefined) {
        Object.assign(node, {
            "value": context.transform(node.source.value, node.props.transform)
        });
    }
    //If no transform to apply:
    else {
        Object.assign(node, {
            "value": node.source.value
        });
    }
}

