// Verify an array
let verifyArray = function (array, length) {
    return typeof array === "object" && Array.isArray(array) && array.length === length;
};

//Parse a boolean value
let parseBool = function (value) {
    return value === true || value === "true";
};

//Linear scale default props
let linearDefaultProps = {
    "zero": false //should include zero in the domain
};

// Build a linear scale
// Returns a function f(x) € [rangeMin, rangeMax], where x € [domainStart, domainEnd]
export function linear (args) {
    let zero = parseBool(args.zero); //Scale should include zero
    let domain = args.domain; //Get domain reference
    if (zero === true) {
        domain[0] = Math.min(0, domain[0]); //ensure that domain start has a zero
        domain[1] = Math.max(0, domain[1]); //ensure that domain end has a zero
    }
    //Return the scale generator
    let scale = function (value) {
        //Get the value in the domain provided
        let v = Math.min(domain[1], Math.max(domain[0], value)); 
        return args.range[0] + (args.range[1] - args.range[0]) * (v - domain[0]) / (domain[1] - domain[0]);
    };
    //Add scale metadata
    scale.type = "linear";
    scale.range = args.range;
    scale.domain = domain;
    //Return the scale
    return scale;
}

//Add default props to linear scale
linear.defaultProps = linearDefaultProps;


