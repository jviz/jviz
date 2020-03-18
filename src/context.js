import {dispatch} from "./dispatch.js";
import {call} from "./util.js";
import {initContext, buildContext, updateContext} from "./lifecycle/index.js";
import {createNode} from "./node.js";
import {createAction} from "./actions.js";
import {expression} from "./runtime/expression.js";
import {transform} from "./runtime/transform.js";
import {value} from "./runtime/value.js";
import {source} from "./runtime/source.js";

//Context class
export function Context (schema, parent) {
    //let self = this;
    //Assign context 
    Object.assign(this, {
        "nodes": [], //Context data nodes
        "target": parent.append("g"), //Context target group
        "draw": {}, //Draw configuration (width, height and padding)
        "input": {}, //Store the input data
        "state": {}, //State nodes by Ids
        "data": {}, //Data nodes by Ids
        "scales": {}, //Scale nodes by ids
        "layout": null, //Layout node
        "events": dispatch(), //Events dispatching
        "ready": false,
        "running": false,
        "actions": []  //To store pending actions to the context
    });
    //Initialize the context
    initContext(this, schema);
};

//Context methods
Context.prototype = {
    //Lifecycle methods
    "render": function (callback) {
        let context = this;
        //Check if context is running
        if (context.running === true) {
            //TODO: display warning in logs
            return null;
        }
        //Check if context has been initialized
        if (context.ready === true) {
            //console.warn("viewer is already initialized. Call update() method to re-render the view");
            return updateContext(context, false, function () {
                return call(callback, null, []); //Call the provided callback function
            });
        }
        context.running = true; //Disable any update to the context while running
        return buildContext(context, function () {
            Object.assign(context, {
                "running": false, //Enable updates run
                "ready": true //Disable build context again
            });
            return call(callback, null, []);
        });
    },
    //Context runtime
    "value": value,
    "source": source,
    "expression": expression,
    "transform": transform,
    //Miscellanea methods
    "createNode": createNode,
    "createAction": createAction
};

//Create a new context
export function createContext (target, props) {
    return new Context(target, props);
}

