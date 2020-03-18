//Create a plot node item
export function createNode (initialValues) {
    let context = this;
    //Initialize a new node object
    let newNode = {
        "index": context.nodes.length,
        "id": null,
        "type": null,
        "source": null,
        "targets": null, //createNodeList(),
        "value": null,
        "props": null
    };
    Object.assign(newNode, initialValues);
    //Save this node in the nodes objects
    context.nodes.push(newNode);
    //Return the new node object
    return newNode;
}

//Node unique list
let NodeUniqueList = function () {
    Object.assign(this, {
        "_list": [],
        "_index": {}
    });
};

//Node unique list prototype
NodeUniqueList.prototype = {
    //Get a node by index
    "get": function (index) {
        return this._list[index];
    },
    //Check if a node is on this list
    "has": function (node) {
        if (node === null) {
            return false; //Terrible hack for preventing null nodes
        }
        return typeof this._index[node.id] !== "undefined";
    },
    //Execute a function for each node in the list
    "forEach": function (callback) {
        return this._list.forEach(callback);
    },
    //Add a new node to the list
    "add": function (node) {
        //Check if this node is not in the list
        if (typeof this._index[node.id] === "undefined") {
            this._list.push(node);
            this._index[node.id] = this._list.length - 1;
        }
    },
    //Remove a node item from the list
    "remove": function (node) {
        //TODO
    },
    //Get the number of items of the node list
    "length": function () {
        return this._list.length;
    }
};

//Create a new node list
export function createNodeList () {
    return new NodeUniqueList();
}

