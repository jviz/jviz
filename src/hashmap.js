//Hashmap class
let HashMap = function () {
    this.list = []; //List of nodes
    this.index = {}; //Nodes indexes
};

//Map list prototype
HashMap.prototype = {
    //Get an item from the list by key
    "get": function (key) {
        return (this.has(key) === true) ? this.list[this.index[key]] : null;
    },
    //Check if a key is on this list
    "has": function (key) {
        return typeof this.index[key] !== "undefined";
    },
    //Execute a function for each item in the list
    "forEach": function (callback) {
        return this.list.forEach(callback);
    },
    //Add a new item in the list
    "add": function (key, value) {
        //Check if this node is not in the list
        if (typeof this.index[key] === "undefined") {
            this.list.push(value);
            this.index[key] = this.list.length - 1;
        }
    },
    //Remove an item from the list
    "remove": function (key) {
        //TODO
    },
    //Get the number of items of the node list
    "length": function () {
        return this.list.length;
    },
    //Remove all items from list
    "clear": function () {
        this.list = []; //Clean list of nodes
        this.index = {}; //Clean list of indexes
    }
};

//Create a new hash-map
export function createHashMap () {
    return new HashMap();
}

