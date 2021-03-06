import {getTheme} from "./theme.js";
import {dispatch} from "./dispatch.js";
import {call, error as errorHandler} from "./util.js";
import {createHashMap} from "./hashmap.js";
import {createLogger} from "./logger.js";

import {expression} from "./runtime/expression.js";
import {transform} from "./runtime/transform.js";
import {value} from "./runtime/value.js";
import {source} from "./runtime/source.js";

import {initContext, buildContext, updateContext} from "./lifecycle/index.js";

//Initialize logger
let initializeLogger = function (options) {
    if (typeof options.logger !== "undefined" && options.logger !== null) {
        return options.logger; //Custom logger
    }
    else if (typeof options.logLevel === "number") {
        return createLogger(options.logLevel); //Use the jviz default logger
    }
    //Other value --> use the default jviz logger
    return createLogger();
};

//Context class
export function Context (schema, options) {
    //let self = this;
    //this.scene = createScene(); //Create a new scene
    this.current = {
        "timers": {},
        "state": {},
        "draw": {"width": 0, "height": 0},
        "panel": null
    };
    //Assign context 
    Object.assign(this, {
        "nodes": createHashMap(), //Context data nodes
        "actions": createHashMap(), //To store pending actions to the context
        "target": null, //this.scene.append("g"), //Context target group
        "defs": null, //Context definitions
        "draw": {}, //Draw configuration (width, height and padding)
        "input": {}, //Store the input data
        "state": {}, //State nodes by Ids
        "data": {}, //Data nodes by Ids
        "scales": {}, //Scale nodes by ids
        "legends": {}, //Legend nodes by ids
        "geoms": {}, //Geoms nodes by id
        "forces": null, //Forces node
        //"events": [], //Events nodes
        "panels": null, //Panels configuration
        "theme": null, //Theme definition
        "scene": null, //Scene
        "events": dispatch(), //Events dispatching
        "log": initializeLogger(options), //Logger
        "tooltip": null, //Tooltip handler
        "ready": false,
        "running": false
    });
    //Initialize the context
    initContext(this, schema);
};

//Context methods
Context.prototype = {
    //Lifecycle methods
    "render": function () {
        let context = this;
        //Check if context is running
        if (context.running === true) {
            //TODO: display warning in logs
            return Promise.resolve(null); //Return a resolved promise
        }
        //Check if context has been initialized
        if (context.ready === true) {
            return updateContext(context, false);
        }
        context.running = true; //Disable any update to the context while running
        return buildContext(context).then(function () {
            return updateContext(context, true);
        }).then(function () {
            Object.assign(context, {
                "running": false, //Enable updates run
                "ready": true //Disable build context again
            });
            return Promise.resolve(); //Continue
        });
    },
    //Context runtime
    "value": value,
    "source": source,
    "expression": expression,
    "transform": transform,
    //Miscellanea methods
    "addNode": function (values) {
        //Initialize a new node object
        let newNode = Object.assign({
            "index": this.nodes.length(), //Get node index
            "id": null,
            "type": null,
            "source": null,
            "targets": null, //createNodeList(),
            "value": null,
            "props": null
        }, values);
        //Save this node in the nodes objects
        this.nodes.add(newNode.id, newNode);
        return newNode; //Return the new node object
    },
    "addAction": function (node, value) {
        if (this.actions.has(node.id) === true) {
            //Only update the node with the new value
            return Object.assign(this.actions.get(node.id), {
                "value": value
            });
        }
        //Add a new actions node
        return this.actions.add(node.id, {
            "id": node.id, //This actions has the same id as the node
            "type": "update", //type,
            "target": node,
            "value": value,
            "date": Date.now()
        });
    },
    //Clear all pending actions
    "clearActions": function () {
        return this.actions.clear(); //Clear actions list
    },
    //Add a new timer to the context
    "addTimer": function (name, delay, listener) {
        if (typeof this.current.timers[name] !== "undefined") {
            return; //This timer has been registered and is live
        }
        //Register the timer
        this.current.timers[name] = setInterval(listener, delay);
    },
    //Add a new timer to the context
    "addTimerOnce": function (name, delay, listener) {
        let self = this; //Save this
        if (typeof this.current.timers[name] !== "undefined") {
            return; //This timeout has been registered
        }
        //Register the timeout
        this.current.timers[name] = setTimeout(function () {
            delete self.current.timers[name]; //Remove the timer reference
            return listener(); //Call the listener
        }, delay);
    },
    //Clear timer
    "clearTimer": function (name) {
        if (typeof this.current.timers[name] !== "undefined") {
            clearInterval(this.current.timers[name]); //Stop timeout
            delete this.current.timers[name]; //Remove timeout
        }
    },
    //Remove timer (only remove the reference)
    "removeTimer": function (name) {
        if (typeof this.current.timers[name] !== "undefined") {
            delete this.current.timers[name];
        }
    },
    //Update current state
    "updateCurrentState": function () {
        let context = this;
        Object.keys(context.state).forEach(function (key) {
            context.current.state[key] = context.state[key].value;
        });
    },
    //Error handler
    "error": errorHandler
};

//Create a new context
export function createContext (schema, options) {
    return new Context(schema, options);
}

