//Basic events list
let basicEvents = {
    "click": "click", //Click to an element
    "doubleClick": "dblclick", // Double click to an element
    "clickDown": "mousedown", // The mouse button is pressed
    "clickUp": "mouseup", // The mouse button is released
    "enter": "mouseenter", // the pointer enters in the element
    "leave": "mouseleave", // the pointer leaves the element
    "move": "mousemove" // the pointer is moving over the element
};

//Combined events
let combinedEvents = {
    "drag": function (element, listener) {
        //This event is acthive while the user clicks on the element and moves over it. 
        //The event is finished when the mouse button is released
        let active = false;
        //Register the mouse down event listener --> start listening to move event
        element.on("mousedown", function () {
            active = true;
        });
        //Register the mouse move event lsitener --> call the listener function
        element.on("mousemove", function (event) {
            if (active === true) {
                //event.preventDefault();
                return listener(event); //Call only the listener if the event is active
            }
        });
        //Register the mouse up listener --> stop listening to move event
        element.on("mouseup", function () {
            active = false;
        });
        //TODO: add the mouse leave listener to stop listening to the move event
    }
};

//Register an event listener to the provided element
export function setEvent (element, name, listener) {
    //Check for basic event
    if (typeof basicEvents[name] !== "undefined") {
        return element.on(basicEvents[name], listener);
    }
    //Check for combined events
    else if (typeof combinedEvents[name] !== "undefined") {
        return combinedEvents[name](element, listener); //Register the combined event
    }
    //Other --> unknown event
    //TODO: throw error
}

//Check for provided event listener
export function isEventName (name) {
    return typeof basicEvents[name] !== "undefined" || typeof combinedEvents[name] !== "undefined";
}

