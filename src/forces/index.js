import {isNumber, isString} from "../util.js";
import {createHashMap} from "../hashmap.js";
import {updateGeomNode} from "../render/geoms/index.js";
import {getValueSources} from "../runtime/value.js";

import {linkForce, parseLinkForceProps} from "./link.js";
import {nodeForce, parseNodeForceProps} from "./node.js";
import {centerForce, parseCenterForceProps} from "./center.js";

//Available forces
let forces = {
    "link": {"force": linkForce, "propsParse": parseLinkForceProps},
    "node": {"force": nodeForce, "propsParse": parseNodeForceProps},
    "center": {"force": centerForce, "propsParse": parseCenterForceProps}
};

//Forces default props
let defaultProps = {
    "nodes": null, //Name of the data to get nodes
    "links": null, //Name of the data to get links
    "restart": false,
    "static": false, //Render as static graph
    "iterations": 100, //Number of iterations for static forces
    "delay": 50,
    "alpha": 0.9,
    "alphaTarget": 0,
    "alphaDecay": 0.05,
    "alphaMin": 0.05,
    "x": {"expr": "draw.wdith / 2"},
    "y": {"expr": "draw.height / 2"},
    "forces": []  //Forces to apply
};

//Run the simulation
let runSimulation = function (context, simulation, data) {
    simulation.alpha = simulation.alpha + (simulation.alphaTarget - simulation.alpha) * simulation.alphaDecay;
    //console.log(`Running simulation with alpha '${simulation.alpha}'`);
    //Reset the forces of each node
    data.nodes = data.nodes.map(function (node) {
        return Object.assign(node, {"forcex": 0, "forcey": 0});
    });
    //Apply each force
    simulation.forces.forEach(function (props) {
        return forces[props.type].force(context, simulation, data, props);
    });
    //Apply the forces and move the nodes
    data.nodes.forEach(function (node) {
        //Check if this node has been selected
        if (isNumber(node.fx) && isNumber(node.fy)) {
            return Object.assign(node, {"x": node.fx, "y": node.fy}); 
        }
        //Calculate the velocity values to apply
        node.vx = (node.vx + node.forcex) * simulation.alpha;
        node.vy = (node.vy + node.forcey) * simulation.alpha;
        //Move the node
        node.x = node.x + node.vx;
        node.y = node.y + node.vy;
    });
    //Check if we should stop the simulation
    return simulation.alpha < simulation.alphaMin;
    //return stopSimulation;
};

//Create a force node
export function createForceNode (context, props) {
    let node = context.addNode({
        "id": "force",
        "type": "force",
        "targets": createHashMap(),
        "props": props,
        "value": {
            "nodes": [], "links": [], 
            "alpha": defaultProps.alpha, //Current alpha value
            "alphaTarget": null, //Current alpha target of the simulation
            "running": null //To store if simulation is running
        },
    });
    //Check for no nodes data
    if (typeof props.nodes !== "string") {
        return context.error("Forces needs at least a nodes data source");
    }
    else if (typeof context.data[props.nodes] === "undefined") {
        return context.error(`Undefined dataset with the name '${props.nodes}'`);
    }
    //Add nodes source as a dependency
    context.data[props.nodes].targets.add(node.id, node); //Add forces as a dependency
    //Add links as a dependency
    if (typeof props.links === "string") {
        if (typeof context.data[props.links] === "undefined") {
            return context.error(`Undefined dataset with the name '${props.links}'`);
        }
        context.data[props.links].targets.add(node.id, node); //Add forces as a dependency
    }
    //Add dependencies from forces and other values
    Object.keys(props).forEach(function (key) {
        if (key === "nodes" || key === "links" || key === "forces") {
            return null; //Nothing to add from here
        }
        //Get value sources
        getValueSources(context, props[key]).forEach(function (source) {
            return source.targets.add(node.id, node);
        });
    });
    //Register the force node
    context.forces = node;
};

//Update the force node --> reload force values
export function updateForceNode (context, node) {
    //Check for restarting the simulation
    let shouldRestart = context.value(node.props.restart, null, defaultProps.restart);
    //let isStatic = context.value(node.props.static, null, defaultProps.static);
    if (shouldRestart === false && node.value.running !== null) {
        return; //We should not restart the simulation
    }
    //Verify if the alpha value is lower than the new alpha target
    let newAlphaTarget = context.value(node.props.alphaTarget, null, defaultProps.alphaTarget);
    let newAlphaMin = context.value(node.props.alphaMin, null, defaultProps.alphaMin);
    if (newAlphaTarget === node.value.alphaTarget && node.value.alpha < newAlphaMin) {
        return; //Nothing to do
    }
    context.clearTimer("forces"); //Stop the current timer (if any)
    //Initialize nodes
    let nodesIndex = {}; //To store idexes of each node
    let initialAngle = Math.PI * (3 - Math.sqrt(5));
    let initialRadius = 50;
    let centerx = context.current.draw.width / 2;
    let centery = context.current.draw.height / 2;
    node.value.nodes = context.data[node.props.nodes].value.map(function (datum, index) {
        let name = isString(node.props.key) ? datum[node.props.key] : datum["id"]; //Get node name
        nodesIndex[name] = index; //Save the index to this node
        datum = Object.assign(datum, {"vx": 0, "vy": 0}); //Reset velocity
        //if (isNumber(datum.x) && isNumber(datum.y) && isNumber(datum.vx) && isNumber(datum.vy)) {
        if (isNumber(datum.x) && isNumber(datum.y)) {
            return datum; //Only reset the velocity
        }
        //Return the datum with the initial force values
        let radius = initialRadius * Math.sqrt(index) * 0.8;
        let angle = index * initialAngle;
        return Object.assign(datum, {
            "x": parseInt(centerx + radius * Math.cos(angle)), 
            "y": parseInt(centery + radius * Math.sin(angle))
        });
    });
    //Check for links data
    if (typeof node.props.links === "string") {
        node.value.links = context.data[node.props.links].value.map(function (datum, index) {
            if (typeof datum.source === "undefined" || typeof datum.target === "undefined" || datum.source === datum.target) {
                return context.error(`Invalid link with index '${index}'`);
            }
            //Check for unknown or invalid source node
            if (typeof nodesIndex[datum.source] === "undefined") {
                return context.error(`Unknown node source '${datum.source}' at link with index '${index}'`);
            }
            //Check for unknown or invalid target node
            if (typeof nodesIndex[datum.target] === "undefined") {
                return context.error(`Unknown node target '${datum.target}' at link with index '${index}'`);
            }
            //Assign link values
            return Object.assign({}, datum, {
                "source": node.value.nodes[nodesIndex[datum.source]],
                "target": node.value.nodes[nodesIndex[datum.target]]
            });
        });
    }
    //Initialize the simulation object
    //let alphaDefault = context.value(node.props.alpha, null, defaultProps.alpha); //Get default alpha
    console.log("Start alpha ---> " + node.value.alpha);
    let simulation = {
        "alpha": node.value.alpha, //Get current alpha
        "alphaTarget": newAlphaTarget, //context.value(node.props.alphaTarget, null, defaultProps.alphaTarget),
        "alphaMin": newAlphaMin, //context.value(node.props.alphaMin, null, defaultProps.alphaMin),
        "alphaDecay": context.value(node.props.alphaDecay, null, defaultProps.alphaDecay),
        "forces": node.props.forces.map(function (props) {
            //return Object.assign({}, props, foces[props.type].parseProps(context, props));
            return forces[props.type].propsParse(context, props);
        }),
        "geoms": [] //Geoms to update
    };
    node.value.alphaTarget = simulation.alphaTarget; //Save current alpha target
    //console.log(simulation);
    //Check for static simulation (TODO)
    //Register the timer for running the simulation
    node.value.running = true; //Simulation is running
    simulation.geoms = node.targets.filter(function (node) {
        return node.type === "geom"; //Get only geoms
    });
    return context.addTimer("forces", defaultProps.delay, function () {
        let shouldStopSimulation = runSimulation(context, simulation, node.value); //Run the simulation
        node.value.alpha = simulation.alpha; //Update alpha value
        //Check if we shoud stop the simulation
        if (shouldStopSimulation === true) {
            node.value.running = false; //Simulation is not running
            context.clearTimer("forces"); //Stop timer
            console.log("Stop alpha --> " + node.value.alpha);
            console.log("simulation finished");
        }
        //Terrible hack to update geoms outside the context lifecycle
        //TODO: use the context lifecycle instead
        return simulation.geoms.forEach(function (geomNode) {
            return updateGeomNode(context, geomNode, false);
        });
    });
};


