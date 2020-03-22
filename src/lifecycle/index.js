import {isArray, isObject, values as objectValues, each} from "../util.js";
import {load} from "../load.js";
import {createHashMap} from "../hashmap.js";
import {parsePadding} from "../render/padding.js";
import {createDataNode, updateDataNode} from "./data.js";
import {createScaleNode, updateScaleNode} from "./scale.js";
import {createShapeNode, updateShapeNode} from "./shape.js";
import {createAxisNode, updateAxisNode} from "./axes.js";

//Parse size value
let parseSizeValue = function (value) {
    if (typeof value === "undefined" || value === null) {
        return 0; //Default size value
    }
    //Return parsed value
    return parseInt(value);
};

//Update the context
export function updateContext (context, forceUpdate, callback) {
    //Check for no pending updates
    if (context.actions.length() === 0 && forceUpdate === false) {
        //TODO: display in context logs
        return callback();
    }
    let updateList = createHashMap(); //We will store all changed nodes on this list
    let recomputeDraw = forceUpdate === true; //Recompute the drawing values
    //Apply each change to the state object
    context.actions.forEach(function (action) {
        let node = action.target;
        //Update the value
        if (node.type === "padding") {
            node.value = parsePadding(action.value); //Parse padding value
            recomputeDraw = true; //We should recompute the draw width and height
        }
        else {
            node.value = action.value; //Update the node value
            if (node.type === "height" || node.type === "width") {
                recomputeDraw = true;
            }
        }
        //updateList.add(node); //Changed node --> add to changes list
        //Add all targets nodes of this changed item
        if (node.targets !== null) {
            node.targets.forEach(function (targetNode) {
                updateList.add(targetNode.id, targetNode);
            });
        }
    });
    //Check for no nodes to update
    if (updateList.length() === 0 && forceUpdate === false) {
        //TODO: display in logs
        return callback();
    }
    //Updated the computed plot width and height
    if (recomputeDraw === true) {
        let padding = context.draw.padding.value;
        context.draw.computed = {
            "width": context.draw.width.value - padding.left - padding.right,
            "height": context.draw.height.value - padding.top - padding.bottom
        };
        //Apply the new padding values
        context.target.attr("transform", `translate(${padding.left},${padding.top})`);
        //Update the scene size
        context.scene.width(context.draw.width.value); //Update scene width
        context.scene.height(context.draw.height.value); //Update scene height
    }
    //Loop for all nodes
    context.nodes.forEach(function (node) {
        //Check if this node is not in the update list
        if (updateList.has(node.id) === false && forceUpdate === false) {
            return null;
        }
        //Nodes that we will update: data|scale|axis|shape
        if (node.type === "data") {
            updateDataNode(context, node);
        }
        else if (node.type === "scale") {
            updateScaleNode(context, node);
        }
        //else if (node.type === "layout") {
        //    updateLayout(context, node);
        //}
        else if (node.type === "axis") {
            updateAxisNode(context, node);
        }
        else if (node.type === "shape") {
            //If the shape source data has changed we will force a re-rendering
            //If not, we will call only the update props of this shape
            updateShapeNode(context, node, (node.source !== null && updateList.has(node.source.id)) || forceUpdate);
        }
        //Add the targets nodes of the current node ot the list of nodes to update
        //We will ensure that all targets of the updated nodes will be visited.
        if (node.targets !== null && forceUpdate === false) {
            return node.targets.forEach(function (targetNode) {
                updateList.add(targetNode.id, targetNode);
            });
        }
    });
    context.actions.clear(); //Reset the actions list
    return callback();
}

//Build the context
export function buildContext (context, callback) {
    //Sources to import
    let sources = Object.keys(context.input).filter(function (key) {
        let node = context.input[key];
        return node.props !== null && typeof node.props.url === "string";
    });
    //console.log(sources);
    //Method for importing data async
    let loadDataAsync = function (index) {
        if (index >= sources.length) {
            return updateContext(context, true, callback);
        }
        //Get input name
        let name = sources[index];
        //Import data
        return load(context.input[name].props.url).then(function (data) {
            //Save this data to the sources cache
            context.input[name].value = JSON.parse(data); //TODO: convert the data type
            //Continue
            return loadDataAsync(index + 1);
        }).catch(function (error) {
            //TODO: manage error
            console.error(error);
        });
    };
    //Start laoding data
    return loadDataAsync(0);
};

//Initialize the context
export function initContext (context, schema) {
    //Save padding/width and height values from props
    context.draw = {
        "width": context.addNode({
            "id": "draw:width",
            "value": parseSizeValue(schema["width"]),
            "targets": createHashMap(),
            "type": "width"
        }),
        "height": context.addNode({
            "id": "draw:height",
            "value": parseSizeValue(schema["height"]),
            "targets": createHashMap(),
            "type": "height"
        }),
        "padding": context.addNode({
            "id": "draw:padding",
            "value": parsePadding(schema["padding"]),
            "targets": createHashMap(),
            "type": "padding"
        }),
        "computed": null //Computed width and height
    };
    //Initialize input data
    each(schema.data, function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        //Check for data to be imported from url --> save the url
        if (typeof props["url"] === "string") {
            context.input[name] = context.addNode({
                "id": `input:${name}`,
                "props": props,
                //"type": "input",
                "value": [], //Empty values list
                "targets": createHashMap()
            });
        }
        //Check for value data --> save the values in a new node
        else if (isArray(props["value"])) {
            context.input[name] = context.addNode({
                "id": `input:${name}`,
                "value": props["value"], //Save the data values
                //"type": "input",
                "targets": createHashMap()
            });
        }
    });
    //Initialize state nodes
    each(schema.state, function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        context.state[name] = context.addNode({
            "id": `state:${name}`,
            "value": props["value"],
            "targets": createHashMap(),
            "type": "state"
        });
        //createStateNode(context, name, stateProps);
    });
    //Build data props
    each(schema.data, function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        createDataNode(context, name, props);
    });
    //Build scale props
    each(schema.scales, function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        createScaleNode(context, name, props);
    });
    //Clean svg target group
    //context.target.empty();
    //Render all shapes
    each(schema.shapes, function (index, props) {
        createShapeNode(context, context.target.append("g"), props, index);
    });
    //Draw all axes
    each(schema.axes, function (index, props) {
        createAxisNode(context, context.target.append("g"), props, index);
    });
    //console.log(context);
}

