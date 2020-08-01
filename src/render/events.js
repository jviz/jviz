import {isString, isObject, toArray} from "../util.js";
import {getRelativeEventPosition, parseEventSelector} from "./util/event.js";
import {basicEventTypes} from "./util/event.js";
import {getPanelsLayout} from "./panels.js";
import {getLegendScale} from "./legends.js";

//Register an event listener to the provided element
export function setEvent (context, element, name, parser, listener) {
    //Check for basic event
    if (typeof basicEventTypes[name] !== "undefined") {
        return element.on(basicEventTypes[name], function (event) {
            let parsedEvent = parser(context, event); //Parse this event
            if (parsedEvent === null) {
                return; //Not valid event --> ignore this event
            }
            //Call the listener with the parsed event and the native event
            return listener(Object.assign(parsedEvent, {
                "nativeEvent": event //Assign native event
            }));
        });
    }
    //Check for drag event
    else if (name === "drag") {
        return element.on("mousedown", function (e) {
            let parsedEvent = parser(context, e); //Parse the event
            if (parsedEvent === null) {
                return; //Not valid event --> ignore this event
            }
            //Handle drag event
            let handleDragListener = function (e) {
                let event = parser(context, e);
                //Check for null event --> remove listeners
                if (event === null) {
                    context.scene.element.off("mousemove", handleDragListener);
                    context.scene.element.off("mouseup", removeDragListener);
                    return; //Exit
                }
                //Assign event attributes
                event = Object.assign(event, {
                    "deltax": event.x - parsedEvent.x,
                    "deltay": event.y - parsedEvent.y,
                    "dragx": parsedEvent.x,
                    "dragy": parsedEvent.y,
                    "nativeEvent": e //Add native event
                });
                return listener(event); //Call the listener
            };
            //Remove drag listener
            let removeDragListener = function () {
                context.scene.element.off("mousemove", handleDragListener);
                context.scene.element.off("mouseup", removeDragListener);
            };
            //Add event listeners
            context.scene.element.on("mousemove", handleDragListener);
            context.scene.element.on("mouseup", removeDragListener);
        });
    }
    //Other event --> display error
    return context.error(`Unknown event '${name}'`);
};

//Should ignore the event
let shouldIgnoreEvent = function (event, filter) {
    if (typeof filter !== "string" || filter === "") {
        return false; //No filter provided
    }
    //Check for shift key filter
    else if (filter === "event.shiftKey" && event.shiftKey === true) {
        return false; //shift key is pressed
    }
    //Other value --> ignore the event
    return true
};

//Convert an event position to scene position
let parseSceneEvent = function (context, event) {
    return getRelativeEventPosition(context, event);
};

//Register scene event
let registerSceneEvent = function (context, node, selector, listener) {
    let element = context.scene.element; //Target element
    return setEvent(context, element, selector.type, parseSceneEvent, function (event) {
        return listener(event); //Nothing to do --> call the listener
    });
};

//Convert an event position to panel position
let parsePanelEvent = function (context, panel, event) {
    let px = context.draw.outerMargin.value.left + panel.left; //Get panel x position
    let py = context.draw.outerMargin.value.top + panel.top; //Get panel y position
    let pos = getRelativeEventPosition(context, event); //Get position
    //Validate the position
    if (pos.x < px || pos.y < py || px + panel.width < pos.x || py + panel.height < pos.y) {
        return null; //Event outside
    }
    //Return the parsed event value
    return Object.assign(pos, {
        "panelx": pos.x - px, 
        "panely": pos.y - py, 
        "panelindex": panel.index
    });
};

//Register panel events
let registerPanelEvent = function (context, node, selector, listener) {
    //let panels = []; //Initialize panels
    let panelsIndexes = {};
    selector.filter.forEach(function (value) {
        return getPanelsLayout(context, value).forEach(function (item) {
            panelsIndexes[item.index] = true; //Register with the panel index
        });
    });
    //Get unique list of panels
    let panels = Object.keys(panelsIndexes);
    //Register an event for each panel
    //console.log(panels);
    return panels.forEach(function (index) {
        let element = context.scene.element; //Target element
        //Event parser method for this specific panel
        let eventParser = function (context, e) {
            return parsePanelEvent(context, context.panels.value.panels[index], e);
        };
        //Register the event
        return setEvent(context, element, selector.type, eventParser, function (event) {
            return listener(event); //Nothing more to do
        });
    });
};

//Parse geom event
let parseGeomEvent = function (context, e) {
    //console.log(e.target);
    let target = e.target; //Get target element
    let panelIndex = parseInt(target.dataset.geomPanel);
    if (isNaN(panelIndex) || typeof panelIndex !== "number" || panelIndex < 1) {
        return null; //Undefined panel --> ignore this event
    }
    //Parse the event using the panel event parser
    let event = parsePanelEvent(context, context.panels.value.panels[panelIndex - 1], e);
    if (event === null) {
        return null; //Ignore this event
    }
    //Return parsed event
    return Object.assign(event, {"datum": null});
};

//Register geoms events
let registerGeomEvent = function (context, node, selector, listener) {
    return selector.filter.forEach(function (name) {
        let elements = context.target.selectAll(`[data-geom-name='${name}']`);
        return setEvent(context, elements, selector.type, parseGeomEvent, listener);
    });
};

//Parse legend event
let parseLegendEvent = function (context, event) {
    //let target = event.target; // Get target element
    let name = event.target.dataset["legendName"]; //Get legend name
    let index = parseInt(event.target.dataset["legendIndex"]); //Get legend index
    //let value = event.target.dataset["legendValue"];
    let scale = getLegendScale(context, name); //Get scale related to this legend
    if (scale === null || typeof scale === "undefined") {
        return null; //Scale not available
    }
    let value = scale.domain[index]; //Get legend related value
    return (typeof value === "undefined") ? null : {
        "legendname": name,
        "legendindex": index,
        "legendvalue": value
    };
};

//Register legend event
let registerLegendEvent = function (context, node, selector, listener) {
    return selector.filter.forEach(function (name) {
        //console.log(`rect[data-legend-name='${name}']`);
        let elements = context.scene.element.selectAll(`rect[data-legend-name='${name}']`); //Select all legend masks
        return setEvent(context, elements, selector.type, parseLegendEvent, function (event) {
            return listener(event);
        });
    });
};

//Events register
let registerEvent = {
    "scene": registerSceneEvent,
    "panel": registerPanelEvent,
    "geom": registerGeomEvent,
    "legend": registerLegendEvent
};

//Create an event node
export function createEventNode (context, index, props) {
    let node = context.addNode({
        "id": `event:${index}`,
        "type": "event",
        "targets": null, //createHashMap(),
        "selectors": parseEventSelector(context, props),
        "props": props
    });
    //Find dependencies
    //console.log(node.selectors);
    node.selectors.forEach(function (item) {
        //Check for geom target --> add this node as a target for all geons
        if (item.target === "geom") {
            //let names = (item.filter === null) ? Object.keys(context.geoms) : item.targetFilter;
            item.filter.forEach(function (name) {
                if (typeof context.geoms[name] === "undefined") {
                    return context.log.warn(`Unknown geom with name '${name}'. Skipping this name.`);
                }
                //Assign this event to the geom targets
                context.geoms[name].targets.add(node.id, node);
            });
        }
        //Check for legend target --> add this node as a target for the legend
        else if (item.target === "legend") {
            item.filter.forEach(function (name) {
                if (typeof context.legends[name] === "undefined") {
                    return context.log.warn(`Unknown legend with name '${name}'. Skipping this name.`);
                }
                //Assign this event to the geom targets
                context.legends[name].targets.add(node.id, node);
            });
        }
        //Check for panel target
        //else if (item.target === "panel") {
        //    context.panels.targets.add(node);
        //}
        //TODO: check for legend target
        //Other target --> ignore
    });
};

//Update an event node
export function updateEventNode (context, node) {
    console.log(`Update event '${node.id}'`);
    let updateState = (typeof node.props.update !== "undefined") ? toArray(node.props.update) : []; //Get update states
    updateState = updateState.filter(function (update) {
        return isObject(update) && isString(update.value) && isString(update.state);
    });
    //Register events
    return node.selectors.forEach(function (selector) {
        return registerEvent[selector.target](context, node, selector, function (event) {
            if (event === null) {
                return; //Ignore this event
            }
            //Process this event
            //console.log(event);
            updateState.forEach(function (update) {
                //Register an action to update this state
                let stateNode = context.state[update.state];
                if (typeof stateNode === "undefined") {
                    //TODO: throw error
                    return;
                }
                let newValue = context.expression(update.value, {"datum": null, "event": event});
                context.addAction(stateNode, newValue); //Register action
                //Trigger a render update
                context.addTimeout("events", 10, function () {
                    context.removeTimeout("events"); //Remove timeout
                    return context.render(); //Call the render method
                });
                //context.render();
            });
            //Check for fire this event to the api
            if (isString(node.props.fire)) {
                return context.events.dispatchEvent(node.props.fire, event);
            }
        });
    });
}


