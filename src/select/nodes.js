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
        "root": (typeof root !== "undefined" && root !== null) ? root : document
    };
    //Check if the selector is a instance of html elements or node list
    if (isValidElement(selector) === true || selector instanceof NodeList) {
        selection.nodes = selector.length > 1 ? [].slice.call(selector) : [selector];
    }
    //If selector is an string
    else if (typeof selector === "string") {
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

