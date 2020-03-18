import {isArray, isObject, values as objectValues, each} from "../util.js";
import {json} from "../load.js";
import {createNodeList} from "../node.js";
import {parsePadding} from "../parser.js";
//import {createStateNode, updateStateNode} from "./state.js";
import {createDataNode, updateDataNode} from "./data.js";
import {createScaleNode, updateScaleNode} from "./scale.js";
//import {buildLayout, updateLayout} from "./layout.js";
import {createShapeNode, updateShapeNode} from "./shape.js";
import {createAxisNode, updateAxisNode} from "./axes.js";

//Update the context
export function updateContext (context, forceUpdate, callback) {
    //Check for no pending updates
    if (context.actions.length === 0 && forceUpdate === false) {
        //TODO: display in context logs
        return callback();
    }
    let updateList = createNodeList(); //We will store all changed nodes on this list
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
                updateList.add(targetNode);
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
    }
    //Loop for all nodes
    context.nodes.forEach(function (node) {
        //Check if this node is not in the update list
        if (updateList.has(node) === false && forceUpdate === false) {
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
            updateShapeNode(context, node, updateList.has(node.source) || forceUpdate);
        }
        //Add the targets nodes of the current node ot the list of nodes to update
        //We will ensure that all targets of the updated nodes will be visited.
        if (node.targets !== null && forceUpdate === false) {
            return node.targets.forEach(function (targetNode) {
                updateList.add(targetNode);
            });
        }
    });
    context.actions = []; //Remove the actions list
    return callback();
}

//Build the context
export function buildContext (context, callback) {
    //Sources to import
    let sources = Object.keys(context.input).filter(function (key) {
        let node = context.input[key];
        return node.props !== null && typeof node.props.url === "string";
    });
    //Method for importing data async
    let loadDataAsync = function (index) {
        if (index >= sources.length) {
            return updateContext(context, true, callback);
        }
        //Get input name
        let name = sources[index];
        //Import data
        return json(context.input[name].props.url, function (response) {
            //Check for error loading data
            //TODO
            //Save this data to the sources cache
            context.input[name].value = response.content;
            //Continue
            return loadDataAsync(index + 1);
        });
    };
    //Start laoding data
    return loadDataAsync(0);
};

//Initialize the context
export function initContext (context, schema) {
    //Save padding/width and height values from props
    context.draw = {
        "width": context.createNode({
            "id": "draw:width",
            "value": schema["width"],
            "targets": createNodeList(),
            "type": "width"
        }),
        "height": context.createNode({
            "id": "draw:height",
            "value": schema["height"],
            "targets": createNodeList(),
            "type": "height"
        }),
        "padding": context.createNode({
            "id": "draw:padding",
            "value": parsePadding(schema["padding"]),
            "targets": createNodeList(),
            "type": "padding"
        }),
        "computed": null //Computed width and height
    };
    //Initialize input data
    each(schema.data, function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        //Check for value data --> save the values in a new node
        if (isArray(props["value"])) {
            context.input[name] = context.createNode({
                "id": `input:${name}`,
                //"type": "input",
                "value": props["value"], //Save the data values
                "targets": createNodeList()
            });
        }
        //Check for data to be imported from url --> save the url
        else if (typeof props["url"] === "string") {
            context.input[name] = context.createNode({
                "id": `input:${name}`,
                //"type": "input",
                "props": {
                    "url": props["url"] //Save the url to load the data
                },
                "value": [], //Empty values list
                "targets": createNodeList()
            });
        }
    });
    //Initialize state nodes
    each(schema.state, function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        context.state[name] = context.createNode({
            "id": `state:${name}`,
            "value": props["value"],
            "targets": createNodeList(),
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
    context.target.empty();
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

