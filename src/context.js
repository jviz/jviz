import {dispatch} from "./dispatch.js";
import {call} from "./util.js";
import {initContext, buildContext, updateContext} from "./lifecycle/index.js";
import {createHashMap} from "./hashmap.js";
import {expression} from "./runtime/expression.js";
import {transform} from "./runtime/transform.js";
import {value} from "./runtime/value.js";
import {source} from "./runtime/source.js";
import {createScene} from "./render/scene.js";

//Context class
export function Context (schema, options) {
    //let self = this;
    this.scene = createScene(); //Create a new scene
    //Assign context 
    Object.assign(this, {
        "nodes": createHashMap(), //Context data nodes
        "actions": createHashMap(), //To store pending actions to the context
        "target": this.scene.append("g"), //Context target group
        "draw": {}, //Draw configuration (width, height and padding)
        "input": {}, //Store the input data
        "state": {}, //State nodes by Ids
        "data": {}, //Data nodes by Ids
        "scales": {}, //Scale nodes by ids
        "events": dispatch(), //Events dispatching
        "ready": false,
        "running": false
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
    "addAction": function (node, type, value) {
        if (this.actions.has(node.id) === true) {
            //Only update the node with the new value
            return Object.assign(this.actions.get(node.id), {
                "value": value
            });
        }
        //Add a new actions node
        return this.actions.add(node.id, {
            "id": node.id, //This actions has the same id as the node
            "type": type,
            "target": node,
            "value": value,
            "date": Date.now()
        });
    },
    //Clear all pending actions
    "clearActions": function () {
        return this.actions.clear(); //Clear actions list
    }
};

//Create a new context
export function createContext (schema, options) {
    return new Context(schema, options);
}

