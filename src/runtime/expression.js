import {isNull, isValid, isUndef} from "../util.js";
import {isArray, isObject, isString, isNumber, isBool} from "../util.js";
//import {createHashMap} from "../hashmap.js";
import {clamp, random, format, log} from "../math.js";
import {polarToCartesianX, polarToCartesianY} from "../math.js";
import {evaluate} from "../evaluate.js";
import {nest as nestObject, range as rangeOf} from "../util.js";
import {sum, average} from "../util.js";
import {truncate, capitalize, repeat, pad} from "../util.js";
import {camelCase, snakeCase, kebabCase} from "../util.js";

//Recursive execute a function for each match of the provided regex
let matchRegex = function (str, regexp, callback) {
    let matches = null;
    while((matches = regexp.exec(str)) !== null) {
        callback(matches);
    }
};

//Default values
let defaultValues = {
    //Math constants
    "PI": Math.PI,
    "E": Math.E,
    //Utility functions
    "if": function (condition, trueValue, falseValue) {
        return condition === true ? trueValue : falseValue;
    },
    //Math functions
    "sqrt": Math.sqrt,
    "abs": Math.abs,
    "round": Math.round,
    "floor": Math.floor,
    "ceil": Math.ceil,
    //"random": Math.random,
    "exp": Math.exp,
    "min": Math.min,
    "max": Math.max,
    "cos": Math.cos,
    "sin": Math.sin,
    "polarToCartesianX": polarToCartesianX,
    "polarToCartesianY": polarToCartesianY,
    "clamp": clamp,
    "random": random,
    "format": format,
    "log": log,
    "ln": Math.log,
    "log10": Math.log10,
    "log2": Math.log2,
    //Array OR string methods
    "lengthOf": function (value) {
        return value.length;
    },
    "valueOf": function (items, index) {
        return (typeof items[index] !== "undefined") ? items[index] : null;
    },
    "reverse": function (value) {
        return isString(value) ? valuesplit("").reverse().join("") : value.slice().reverse();
    },
    //Array methods
    "rangeOf": rangeOf,
    "sum": sum,
    "indexOf": function (array, value) {
        return array.indexOf(value);
    },
    "average": average,
    //Object methods
    "nest": nestObject,
    //String methods
    "truncate": truncate,
    "pad": pad,
    "repeat": repeat,
    "capitalize": capitalize,
    "camelCase": camelCase,
    "kebabCase": kebabCase,
    "snakeCase": snakeCase,
    //General
    "isString": isString,
    "isNumber": isNumber,
    "isBool": isBool,
    "isNull": isNull,
    "isObject": isObject,
    "isArray": isArray,
    "isUndef": isUndef,
    "isValid": isValid
};

//Evaluate the provided expression
export function expression (expr, values) {
    let context = this;
    //Evaluate the provided expression
    return evaluate(expr, Object.assign(defaultValues, values, {
        "draw": {
            "width": context.panels.value.width,
            "height": context.panels.value.height,
            "margin": context.draw.margin.value,
            "outerMargin": context.draw.outerMargin.value
        },
        "state": function (name) {
            return context.state[name].value;
        },
        "data": function (name) {
            return context.data[name].value; //Return the data value
        },
        "scale": function (name, a, b) {
            //TODO: use b value (if provided) only for interval scales
            return context.scales[name].value(a);
        },
        "invert": function (name, a) {
            //NOTE THAT THIS ONLY WORKS FOR CONTINUOUS SCALES
            return context.scales[name].value.invert(a); //Apply scale invert
        }
    }));
}

//Get expression sources
export function getExpressionSources (context, expr) {
    let sources = []; //createNodeList();
    //Find state|data|scale calls in the expression
    matchRegex(expr, /(state|data|scale|invert)\('([^']*)'/g, function (matches) {
        //Example: expr = "state('aaaa') + 1"
        //match[0] --> full match group: state('aaaa'
        //match[1] --> source type: state
        //match[2] --> source name: aaaa
        let sourceType = matches[1];
        let sourceName = matches[2];
        //Check if the source type is a scale or invert --> rename to scales instead
        if (sourceType === "scale" || sourceType === "invert") {
            sourceType = "scales";
        }
        //Check if this node is defined --> return the source node
        if (typeof context[sourceType][sourceName] !== "undefined") {
            sources.push(context[sourceType][sourceName]);
        }
    });
    //Find draw dependencies
    matchRegex(expr, /draw\.(width|height|margin|outerMargin)/g, function (matches) {
        sources.push(context.draw[matches[1]]); //Add the draw source 
    });
    //Return sources
    return sources;
}

