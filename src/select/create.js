import {getNamespace, extractNamespace} from "./namespaces.js";

//Node creator
export function nodeCreator (tag, root) {
    //Get the uri namespace of the root element
    let rootNamespace = root.namespaceURI;
    let parsedTag = extractNamespace(tag);
    //Check if the namespace has been defined in the node tag
    if (parsedTag.space !== null) {
        return function () {
            return document.createElementNS(parsedTag.space, parsedTag.tag);
        };
    }
    //Check the namespace of the root element
    else if (rootNamespace !== getNamespace("xhtml")) {
        return function () {
            return document.createElementNS(rootNamespace, tag);
        };
    }
    //By default, create the node without a namespace
    return function () {
        return document.createElement(tag);
    };
}

