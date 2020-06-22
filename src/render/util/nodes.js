import {getNamespace, extractNamespace} from "./namespaces.js";

//Check if a selector is an html/svg node element
//https://developer.mozilla.org/en-US/docs/Web/API/Element
let isValidElement = function (selector) {
    //Valid instances:
    //selector instanceof HTMLElement
    //selector instanceof SVGElement
    return selector instanceof Element;
};

//Select nodes of the dom
export function selectNodes (selector, root) {
    //Initialize the output nodes selection
    let selection = {
        "nodes": [],
        "root": root //(typeof root !== "undefined" && root !== null) ? root : document
    };
    //Check if the selector is a instance of html elements or node list
    if (isValidElement(selector) === true || selector instanceof NodeList) {
        selection.nodes = selector.length > 1 ? [].slice.call(selector) : [selector];
    }
    //If selector is an string
    else if (typeof selector === "string" && typeof root !== "undefined" && root !== null) {
        selection.nodes = [].slice.call(selection.root.querySelectorAll(selector));
    }
    //Return the selected nodes and the root node element
    return selection;
}

//Get parent of a node
export function parentNode (node) {
    return node.parentNode;
}

//Remove a node
export function removeNode (node) {
    return node.parentNode.removeChild(node);
}

//Remove all children of a dom node
export function emptyNode (node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

//Create a new node
export function createNode (tag, root) {
    let parsedTag = extractNamespace(tag);
    //Check if the namespace has been defined in the node tag
    if (parsedTag.space !== null) {
        return document.createElementNS(parsedTag.space, parsedTag.tag);
    }
    //Check the namespace of the root element
    else if (typeof root !== "undefined" && root !== null) {
        let rootNamespace = root.namespaceURI; //Get the uri namespace of the root element
        if (rootNamespace !== getNamespace("xhtml")) {
            return document.createElementNS(rootNamespace, tag);
        }
    }
    //By default, create the node without a namespace
    return document.createElement(tag);
}

