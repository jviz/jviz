//Node unique list
let NodeUniqueList = function () {
    this.list = []; //List of nodes
    this.index = {}; //Nodes indexes
};

//Node unique list prototype
NodeUniqueList.prototype = {
    //Get a node by index
    "get": function (index) {
        return this.list[index];
    },
    //Check if a node is on this list
    "has": function (node) {
        if (typeof node !== "object" || node === null) {
            return false; //Terrible hack for preventing null nodes
        }
        return typeof this.index[node.id] !== "undefined";
    },
    //Execute a function for each node in the list
    "forEach": function (callback) {
        return this.list.forEach(callback);
    },
    //Add a new node to the list
    "add": function (node) {
        //Check if this node is not in the list
        if (typeof this.index[node.id] === "undefined") {
            this.list.push(node);
            this.index[node.id] = this._list.length - 1;
        }
    },
    //Remove a node item from the list
    "remove": function (node) {
        //TODO
    },
    //Get the number of items of the node list
    "length": function () {
        return this.list.length;
    },
    //Remove all nodes from list
    "empty": function () {
        this.list = []; //Clean list of nodes
        this.index = {}; //Clean list of indexes
    }
};

//Create a new node list
export function createNodeList () {
    return new NodeUniqueList();
}

