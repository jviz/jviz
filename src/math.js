import {identity} from "./util.js";

//Restrict the value to be in the [min, max] range
export function clamp (value, min, max) {
    if (value < min) {
        return min;
    }
    else if (value > max) {
        return max;
    }
    //Default: return the value
    return value;
}

//Generate an array with an algorithmic progression
//Based on https://docs.python.org/3/library/stdtypes.html#range 
export function range (start, end, step) {
    //Check for no start value
    if (typeof start !== "number") {
        return [];
    }
    //Check for no end value
    if (typeof end !== "number") {
        end = start;
        start = 0;
        // Same as calling return range(0, start, 1);
    }
    //Check if start < end and if start is not negative
    if (0 <= start && start < end) {
        //Check if step is not defined or if step is a negative or zero number
        if (typeof step !== "number" || step <= 0) {
            step = 1;
        }
        //Calculate the number of elements of the new array
        let count = Math.floor((end - start) / step);
        return Array(count).fill().map(function (value, index) {
            return start + (index * step);
        });
    }
    else {
        //Start or end values not valid, return an empty array
        return [];
    }
}

//Returns the q-quantile value of a given SORTED list of numbers
//https://en.wikipedia.org/wiki/Quantile 
//https://en.wikipedia.org/wiki/Quantile#Estimating_the_quantiles_of_a_population 
export function quantile (q, values, valueOf) {
    //Check for undefined valueOf method
    if (typeof valueOf !== "function") {
        valueOf = identity; //Save it as a function that returns the same value
    }
    //Check for no values
    if (values.length === 0) {
        return null;
    }
    //Check for negative values of q or for more than 2 values in the list
    if (q <= 0 || values.length < 2) {
        return valueOf(values[0]);
    }
    //Check for numbers of q >= 1
    if (q >= 1) {
        return valueOf(values[values.length -1]);
    }
    //Calculate tue quantile
    let h = (values.length - 1) * q;
    let rh = Math.floor(h);
    return valueOf(values[rh]) + (valueOf(values[rh + 1]) - valueOf(values[rh])) * (h - rh);
}

//Calculate the hypotenuse without danger of overflow in taking the square root
// hypo = sqrt(max*max + min*min)
// hypo = sqrt(max*max*(1 + min*min/(max*max)))
// hypo = max*sqrt(1 + min*min/(max*max))
//Inspired in from https://www.johndcook.com/blog/2010/06/02/whats-so-hard-about-finding-a-hypotenuse/
export function hypo (x, y) {
    let max = Math.max(Math.abs(x), Math.abs(y));
    let min = Math.min(Math.abs(x), Math.abs(y));
    let division = min / max;
    return max * Math.sqrt(1 + division*division);
}

//Get the X coordinate of the conversion from polar to cartesian
export function polarToCartesianX (radius, angle, center) {
    return center + radius * Math.cos(angle);
}

//Get the Y coordinate of the conversion from polar to cartesian
export function polarToCartesianY (radius, angle, center) {
    return center + radius * Math.sin(angle);
}

//Convert polar to cartesian
export function polarToCartesian(radius, angle, centerX, centerY) {
    //Return the conversion to cartesian coordinates
    return {
        "x": polarToCartesianX(radius, angle, centerX),
        "y": polarToCartesianY(radius, angle, centerY)
    };
}

//Convert cartesian to polar
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
export function cartesianToPolar(x, y, centerX, centerY) {
    //Check for no center point provided
    if (typeof centerX !== "number" || typeof centerY !== "number") {
        centerX = 0; centerY = 0;
    }
    //Return the polar coordinates
    return {
        "radius": hypo(x - center.x, y - center.y),
        "angle": Math.atan2(y - center.y, x - center.x)
    };
}

//Format size prefixes
let formatSizePrefix = ["", "K", "M", "G", "T", "P"];

//Format a number
export function format (value, digits) {
    //Check for no digits provided
    if (typeof digits !== "number") {
        digits = 2;
    }
    //Get the size prefix index
    let i = parseInt(Math.floor(Math.log(value) / Math.log(1000)));
    //Return the formated value
    return (value / Math.pow(1000, i)).toFixed(digits) + "" + formatSizePrefix[i];
}

//Returns a random number between `min` and `max` (not included)
//If this function is called only with one argumet, it returns a random number between `0` and that number.
export function random (min, max) {
    if (typeof max !== "number") {
        max = min;
        min = 0; 
    }
    return min + Math.random()*(max - min);
}

