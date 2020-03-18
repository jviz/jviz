import {createNode, selectNodes, removeNode} from "./util/nodes.js";
import {Selection} from "./selection.js";

//Scene class
export function Scene () {
    this.node = createNode("svg", null); //Create the scene node
    //this.parent = null; //Parent node
}

//Scene prototype
Scene.prototype = {
    //Set the scene width
    "width": function (value) {
        return this.node.setAttribute("width", value);
    },
    //Set the scene height
    "height": function (value) {
        return this.node.setAttribute("height", value);
    },
    //Calculate the scene size
    "size": function () {
        return this.node.getBoundingClientRect();
    },
    //Mount the scene
    "mount": function (query) {
        let parent = selectNodes(query); //Select parent node
        if (parentNode.nodes.length > 0) {
            parentNode.nodes[0].appendChild(this.node); //Mount 
        }
    },
    //Unmount the scene
    "unmount": function () {
        if (this.node.parentNode !== null) {
            return removeNode(this.node); //Remove node
        }
    },
    //Append a new element to the scene
    "append": function (name) {
        let element = createNode(name, this.node);
        this.node.appendChild(element); //Append the new element
        return new Selection([element], this.node); //Return a selection with the element
    }
};

//Create a new scene
export function createScene () {
    return new Scene();
}

//Check if the provided value is an instance of a scene
export function isScene (value) {
    return value instanceof Scene;
}

