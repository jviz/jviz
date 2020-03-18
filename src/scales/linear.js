// Verify an array
let verifyArray = function (array, length) {
    return typeof array === "object" && Array.isArray(array) && array.length === length;
}

// Build a linear scale
// Returns a function f(x) € [rangeMin, rangeMax], where x € [domainStart, domainEnd]
export function linear (args) {
    let scale = function (value) {
        //Get the value in the domain provided
        let v = Math.min(args.domain[1], Math.max(args.domain[0], value)); 
        return args.range[0] + (args.range[1] - args.range[0]) * (v - args.domain[0]) / (args.domain[1] - args.domain[0]);
    };
    //Add scale metadata
    scale.type = "linear";
    scale.range = args.range;
    scale.domain = args.domain;
    //Return the scale
    return scale;
}


