import {isArray, isObject, values as objectValues, each} from "../util.js";
import {load} from "../load.js";
import {createHashMap} from "../hashmap.js";
import {getTheme} from "../theme.js";

import {createDataNode, updateDataNode} from "../data.js";
import {createScaleNode, updateScaleNode} from "../scales/index.js";
import {createGeomNode, updateGeomNode} from "../render/geoms/index.js";
import {createAxisNode, updateAxisNode} from "../render/axes.js";
import {createPanelsNode, updatePanelsNode} from "../render/panels.js";

import {parseSizeValue} from "./parsers.js";
import {parseBackgroundValue} from "./parsers.js";
import {parseMarginValue} from "./parsers.js";

//Update the context
export function updateContext (context, forceUpdate) {
    return new Promise(function (resolve, reject) {
        //Check for no pending updates
        if (context.actions.length() === 0 && forceUpdate === false) {
            //TODO: display in context logs
            return resolve();
        }
        let updateList = createHashMap(); //We will store all changed nodes on this list
        let recomputeDraw = forceUpdate === true; //Recompute the drawing values
        //Apply each change to the state object
        context.actions.forEach(function (action) {
            let node = action.target;
            //Update the margins
            if (node.type === "margin" || node.type === "outerMargin") {
                node.value = parseMarginValue(action.value); //Parse margin value
                recomputeDraw = true; //We should recompute the draw width and height
            }
            //Update the background
            else if (node.type === "background") {
                node.value = parseBackgroundValue(action.value, context.theme);
                //TODO: update scene background
                context.scene.background(node.value); //Update scene background
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
            return resolve();
        }
        //Updated the computed plot width and height
        if (recomputeDraw === true) {
            //let margin = context.draw.margin.value;
            let outerMargin = context.draw.outerMargin.value;
            //context.draw.computed = {
            //    "width": context.draw.width.value - margin.left - margin.right,
            //    "height": context.draw.height.value - margin.top - margin.bottom
            //};
            //Apply the new padding values
            context.target.attr("transform", `translate(${outerMargin.left},${outerMargin.top})`);
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
            //Nodes that we will update: data|panels|scale|axis|shape
            if (node.type === "data") {
                updateDataNode(context, node);
            }
            else if (node.type === "panels") {
                updatePanelsNode(context, node); //Update the panels node
            }
            else if (node.type === "scale") {
                updateScaleNode(context, node);
            }
            else if (node.type === "axis") {
                updateAxisNode(context, node);
            }
            else if (node.type === "geom") {
                //If the geom source data has changed we will force a re-rendering
                //If not, we will call only the update props of this shape
                updateGeomNode(context, node, (node.source !== null && updateList.has(node.source.id)) || forceUpdate);
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
        return resolve();
    });
}

//Build the context
export function buildContext (context) {
    //Sources to import
    let sources = Object.keys(context.input).filter(function (key) {
        let node = context.input[key];
        return node.props !== null && typeof node.props.url === "string";
    });
    return new Promise(function (resolve, reject) {
        //console.log(sources);
        //Method for importing data async
        let loadDataAsync = function (index) {
            if (index >= sources.length) {
                //return updateContext(context, true, callback);
                return resolve(); //Continue
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
                //console.error(error);
                return reject(error);
            });

        };
        //Start laoding data
        loadDataAsync(0);
    });
};

//Initialize the context
export function initContext (context, schema) {
    context.theme = getTheme(schema["theme"]); //Get context theme
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
        //Background color
        "background": context.addNode({
            "id": "draw:background",
            "value": parseBackgroundValue(schema["background"], context.theme),
            "targets": null,
            "type": "background"
        }),
        //Internal margins
        "margin": context.addNode({
            "id": "draw:margin",
            "value": parseMarginValue(schema["margin"]),
            "targets": createHashMap(),
            "type": "margin"
        }),
        //Outer margins
        "outerMargin": context.addNode({
            "id": "draw:outer-margin",
            "value": parseMarginValue(schema["outerMargin"]),
            "targets": createHashMap(),
            "type": "outerMargin"
        })
    };
    //Initialize input data
    each(schema["data"], function (index, props) {
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
        else if (isArray(props["value"]) && typeof props["source"] !== "string") {
            context.input[name] = context.addNode({
                "id": `input:${name}`,
                "value": props["value"], //Save the data values
                //"type": "input",
                "targets": createHashMap()
            });
        }
    });
    //Initialize state nodes
    each(schema["state"], function (index, props) {
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
    each(schema["data"], function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        createDataNode(context, name, props);
    });
    //Create panels node
    createPanelsNode(context, schema["panels"]);
    //Build scale props
    each(schema["scales"], function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        createScaleNode(context, name, props);
    });
    //Draw all axes
    each(schema["axes"], function (index, props) {
        createAxisNode(context, index, props);
    });
    //Render all geoms
    each(schema["geoms"], function (index, props) {
        createGeomNode(context, index, props);
    });
    //console.log(context);
}

