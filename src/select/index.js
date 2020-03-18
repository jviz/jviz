import {getNamespace} from "./namespaces.js";
import {Selection} from "./selection.js";
import {selectNodes} from "./nodes.js";

//Select the first element
export function select (selector) {
    let selection = selectNodes(selector, null);
    //Get only the first node
    let firstNode = (selection.nodes.length === 0) ? [] : [selection.nodes[0]];
    return new Selection(firstNode, selection.root);
}

//Select all elements
export function selectAll (selector) {
    let selection = selectNodes(selector, null);
    //Return a new instance for the selected nodes
    return new Selection(selection.nodes, selection.root, null);
}

