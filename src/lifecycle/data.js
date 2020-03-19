import {isArray, isObject} from "../util.js";
import {getTransformSources} from "../runtime/transform.js";
import {createHashMap} from "../hashmap.js";

//Create data node
export function createDataNode (context, name, props) {
    //Import data from source
    let node = context.createNode(`data:${name}`, {
        "id": `data:${name}`,
        "type": "data",
        "value": [],
        "targets": createHashMap(),
        "props": {}
    });
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

