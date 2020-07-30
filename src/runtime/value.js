import {isArray, isObject, nest as nestObject} from "../util.js";
import {startsWith} from "../util.js";
import {colors} from "../color.js";
import {getPalette} from "../palette.js";
import {getExpressionSources} from "./expression.js";

//Get value from context
export function value (props, datum, defaultValue) {
    let context = this;
    //Check for undefined property value
    if (typeof props === "undefined") {
        return defaultValue;
    }
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
        value = (typeof context.theme.colors[props.color] === "string") ? context.theme.colors[props.color] : colors.black;
    }
    //Check for color palette
    else if (typeof props.palette === "string" || isObject(props.palette)) {
        value = getPalette(context.value(props.palette, "default", "default")); //Get color palette
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
        value = context.current.draw[props.draw]; //Get computed width or height value
    }
    //Check for value from panel context
    else if (typeof props.panel === "string") {
        if (isObject(context.current.panel) === false) {
            return context.error("There is no current panel");
        }
        //Return the panel value
        value = context.current.panel[props.panel]; //Get panel property
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
    if (typeof props.scale === "string" && value !== null) {
        let scale = context.scales[props.scale].value;
        if (typeof scale !== "function") {
            return null; //Error applying the scale
        }
        //let value = (typeof props.field === "string") ? viz.object.get(datum, props.field) : datum;
        //Get the scaled value
        value = scale(value);
        //Check for interval scale and position property provided
        if (scale.type === "interval" && typeof props.interval !== "undefined") {
            let intervalValue = Number(context.value(props.interval, datum, 0)); //Get interval value
            value = value + scale.step * ((isNaN(intervalValue)) ? 0 : intervalValue);
        }
        //Return the scaled value
        //return value;
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
        let drawValue = value.draw;
        if (startsWith(drawValue, "margin")) {
            drawValue = "margin"; //Remove margin position
        }
        else if (startsWith(drawValue, "outerMargin")) {
            drawValue = "outerMargin"; //Remove outer margin position
        }
        //Add draw source
        sources.push(context.draw[drawValue]);
    }
    if (typeof value.panel === "string") {
        sources.push(context.panels); //Add panels as dependency instead of draw
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

