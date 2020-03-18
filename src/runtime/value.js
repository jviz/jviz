import {isArray, nest as nestObject} from "../util.js";
import {colors} from "../color.js";
import {getExpressionSources} from "./expression.js";

//Get value from context
export function value (props, datum, defaultValue) {
    let context = this;
    //Check for undefined proeprty value
    if (typeof props === "undefined") {
        return defaultValue;
    }
    //Check if the props is a function
    //if (typeof props === "function") {
    //    return props.call(null, context, datum);
    //}
    //Check for non object or null props
    else if (typeof props !== "object" || props === null) {
        return props;
    }
    //Check if props is an array: multiple choice
    else if (isArray(props) === true) {
        //Check all conditions
        for (let i = 0; i < props.length; i++) {
            if (typeof props[i] === "object" && props[i] !== null) {
                //Check if test entry has beel provided
                if (typeof props[i].test === "string") {
                    //Check if this item does not passes the test
                    if (context.expression(props[i].test, {"datum": datum}) !== true) {
                        continue;
                    }
                }
            }
            //Return this value
            return context.value(props[i], datum, null);
        }
        //Exit loop: throw error
        //TODO
        return null;
    }
    //Get the initial value
    let value = datum; //defaultValue;
    //let value = (typeof props.field === "string") ? viz.object.get(datum, props.field) : datum;
    //Check for color value
    if (typeof props.color === "string") {
        value = (typeof colors[props.color] === "string") ? colors[props.color] : props.color;
    }
    //Check for expression value
    else if (typeof props.expr === "string") {
        value = context.expression(props.expr, {
            "datum": datum
        });
    }
    //Check for custom value provided
    else if (typeof props.value !== "undefined" && props.value !== null) {
        value = props.value;
    }
    //Check for value from draw context
    else if (typeof props.draw === "string") {
        value = context.draw.computed[props.draw]; //Get computed width or height value
    }
    //Check for value from state
    else if (typeof props.state === "string") {
        let keys = props.state.replace(/\[["']?(\w+)['"]?\]/g, ".$1").replace(/^\./, "").split(".");
        let stateName = keys.shift(); // <-- Extract state name
        //value = object.get(context.state, props.state);
        value = nestObject(context.state[stateName].value, keys.join("."));
    }
    //Check for field value
    else if (typeof props.field === "string") {
        value = nestObject(datum, props.field); //TODO: fix this
    }
    //Check for scale to apply to the current value
    if (typeof props.scale === "string") {
        let scale = context.scales[props.scale].value;
        //let value = (typeof props.field === "string") ? viz.object.get(datum, props.field) : datum;
        //Get the scaled value
        //value = scale(value);
        //Check for interval scale and position property provided
        if (scale.type === "interval" && typeof props.interval === "number") {
            value = scale(value) + scale.step * props.interval;
        }
        //Other scale type: apply the scale to the current value
        else {
            value = scale(value);
        }
        //Return the scaled value
        //return value;
    }
    //Check to apply a layout transformation
    else if (typeof props.layout === "string" && context.layout !== null) {
        //let layoutID = (datum !== null) ? datum[props.layout] : props.layout;
        //TODO: think about better ways to do that
        value = context.layout.value(datum[props.layout], value);
    }
    //Return the value
    return value;
}

//Get value source
export function getValueSources (context, value) {
    let sources = [];
    //Check if value is not an object
    if (typeof value !== "object" || value === null) {
        return []; //No sources
    }
    //Check for array --> test value: parse each test key and each value key
    else if (isArray(value) === true) {
        value.forEach(function (item) {
            //Get the sources on the test expression
            if (typeof item.test === "string") {
                getExpressionSources(context, item.test).forEach(function (source) {
                    sources.push(source);
                });
            }
            //Parse the sources on this item
            getValueSources(context, item).forEach(function (source) {
                sources.push(source);
            });
        });
        //Return the sources
        return sources;
    }
    //Check for state values
    if (typeof value.state === "string") {
        //Bug: the state value can be an object path
        let keys = value.state.replace(/\[["']?(\w+)['"]?\]/g, ".$1").replace(/^\./, "").split(".");
        let stateName = keys.shift(); // <-- Extract state name
        sources.push(context.state[stateName]);
    }
    //Check for scale value
    if (typeof value.scale === "string") {
        sources.push(context.scales[value.scale]);
    }
    //Check for draw value
    if (typeof value.draw === "string") {
        sources.push(context.draw[value.draw]);
    }
    //Check for expression value
    if (typeof value.expr === "string") {
        getExpressionSources(context, value.expr).forEach(function (source) {
            sources.push(source);
        });
    }
    //Other value: return empty sources
    return sources;
}

