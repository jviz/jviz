import {isObject} from "../util.js";
import {createNode, selectNodes, removeNode} from "./util/nodes.js";
import {select, Selection} from "./selection.js";
import {setStyle} from "./style.js";

//Scene style parameters
let sceneStyles = ["background", "fontFamily", "fontSize"];

//Mount an scene
export function mountScene (context, query) {
    let element = context.scene.element.nodes[0]; //Get scene node
    let parent = selectNodes(query); //Select parent node
    if (parent.nodes.length > 0) {
        parent.nodes[0].appendChild(element); //Mount 
    }
}

//Unmount the scene
export function unmountScene (context) {
    let element = context.scene.element.nodes[0]; //Get scene node
    if (element.parentNode !== null) {
        return removeNode(element); //Remove node
    }
}

//Create a scene node
export function createSceneNode (context, index, props) {
    let theme = context.theme; //Get theme reference
    let node = context.addNode({
        "id": "scene",
        "type": "scene",
        "element": select(createNode("svg", null)),
        "value": (isObject(props)) ? props : {}
    });
    //Initialize scene attributes
    node.element.attr("width", "0px").attr("height", "0px");
    //Set scene style
    //TODO: this should be moved to updateSceneNode when scene style updates where allowed
    sceneStyles.forEach(function (name) {
        setStyle(node.element, name, (typeof node.value[name] === "string") ? node.value[name] : theme[name]);
    });
    //Add this node as a dependency of the width and height nodes
    context.draw.width.targets.add(node.id, node);
    context.draw.height.targets.add(node.id, node);
    //Save this node as the context scene
    context.scene = node;
}

//Update a scene node
export function updateSceneNode (context, node) {
    node.element.attr("width", context.draw.width.value); //Update width
    node.element.attr("height", context.draw.height.value); //Update height
}


