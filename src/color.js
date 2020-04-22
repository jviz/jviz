//Global colors
export const colors = {
    "blue": "#4e91e4",
    "red": "#ee675d",
    "yellow": "#fbc850",
    "orange": "#f78055",
    "purple": "#9d81e4",
    "green": "#4acf7f",
    "mint": "#4ccdac",
    "navy": "#546778",
    "grey": "#dde5ee",
    "white": "#ffffff",
    "black": "#000000"
};

//Get a single color
export function getColor (name) {
    return (typeof colors[name] !== "undefined") ? colors[name] : colors["black"];
}

//Color schemas
export const colorSchema = {
    "default": ["blue","red", "green", "yellow", "orange", "purple", "mint", "navy"].map(getColor)
};

//Get a color schema
export function getColorSchema (name) {
    return (typeof colorSchema[name] !== "undefined") ? colorSchema[name] : colorSchema["default"];
}

//Parse the specified color https://www.w3.org/TR/css-color-3/#colorunits 
//Returns a new instance of Color
export function parse (value) {
    //No valis color provided
    if (typeof value !== "string" || value === null) {
        return null;
    }
    //Parse the color string value
    value = value.toLowerCase().replace(/ /g, "");
    //Check for hex color
    if (value.charAt(0) === "#") {
        return parseHexColor(value);
    }
    //Check for RGB or RGBA color
    else if (value.indexOf("rgb") === 1) {
        return parseRgbaColor(value);
    }
    //Color not soported
    return null;
}

//Parse a hex color
let parseHexColor = function (value) {
    //Check for 3 digits color
    if (value.length === 4) {
        value = "#" + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    //Return the parsed color
    return {
        "red": parseInt(value[1] + value[2], 16),
        "green": parseInt(value[3] + value[4], 16),
        "blue": parseInt(value[5] + value[6], 16),
        "opacity": 1.0 
    };
};

//Parse a RGBA color
let parseRgbaColor = function (value) {
    let output = {
        "opacity": 1.0
    };
    let keys = ["red", "green", "blue", "opacity"];
    //Parse a RGB/RGBA string 
    //'rgb(x,x,x)' ==> 'x,x,x'
    //'rgba(x,x,x,x)' ==> 'x,x,x,x'
    value = value.replace("rgba", "").replace("rgb", "").replace(/[()]/g, "");
    value.split(",").forEach(function (item, index) {
        output[keys[index]] = Number(item);
    });
    //Return the parsed RGBA color
    return output;
};

//Color base class//Convert a value to hex
let hex = function (value) {
    return ("0" + Math.round(value).toString(16)).slice(-2);
};

//Convert a color to HEX String
export function toHexString (color) {
    return "#" + hex(color.red) + hex(color.green) + hex(color.blue);
}

//Convert a color to RGBA string
export function toRgbaString (color) {
    //Join the red, green and blue values
    let values = [color.red, color.green, color.blue].map(function (value) {
        return Math.max(0, Math.min(255, Math.round(value)));
    }).join(",");
    //Check the opacity
    return (color.opacity === 1) ? "rgb(" + values + ")" : "rgba(" + values + "," + color.opacity + ")";
}

//Interpolate two colors
export function interpolate (color1, color2, factor) {
    return {
        "red": Math.round(color1.red + factor * (color2.red - color1.red)),
        "green": Math.round(color1.green + factor * (color2.green - color1.green)),
        "blue": Math.round(color1.blue + factor * (color2.blue - color1.blue)),
        "opacity": 1
    };
}

