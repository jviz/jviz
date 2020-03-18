//Event emitter component
let EventEmitter = function () {
    this.listeners = {}; //Registered event listeners
};

//Register event emitter methods
EventEmitter.prototype = {
    "addEventListener": function (name, listener) {
        //Register the listener to this event name
        if (typeof listener === "function" && typeof name === "string") {
            if (typeof this.listeners[name] === "undefined") {
                this.listeners[name] = [];
            }
            //Save this event listener
            this.listeners[name].push(listener);
        }
    },
    //Emit a new event
    "dispatchEvent": function (name) {
        if (typeof this.listeners[name] === "undefined") {
            return null; //No listener for this event
        }
        //Convert the arguments to array
        let args = [];
        for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        //Call this event listener with the arguments
        return this.listeners[name].forEach(function (listener) {
            return listener.apply(null, args);
        });
    },
    //Remove an event listener
    "removeEventListener": function (name, listener) {
        if (typeof this.listeners[name] === "undefined") {
            return null; //Nothing to remove
        }
        //Filter the list of event listeners
        this.listeners[name] = this.listeners[name].filter(function (currentListener) {
            return currentListener !== listener;
        });
        //Check the number of listeners
        if (this.listeners[name].length === 0) {
            delete this.listeners[name];
        }
    }
};

//Create an event dispatcher
export function dispatch () {
    return new EventEmitter();
}

