import {clamp} from "../math.js";

//Export discrete scale generator
export function discrete (args) {
    //Create a map for all items of the domain
    let domainMapping = {};
    args.domain.forEach(function (value, index) {
        domainMapping["" + value + ""] = index;
    });
    //console.log(domainMapping);
    //Build the scale
    let scale = function (value) {
        let index = domainMapping["" + value + ""];
        if (typeof index === "undefined") {
            return null;
        }
        //Return the value in the range
        return args.range[index % args.range.length];
    };
    //Add scale metadata
    scale.type = "discrete";
    scale.range = args.range;
    scale.domain = args.domain;
    //Return the scale
    return scale;
}

//Ordinal scale
export function ordinal (args) {
    return Object.assign(discrete(args), {
        "type": "ordinal"
    });
}

//Parse a number value
let parseNumber = function (value, defaultValue) {
    if (value === null || typeof value === "undefined") {
        return defaultValue; //Not valid value
    }
    value = Number(value); //Convert to number
    return (isNaN(value) === true) ? defaultValue : value;
}

//Export interval partition scale generator
export function interval (args) {
    //Verify the margin and separation arguments
    let margin = clamp(parseNumber(args.margin, 0), 0, 1);
    let spacing = clamp(parseNumber(args.spacing, 0), 0, 1);
    let intervals = args.domain.length; //Initialize the number of intervals
    //Calculate the steps
    let length = args.range[1] - args.range[0];
    let step = length / (2 * margin + (intervals - 1) * spacing + intervals);
    //Build the discrete scale
    let scale = discrete({
        "range": args.domain.map(function (value, index) {
            return args.range[0] + step * (margin + index * spacing + index);
        }), 
        "domain": args.domain
    });
    //Save the intervals scale metadata
    Object.assign(scale, {
        "type": "interval",
        "step": step,
        "range": args.range,
        "spacing": spacing,
        "margin": margin
    });
    //Return the interval scale
    return scale;
}

//Export point scale generator
export function point (args) {
    //Verify the margin value
    let margin = clamp(parseNumber(args.margin, 0), 0, 1);
    //Calculate the step size
    let length = args.range[1] - args.range[0];
    let step = length / (2 * margin + args.domain.length - 1);
    //Build the point scale
    let scale = discrete({
        "range": args.domain.map(function (value, index) {
            return args.range[0] + step * (margin + index);
        }),
        "domain": args.domain
    });
    //Assign scale metadata
    Object.assign(scale, {
        "type": "point",
        "step": step,
        "margin": margin,
        "range": args.range //Temporally hack
    });
    //Return the scale
    return scale;
}

