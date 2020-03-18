import {colors} from "./color.js";
import {compile} from "./compiler.js";
import {each} from "./util.js";
import {evaluate} from "./evaluate.js";
import {select, selectAll} from "./select/index.js";
import {createContext} from "./context.js";

//Main Jviz instance
let jviz = function (schema, options) {
    //Hack to remove the new operator
    if (!(this instanceof jviz)) {
        return new jviz(schema, options);
    }
    //TODO: validate options object
    this.options = options;
    this.parent = select(options.parent); //Select parent element
    //this.parent.attr("width", props.width);
    //this.parent.svg.attr("height", props.height);
    //let spec = this.options.spec; //TODO: parse specification object
    //Create the new viewer context
    Object.assign(this, {
        "context": createContext(schema, this.parent)
    });
};

//Initialize api methods
jviz.prototype = {
    //Render the plot
    "render": function (callback) {
        return this.context.render(callback);
    },
    //Get or set context values
    "_getOrSetContextValue": function (name, node, value) {
        //Check if node is not defined
        if (typeof node === "undefined") {
            throw new Error(`Unknown type "${name}"`); //TODO: improve error
        }
        //Check for no value provided --> return the current node value
        if (typeof value === "undefined") {
            return node.value;
        }
        //Update the data input
        this.context.createAction(node, value);
        return this;
    },
    //Get or set context state values
    "state": function (name, value) {
        return this._getOrSetContextValue(name, this.context.state[name], value);
    },
    //Get or set the context data
    "data": function (name, value) {
        return this._getOrSetContextValue(name, this.context.input[name], value);
    },
    //Get or set the plot width
    "width": function (value) {
        return this._getOrSetContextValue("width", this.context.draw.width, value); 
    },
    //Get or set the plot height
    "height": function (value) {
        return this._getOrSetContextValue("height", this.context.draw.height, value);
    },
    //Get or set the plot padding
    "padding": function (value) {
        return this._getOrSetContextValue("padding", this.context.draw.padding, value);
    },
    //Register event listener
    "addEventListener": function (name, listener) {
        return this.context.events.addEventListener(name, listener);
    },
    //Remove event listener
    "removeEventListener": function (name, listener) {
        return this.context.events.removeEventListener(name, listener);
    }
};

//Assign some utils
Object.assign(jviz, {
    colors,
    compile,
    each,
    evaluate,
    select,
    selectAll
});

//Export jviz
export default jviz;

