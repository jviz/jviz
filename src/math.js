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
    if (typeof min !== "number") {
        return Math.random(); //Return a random number between 0 and 1
    }
    else if (typeof max !== "number") {
        return Math.random() * min; //Use min as the max value
    }
    //Default
    return min + Math.random()*(max - min);
}

//Nice number for Heckbert algorithm
export function niceNumber (x, round) {
    let exp = Math.floor(Math.log10(x));
    let f = x / Math.pow(10, exp);
    let nf = 0;
    if (round === true) {
        nf = (f < 1.5) ? 1 : ((f < 3) ? 2 : ((f < 7) ? 5 : 10));
    }
    else  {
        nf = (f <= 1) ? 1 : ((f <= 2) ? 2 : ((f <= 5) ? 5 : 10));
    }
    //Return the nice number
    return nf * Math.pow(10, exp);
}

//Generate values in the provided range using the Heckbert algorithm
export function ticks (start, end, n, tight) {
    //Check for the same range values
    if (start === end) {
        return [start];
    }
    //Check if end < start --> call this method with the reversed arguments
    if (end < start) {
        return ticks(end, start, n, tight);
    }
    let range = niceNumber(end - start, false);
    let step = niceNumber(range / (n - 1), true); //Ticks separation
    let ticksStart = Math.floor(start / step) * step; //Ticks start
    let ticksEnd = Math.ceil(end / step) * step; //Ticks end
    let nfrac = Math.max(-Math.floor(Math.log10(step)), 0); //number of fractional digits to show;
    let ticksValues = []; //Output ticks values
    for (let value = ticksStart; value <= ticksEnd; value = value + step) {
        ticksValues.push(parseFloat(value.toFixed(8)));
    }
    //Check for tight option --> remove ticks outside of the [start, end] interval
    //and add start and end values
    if (typeof tight === "boolean" && tight === true) {
        ticksValues.filter(function (value) {
            return start < value && value < end;
        });
        //Insert start and end values
        ticksValues.unshift(start); //Insert start as the first item
        ticksValues.push(end); //Insert end as the last item
    }
    //Return ticks values
    return ticksValues;
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

//Check if a number is integer
export function isInteger (value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
}

//Check if a number is natural
export function isNatural (value) {
    return value >= 0 && isInteger(value);
}

//Parse a nth number
let nthValue = function (sign, value) {
    if (typeof value === "undefined") {
        return 0; //No value to parse
    }
    else if (value === "") {
        value = 1; //It matches, but there is no value --> use 1
    }
    //Default --> parse the value and the sign
    return (sign === "-") ? ((-1) * parseInt(value)) : parseInt(value);
};

//Parse a nth expression (an + b)
let nthExpr = /^(?:([+\-]?)\s*(\d*)n)?\s*(?:([+\-]?)\s*(\d+))?$/; //To check for an expression
export function nthParse (expr) {
    expr = expr.trim().toLowerCase();
    let match = null;
    if (expr === "*") {
        return [1, 0]; //Catch all
    }
    else if (expr === "even") {
        return [2, 0]; //Return for even nth checks
    }
    else if (expr === "odd") {
        return [2, 1]; //Return for odd nth checks
    }
    else if (expr === "n") {
        return [1, 0]; //Return a catch-all
    }
    else if ((match = expr.match(nthExpr)) !== null) {
        return [nthValue(match[1], match[2]), nthValue(match[3], match[4])];
    }
    //Default --> not valid expression
    throw new SyntaxError(`Invalid nth expression ('${expr}')`);
}

//Check a nth expression
export function nthCheck (value, attr) {
    let a = attr[0], b = attr[1];
    //If a === 0 --> only check the b value
    if (a === 0) {
        return b === value;
    }
    //Default --> check if (value - b) / a is a positive integer
    return isNatural((value - b) / a);
}

//Parse + check a nth expression
export function nth (value, expr) {
    return nthCheck(value, nthParse(expr));
}

//Binary search tree
let BinarySearchTreeHandler = function () {
    this.root = null; //Initial node
};

//Prototype
BinarySearchTreeHandler.prototype = {
    //Add a new node to the tree
    "add": function (value) {
        let node = {"value": value, "left": null, "right": null};
        if (this.root === null) {
            this.root = node;
            return true; //Node has been inserted
        }
        //Search in the tree
        let current = this.root;
        while (true) {
            //Check if there is no
            if (node.value.end < current.value.start) {
                if (current.left === null) {
                    current.left = node;
                    return true;
                }
                //Now check the left node
                current = current.left;
            }
            else if (current.value.end < node.value.start) {
                if (current.right === null) {
                    current.right = node;
                    return true;
                }
                //Now check the right side
                current = current.right;
            }
            else {
                //This node intersects the current node --> reject
                return false;
            }
        }
    }
};

//Create a new binary search tree
export function binarySearchTree () {
    return new BinarySearchTreeHandler();
}


