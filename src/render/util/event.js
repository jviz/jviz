import {isString, values as objectValues} from "../../util.js";

//Tooltip event names
export const tooltipShowEvent = "mouseenter";
export const tooltipMoveEvent = "mousemove";
export const tooltipHideEvent = "mouseleave";

//Basic events list
export const basicEventTypes = {
    "click": "click", //Click to an element
    "dblclick": "dblclick", // Double click to an element
    "clickdown": "mousedown", // The mouse button is pressed
    "clickup": "mouseup", // The mouse button is released
    "enter": "mouseenter", // the pointer enters in the element
    "leave": "mouseleave", // the pointer leaves the element
    "move": "mousemove" // the pointer is moving over the element
};

//Get relative event position
export function getRelativeEventPosition (context, event) {
    let scene = context.scene.element; //get scene
    let size = scene.size(); //Get scene size
    //console.log(`${event.clientX} - ${event.clientY}`);
    //console.log(`${scene.nodes[0].clientLeft} - ${scene.nodes[0].clientTop}`);
    return {
        "x": event.clientX - scene.nodes[0].clientLeft - size.left,
        "y": event.clientY - scene.nodes[0].clientTop - size.top
    };
};

//Parse event
export function parseEvent (context, event) {
    let scene = context.scene.element; //get scene
    //let client = context.scene.client(); //Get scene client
    let size = scene.size(); //Get scene size
    //console.log(`${event.clientX} - ${event.clientY}`);
    //console.log(`${scene.nodes[0].clientLeft} - ${scene.nodes[0].clientTop}`);
    let x = event.clientX - scene.nodes[0].clientLeft- size.left;
    let y = event.clientY - scene.nodes[0].clientTop- size.top;
    let hw = context.draw.width.value / 2;
    let hh = context.draw.height.value / 2;
    //Return parsed event
    return {
        //"x": x - context.draw.padding.value.left,
        //"y": y - context.draw.padding.value.top,
        "sceneX": x,
        "sceneY": y,
        "quarter": (x <= hw) ? ((y <= hh) ? "tl" : "bl") : ((y <= hh) ? "tr" : "br")
    };
}

//Events configuration
let eventTargetsList = ["geom","panel","legend","scene"]; //TODO: add state
let eventTypesList = Object.keys(basicEventTypes).concat(["drag"]); //TODO: add update event

//Parse event target filter
let parseEventTargetFilter = function (value) {
    if (typeof value !== "string") {
        return null; //Select all items from the scope
    }
    //Check for multiple selection
    if (value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") {
        return value.slice(1, value.length - 1).split(",").map(function (v) {
            return v.trim(); //Remove spaces
        });
    }
    //Other value --> return as a single element
    return [value];
};

//Parse event selector
export function parseEventSelector (context, props) {
    //Check for on property provided
    if (!isString(props.on) || props.on === "") {
        return context.error("Invalid or empty event selector provided"); //No matching nodes
    }
    let selector = props.on + ""; //Get selector string
    let items = []; //Selector parsed items
    let regex = /^([a-z]+)\:([a-z]+)(?:\@(\{[^\}]+\}|[\w\+\-]+))?(?:\s*\,\s*)?/;
    let match = null; //Initialize match
    while ((match = regex.exec(selector)) !== null) {
        let type = match[1]; //Get event type
        let target = match[2].toLowerCase(); //Get target element
        let filter = []; //(isString(match[3]) && match[3].length > 0) ? match[3] : [];
        if (!isString(type) || eventTypesList.indexOf(type) === -1) {
            return context.error(`Unexpected event type '${type}'`);
        }
        if (eventTargetsList.indexOf(target) === -1) {
            return context.error(`Unexpected event target '${target}'. Candidates are: '${eventTargets.join("','")}'`);
        }
        //Parse target filter
        if (isString(match[3]) && match[3].length > 0) {
            let v = match[3]; //Get filter value
            filter = (v.charAt(0) !== "{") ? [v] : v.replace("{", "").replace("}", "").split(",");
        }
        ////Check for valid combination of target+eventType
        //if (eventType === "update" && target !== "state") {
        //    return cb(new Error(`Update event can not be assigned to '${target}' scopes. Only 'state' are allowed.`), []);
        //}
        //if (eventType !== "update" && target === "state") {
        //    return cb(new Error(`State targets can not be attached to '${eventType}' events.`), []);
        //}
        //if (eventType === "drag" && target !== "panel" && target !== "scene") {
        //    return cb(new Error(`Drag events can not be assigned to '${target}'. Only 'panel' or 'scene' are allowed.`), []);
        //}
        //Add the event item
        items.push({"target": target, "filter": filter, "type": type});
        //Remove the match from the selector
        selector = selector.slice(match[0].length).trim();
    }
    //Check if there are more characters in the selector
    if (selector.trim().length > 0) {
        return context.error(`Unexpected identifier '${selector.trim()}' in event selector`);
    }
    //Check for duplicated targets
    let itemsIndex = {}; //Initialize items index
    items.forEach(function (item) {
        let index = `${item.type}-${item.target}` + ((item.filter.length === 0) ? "-empty" : ""); //Generate item index
        if (typeof itemsIndex[index] === "undefined" || item.filter.length === 0) {
            itemsIndex[index] = item; //Save this item
            return; //Continue with the next item
        }
        //Add the target filter to the list
        let filterIndex = {};
        itemsIndex[index].filter.forEach(function (v) {
            filterIndex[v] = true; //First save initial filter values
        });
        item.filter.forEach(function (v) {
            filterIndex[v] = true; //Then save new filter values
        });
        //Update the filter list
        itemsIndex[index].filter = Object.keys(filterIndex);
    });
    //TODO: validate event items
    //Return items
    return objectValues(itemsIndex);
}


