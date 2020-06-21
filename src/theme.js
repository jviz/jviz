import {colors, parseColor, toRgbaString} from "./color.js";
import {isObject} from "./util.js";

//Custom rgba method to add color opacity
let rgba = function (color, opacity) {
    return toRgbaString(Object.assign(parseColor(color), {
        "opacity": opacity
    }));
};

let themes = {};

//Default theme
themes["default"] = {
    "colors": {
        "blue": colors.blue,
        "red": colors.red,
        "orange": colors.orange,
        "green": colors.green,
        "teal": colors.teal,
        "purple": colors.purple,
        "gray": colors.gray,
        "black": colors.black,
        "white": colors.white
    },
    "background": colors.transparent,
    "axesLineColor": colors.transparent,
    "axesTickColor": rgba(colors.black, 0.6),
    "axesSlotColor": colors.gray,
    "agesGridColor": colors.white,
    "panelBackground": colors.gray,
    "legendBackground": colors.transparent,
    "font": "sans"
};

//Light theme
themes["light"] = Object.assign({}, themes["default"], {
    "panelBackground": colors.transparent,
    "axesLineColor": rgba(colors.black, 0.6),
    "axesGridColor": rgba(colors.gray, 0.8)
});

//Get a single theme
export function getTheme (value) {
    //Check for string value provided --> get a defined theme
    if (typeof value === "string") {
        return (typeof themes[value] === "undefined") ? themes["default"] : themes[value];
    }
    //Check for object value --> merge with the default theme
    else if (isObject(value) === true) {
        return Object.assign({}, themes["default"], value);
    }
    //Other value or undefined --> return the default theme
    return themes["default"];
}


