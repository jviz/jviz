import {clamp} from "./math.js";

//Log levels
export const logLevels = {
    "none": 0,
    "error": 1,
    "warn": 2,
    "info": 3,
    "debug": 4,
    "all": 5
};

//Default log handler
let defaultLogHandler = function (method, level, message) {
    if (level >= logLevels[method]) {
        return console[method].call(console, message);
    }
};

//Logger class
let Logger = function (level, handler) {
    this.setLevel(level); //Set log level
    this.setHandler(handler); //Set log handler
};

//Logger prototype
Logger.prototype = {
    "setLevel": function (newLevel) {
        this.level = (typeof newLevel === "number") ? clamp(newLevel, 0, 5) : 3;
    },
    "setHandler": function (newHandler) {
        this.handler = (typeof newHandler === "function") ? newHandler : defaultLogHandler;
    },
    //Error log
    "error": function (message) {
        return this.handler("error", this.level, message);
    },
    //Warning log
    "warn": function (message) {
        return this.handler("warn", this.level, message);
    },
    //Info log
    "info": function (message) {
        return this.handler("info", this.level, message);
    },
    //Debug log
    "debug": function (message) {
        return this.handler("debug", this.level, message);
    }
};

//Create the logger
export function createLogger (level, handler) {
    return new Logger(level, handler);
}

