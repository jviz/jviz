import {nodeCreator} from "./create.js";
import {emptyNode, selectNodes, removeNode} from "./nodes.js";

//Selection class
export class Selection {
    constructor(nodes, root) {
        this.nodes = nodes;
        this.root = root;
        //this.data = (typeof data === "object") ? data : null;
    }
    //Iterate over the nodes of the selection
    each(callback) {
        for (let i = 0; i < this.nodes.length; i++) {
            callback.call(this.nodes[i], this, i);
        }
        return this;
    }
    //Set or get an attribute for each node
    attr(name, value) {
        //Check for undefined value to set --> get the current attribute value
        if (typeof value === "undefined") {
            if (this.nodes.length === 0) {
                return null;
            }
            //Return the attribute value only of the first node
            return this.nodes[0].getAttribute(name);
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
    }
    //Add a class name to all nodes
    addClass() {
        let list = arguments;
        return this.each(function () {
            this.classList.add.apply(this.classList, list);
        });
    }
    //Remove a class-name from all nodes
    removeClass() {
        let list = arguments;
        return this.each(function () {
            this.classList.remove.apply(this.classList, list);
        });
    }
    //Set the style of all nodes
    style(name, value) {
        //Check for undefined value to set --> get the current attribute value
        if (typeof value === "undefined") {
            if (this.nodes.length === 0) {
                return null;
            }
            //Return the style value of the first node
            return this.nodes[0].style.getPropertyValue(name);
        }
        //Set the value for each node in the selection
        return this.each(function (self, index) {
            //Check no value to set
            if (value === null) {
                this.style.removeProperty(name);
            }
            //Check if value is a function 
            else if (typeof value === "function") {
                this.style.setProperty(name, value.call(this, self.getData(index)));
            }
            //String value --> set this style value
            else {
                this.style.setProperty(name, value);
            }
        });
    }
    //Get the size of the first element
    size() {
        if (this.nodes.length > 0) {
            let bb = this.nodes[0].getBoundingClientRect();
            return {
                "width": bb.width,
                "height": bb.height
            };
        }
        //No nodes on the selection
        return null;
    }
    //Register element listeners
    on(name, listener) {
        return this.each(function () {
            this.addEventListener(name, listener, false);
        });
    }
    //Remove all children element of the selection
    empty() {
        return this.each(function () {
            return emptyNode(this);
        });
    }
    //Set the text of the elements
    text(content) {
        return this.each(function () {
            this.textContent = content;
        });
    }
    //Set the html of the selected elements
    html(content) {
        return this.each(function () {
            this.innerHTML = content;
        });
    }
    //Remove the selection
    remove() {
        return this.each(function () {
            return removeNode(this);
        });
    }
    //Append a new DOM element
    append(name) {
        let parent = (this.nodes.length > 0) ? this.nodes[0] : this.root;
        let node = nodeCreator(name, parent)();
        parent.appendChild(node);
        //Return a new selection instance
        return new Selection([node], parent);
    }
    //Select all children nodes that matches the specified pattern
    selectAll(selector) {
        //Get the root element
        let rootElement = (this.nodes.length === 0) ? this.root : this.nodes[0];
        let selection = selectNodes(selector, rootElement);
        //Return a new selection instance with the selected nodes list and the root element
        return new Selection(selection.nodes, selection.root);
    }
    //Get or set the dataset
    dataset(key, value) {
        if (typeof value === "undefined") {
            if (this.nodes.length === 0) {
                return null;
            }
            //Return the current dataset value
            return this.nodes[0].dataset[key];
        }
        //Update the dataset of each selected node
        return this.each(function () {
            //Check for null dataset value
            if (value === null) {
                delete this.dataset[key];
            }
            else {
                this.dataset[key] = value;
            }
        });
    }
    //Execute a function for each item in the data object
    call(data, callback) {
        let self = this;
        //Execute the callback function for each item in the provided object
        data.forEach(function (item, index) {
            callback.call(null, self, item, index);
        });
        return this;
    }
}

