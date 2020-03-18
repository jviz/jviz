import * as colors from "../color.js";

//Parse a color range
let parseColorRange = function (array) {
    return array.map(function (item) {
        return colors.parse(item);
    });
};

//Export color scale
export function color (args) {
    //Parse the range color
    let range = parseColorRange(args["range"]);
    let domain = args["domain"];
    //Return the scale function
    let scale = function (value) {
        let v = Math.min(domain[1], Math.max(domain[0], value));
        let factor = (v - domain[0]) / (domain[1] - domain[0]);
        //Interpolate the two colors
        let newColor = colors.interpolate(range[0], range[1], factor);
        //Return the HEX result color
        return colors.toHexString(newColor);
    };
    ////Set the scale domain
    //scale.domain = function (array) {
    //    if (verifyArray(array, 2) === true) {
    //        domain = array;
    //    }
    //};
    ////Set the scale range
    //scale.range = function (array) {
    //    if (verifyArray(array, 2) === true) {
    //        range = parseColorRange(array);
    //    }
    //};
    //Add scale metadata
    scale.type = "color";
    //Return the scale
    return scale;
}

