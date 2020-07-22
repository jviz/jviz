import * as colors from "../color.js";
import {clamp} from "../math.js";

//Parse a color range
let parseColorRange = function (array) {
    return array.map(function (item) {
        return colors.parseColor(item);
    });
};

//Export color scale
export function color (args) {
    let zero = args.zero === true || args.zero === "true"; //Scale should include zero
    let domain = args.domain; //Get domain reference
    if (zero === true) {
        domain[0] = Math.min(0, domain[0]); //ensure that domain start has a zero
        domain[1] = Math.max(0, domain[1]); //ensure that domain end has a zero
    }
    let range = parseColorRange(args["range"]);
    let n = range.length - 1; //Calculate the number of intervals
    //Return the scale function
    let scale = function (value) {
        let v = clamp(value, domain[0], domain[1]); //Parse value
        //Check for extreme values
        if (v === domain[0]) {
            return range[0]; //Return the first range color
        }
        else if (v === domain[1]) {
            return range[range.length - 1]; //Return the last range color
        }
        //Calculate the factor
        let factor = (v - domain[0]) / (domain[1] - domain[0]);
        let i = Math.floor(n * factor); //Get the interval
        //Interpolate the two colors
        let newColor = colors.interpolate(range[i], range[i+1], (factor * n) - i);
        //Return the HEX result color
        return colors.toHexString(newColor);
    };
    //Add scale metadata
    scale.type = "color";
    scale.range = range;
    scale.domain = domain;
    //Return the scale
    return scale;
}

