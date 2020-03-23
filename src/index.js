import {colors} from "./color.js";
import {parseSchemaAsync, parseSchemaSync} from "./schema.js";
import {each} from "./util.js";
import {evaluate} from "./evaluate.js";
import {select, selectAll} from "./render/selection.js";
import {createContext} from "./context.js";

//Get or set context values
let getOrSetContextValue = function (self, node, name, value) {
    //Check if node is not defined
    if (typeof node === "undefined" || node === null) {
        throw new Error(`Unknown type "${name}"`); //TODO: improve error
    }
    //Check for no value provided --> return the current node value
    if (typeof value === "undefined") {
        return node.value;
    }
    //Update the data input
    return self.context.addAction(node, value);
};

//Default options
let defaultOptions = {
    "parent": null
};

//Main Jviz instance
let jviz = function (schema, options) {
    //Hack to remove the new operator
    //if (!(this instanceof jviz)) {
    //    return new jviz(schema, options);
    //}
    //TODO: validate options object
    //this.options = options;
    options = Object.assign({}, defaultOptions, options);
    //Create the new viewer context
    this.context = createContext(schema, options);
    //Check for parent component provided
    if (typeof options.parent !== "undefined" && options.parent !== null) {
        this.context.scene.mount(options.parent); //Mount scene
    }
};

//Initialize api methods
jviz.prototype = {
    //Render the plot
    "render": function () {
        return this.context.render();
    },
    //Get or set context state values
    "state": function (name, value) {
        return getOrSetContextValue(this, this.context.state[name], name, value);
    },
    //Get or set the context data
    "data": function (name, value) {
        return getOrSetContextValue(this, this.context.input[name], name, value);
    },
    //Get or set the plot width
    "width": function (value) {
        return getOrSetContextValue(this, this.context.draw.width, "width", value); 
    },
    //Get or set the plot height
    "height": function (value) {
        return getOrSetContextValue(this, this.context.draw.height, "height", value);
    },
    //Get or set the plot padding
    "padding": function (value) {
        return getOrSetContextValue(this, this.context.draw.padding, "padding", value);
    },
    //Register event listener
    "addEventListener": function (name, listener) {
        return this.context.events.addEventListener(name, listener);
    },
    //Remove event listener
    "removeEventListener": function (name, listener) {
        return this.context.events.removeEventListener(name, listener);
    },
    //Destroy the viewer --> unmount the scene and remove listeners
    "destroy": function () {
        this.context.scene.unmount(); //Unmount scene
        //TODO: remove context listeners
    }
};

//Run jviz in async mode
let jvizAsync = function (parent, options) {
    return new Promise(function (resolve, reject) {
        let jvizInstance = new jviz(parent, options); //Create jviz instance
        return resolve(jvizInstance);
    });
};

//Run jviz in sync mode
let jvizSync = function (parent, options) {
    return new jviz(parent, options);
};

//Assign some utils
Object.assign(jvizAsync, {
    "sync": jvizSync,
    "colors": colors,
    "each": each,
    "evaluate": evaluate,
    "parse": parseSchemaAsync,
    "parseSync": parseSchemaSync,
    "select": select,
    "selectAll": selectAll
});

//Export jviz
export default jvizAsync;

