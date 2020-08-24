import {isArray, isObject, values as objectValues, each} from "../util.js";
import {createHashMap} from "../hashmap.js";
import {getTheme} from "../theme.js";
import {createTooltip} from "../render/tooltip.js";
import {loadDataSource, parseDataSource} from "../data.js";

import {createDataNode, updateDataNode} from "../data.js";
import {createScaleNode, updateScaleNode} from "../scales/index.js";
import {createGeomNode, updateGeomNode} from "../render/geoms/index.js";
import {createAxisNode, updateAxisNode} from "../render/axes.js";
import {createPanelsNode, updatePanelsNode} from "../render/panels.js";
import {createLegendNode, updateLegendNode, updateLegendPosition} from "../render/legends.js";
import {createSceneNode, updateSceneNode} from "../render/scene.js";
import {createTitleNode, updateTitleNode} from "../render/title.js";
import {createEventNode, updateEventNode} from "../render/events.js";
import {createForceNode, updateForceNode} from "../forces/index.js";

import {parseSizeValue} from "./parsers.js";
import {parseBackgroundValue} from "./parsers.js";
import {parseMarginValue} from "./parsers.js";

//Update updaters
let nodeUpdate = {
    "data": updateDataNode,
    "scale": updateScaleNode,
    "axis": updateAxisNode,
    "panels": updatePanelsNode,
    "legend": updateLegendNode,
    "scene": updateSceneNode,
    "title": updateTitleNode,
    "event": updateEventNode,
    "force": updateForceNode
};

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
                node.value = parseMarginValue(action.value, 0); //Parse margin value
                recomputeDraw = true; //We should recompute the draw width and height
            }
            //Check for scene node type --> update the style
            else if (node.type === "scene") {
                //TODO
            }
            //Other node type
            else {
                node.value = action.value; //Update the node value
                if (node.type === "height" || node.type === "width") {
                    recomputeDraw = true; //Recompute draw and height
                }
            }
            //updateList.add(node); //Changed node --> add to changes list
            //Add all targets nodes of this changed item
            if (isObject(node.targets)) {
                node.targets.forEach(function (targetNode) {
                    updateList.add(targetNode.id, targetNode);
                });
            }
        });
        //Check for recompute draw
        if (recomputeDraw === true) {
            let outerMargin = context.draw.outerMargin.value; //Get outer margins
            let margin = context.draw.margin.value; //Get internal margins
            //Update the current drawing values
            Object.assign(context.current.draw, {
                "width": context.draw.width.value - outerMargin.left - outerMargin.right - margin.left - margin.right,
                "height": context.draw.height.value - outerMargin.top - outerMargin.bottom - margin.top - margin.bottom
            });
            //Translate the main group
            context.target.attr("transform", `translate(${outerMargin.left},${outerMargin.top})`);
        }
        //Update the current state 
        context.updateCurrentState();
        //Object.keys(context.state).forEach(function (stateName) {
        //    context.current.state[stateName] = context.state[stateName].value;
        //});
        //Check for no nodes to update
        if (updateList.length() === 0 && forceUpdate === false) {
            //TODO: display in logs
            return resolve();
        }
        //Loop for all nodes
        context.nodes.forEach(function (node) {
            context.current.panel = null; //Remove current panel
            //Check if this node is not in the update list
            if (updateList.has(node.id) === false && forceUpdate === false) {
                return null;
            }
            //Nodes that we will update: data|panels|scale|axis|legend
            if (typeof nodeUpdate[node.type] === "function") {
                nodeUpdate[node.type](context, node);
                //Add the targets nodes of the current node ot the list of nodes to update
                //We will ensure that all targets of the updated nodes will be visited.
                if (forceUpdate === false && isObject(node.targets)) {
                    return node.targets.forEach(function (targetNode) {
                        updateList.add(targetNode.id, targetNode);
                    });
                }
            }
            //Update geom node
            else if (node.type === "geom") {
                //If the geom source data has changed we will force a re-rendering
                //If not, we will call only the update props of this shape
                let forceGeomUpdate = node.source !== null && updateList.has(node.source.id);
                updateGeomNode(context, node, forceGeomUpdate || forceUpdate);
                //Add sources for the geom node only if force update is enabled
                if ((forceGeomUpdate || forceUpdate) && isObject(node.targets)) {
                    return node.targets.forEach(function (targetNode) {
                        updateList.add(targetNode.id, targetNode);
                    });
                }
            }
        });
        updateLegendPosition(context); //Fix legend nodes
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
            //return load(context.input[name].props.url).then(function (data) {
            return loadDataSource(context.input[name].props).then(function (data) {
                context.input[name].value = data; //Save this data to the sources cache
                return loadDataAsync(index + 1); //Continue
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
        //Internal margins
        "margin": context.addNode({
            "id": "draw:margin",
            "value": parseMarginValue(schema["margin"], 0),
            "targets": createHashMap(),
            "type": "margin"
        }),
        //Outer margins
        "outerMargin": context.addNode({
            "id": "draw:outer-margin",
            "value": parseMarginValue(schema["outerMargin"], 0),
            "targets": createHashMap(),
            "type": "outerMargin"
        })
    };
    //Create the scene node
    createSceneNode(context, null, schema["style"]);
    context.target = context.scene.element.append("g"); //Add context target group
    context.defs = context.scene.element.append("defs"); //Add defs container
    createTooltip(context, null, {}); //Create the tooltip parent
    //Initialize input data
    each(schema["data"], function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        //Check for data to be imported from url --> save the props object with the url
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
                "value": parseDataSource(props), //Parse and save the data values
                "props": null,
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
        context.current.state[name] = context.state[name].value; //Save the value reference
    });
    //Build data props
    each(schema["data"], function (index, props) {
        let name = (typeof props["name"] === "string") ? props["name"] : index;
        createDataNode(context, name, props);
    });
    //Create panels node
    createPanelsNode(context, schema["panels"]);
    //Create force node
    if (typeof schema["forces"] !== "undefined" && schema["forces"] !== null) {
        createForceNode(context, schema["forces"]);
    }
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
    //Render all legends
    each(schema["legends"], function (index, props) {
        createLegendNode(context, index, props);
    });
    //Register event nodes
    each(schema["events"], function (index, props) {
        createEventNode(context, index, props);
    });
    //Add title node
    createTitleNode(context, null, schema["title"]);
    //console.log(context);
}

