import {createNode, emptyNode, selectNodes, removeNode} from "./util/nodes.js";
import {getNamespace} from "./util/namespaces.js";

//Selection class
export function Selection (nodes, root) {
    this.nodes = nodes;
    this.root = root;
    this.length = nodes.length;
};

//Selection prototype
Selection.prototype = {
    //Iterate over the nodes of the selection
    "each": function (callback) {
        for (let i = 0; i < this.nodes.length; i++) {
            callback.call(this.nodes[i], this, i);
        }
        return this;
    },
    //Set an attribute for each node
    "attr": function (name, value) {
        //Check for undefined value to set --> get the attribute value of the first item
        if (typeof value === "undefined") {
            return (this.length === 0) ? null : this.nodes[0].getAttribute(name);
        }
        //Set the value for each node in the selection
        return this.each(function (self, index) {
            //Check for null value --> remove this attribute
            if (value === null) {
                this.removeAttribute(name);
            }
            //Check if the value is a function
            else if (typeof value === "function") {
                this.setAttribute(name, value.call(this, null, index));
            }
            //String value --> set this attribute
            else {
                this.setAttribute(name, value);
            }
        });
    },
    //Set the style of all nodes
    "style": function (name, value) {
        //Check for undefined value to set --> nothing to do
        if (typeof value === "undefined") {
            return this;
        }
        //Set the value for each node in the selection
        return this.each(function (self, index) {
            //Check no value to set
            if (value === null) {
                this.style.removeProperty(name);
            }
            //String value --> set this style value
            else if (typeof value === "string") {
                this.style.setProperty(name, value);
            }
        });
    },
    //Get the size of the first element
    "size": function () {
        if (this.nodes.length > 0) {
            let bb = this.nodes[0].getBoundingClientRect();
            return {
                "width": bb.width,
                "height": bb.height
            };
        }
        //No nodes on the selection
        return null;
    },
    //Register element listeners
    "on": function (name, listener) {
        return this.each(function () {
            this.addEventListener(name, listener, false);
        });
    },
    //Remove an event listener
    "off": function (name, listener) {
        return this.each(function () {
            this.removeEventListener(name, listener, false);
        });
    },
    //Remove all children element of the selection
    "empty": function () {
        return this.each(function () {
            return emptyNode(this);
        });
    },
    //Set the text of the elements
    "text": function (content) {
        return this.each(function () {
            this.textContent = content;
        });
    },
    //Set the html of the selected elements
    "html": function (content) {
        return this.each(function () {
            this.innerHTML = content;
        });
    },
    //Remove the selection
    "remove": function () {
        return this.each(function () {
            return removeNode(this);
        });
    },
    //Append a new DOM element
    "append": function (name) {
        let parent = (this.nodes.length > 0) ? this.nodes[0] : this.root;
        let node = createNode(name, parent);
        parent.appendChild(node);
        //Return a new selection instance
        return new Selection([node], parent);
    },
    //Select all children nodes that matches the specified pattern
    "selectAll": function (selector) {
        //Get the root element
        let rootElement = (this.nodes.length === 0) ? this.root : this.nodes[0];
        let selection = selectNodes(selector, rootElement);
        //Return a new selection instance with the selected nodes list and the root element
        return new Selection(selection.nodes, selection.root);
    }
};

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

