import {identity} from "./util.js";

//Export math constants
export const pi = Math.PI;
export const tau = 2 * Math.PI;
export const epsilon = Number.EPSILON;

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

//Generate values in the provided range
export function ticks (start, end, count) {
    //Output values list
    let values = [];
    //Check for the same range values
    if (start === end) {
        return [start];
    }
    //Determine Range length
    let length = end - start; // + 1;
    //console.log(range);
    // Adjust ticks if needed
    count = count + 1;
    if (count < 3) {
        count = 3; //At least add the start and end values
    }
    //Get the raw tick size
    let unroundedTickSize = length / count;
    //Round the tick size into nice amounts
    let mag = Math.ceil(Math.log10(unroundedTickSize)-1);
    let magPow = Math.pow(10, mag);
    let roundedTickRange = Math.ceil(unroundedTickSize / magPow) * magPow;
    //Adjust the lower and upper bound accordingly
    let minRounded = roundedTickRange * Math.floor(start / roundedTickRange);
    let maxRounded = roundedTickRange * Math.ceil(end / roundedTickRange);
    //Generate the values
    for(let x = minRounded; x <= maxRounded; x = x + roundedTickRange) {
        //Add this value only if is in the range interval
        if (start <= x && x <= end) {
            values.push(parseFloat(x.toFixed(8))); //Convert 1.2000000000000002 --> 1.2
        }
    }
    //Return the interpolated values
    return values;
}

//Sort an array of objects
export function sort (list, keys, order) {
    return list.sort(function (a, b) {
        for(let i = 0; i < keys.length; i++) {
            let key = keys[i]; //Get list field
            if (typeof a[key] === "undefined" || typeof b[key] === "undefined") {
                continue; //Undefined value
            }
            //Check for the same value
            if (a[key] === b[key]) {
                continue; //Use next field
            }
            let isNum = !isNaN(+a[key] - +b[key]);
            let aValue = (isNum === true) ? +a[key] : a[key].toLowerCase();
            let bValue = (isNum === true) ? +b[key] : b[key].toLowerCase();
            if (aValue < bValue) {
                return (order[i] === "asc") ? -1 : 1;
            }
            else if (aValue > bValue) {
                return (order[i] === "asc") ? 1 : -1;
            }
        }
        return 0; //Default --> return 0
    });
}

//Find all divisors of a number
export function divisors (n) {
    let result = []; //List with all divisors
    let m = Math.ceil(n / 2);
    for (let i = 1; i <= m; i++) {
        if (n % i === 0) {
            result.push([i, n / i]);
        }
    }
    //Return list of divisors
    return result;
}

//Logaritmic function
export function log (x, base) {
    return Math.log(x) / Math.log(base);
}


