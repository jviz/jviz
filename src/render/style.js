//import {isArray, each} from "../util.js";

//Style props
export const styleProps = {
    //Fill props
    "fill": "fill",
    //Stroke props
    "stroke": "stroke",
    "strokewidth": "stroke-width",
    "strokedash": "stroke-dasharray",
    "strokedashoffset": "stroke-dashoffset",
    "strokelinecap": "stroke-linecap",  //Values: butt|square|round
    "strokelinejoin": "stroke-linejoin",  //Values: arcs|bevel|miter|miter-clip|round
    //Text
    "color": "color",
    "fontsize": "font-size",
    "fontfamily": "font-family",  //Values: arial|Times|serif
    "fontstyle": "font-style",  //Values: normal|italic|oblique
    "fontweight": "font-weight",  //Values: normal|bold
    //Border
    "border": "border",
    "bordercolor": "border-color",
    "borderstyle": "border-style",
    "borderwidth": "border-width",
    //General
    "opacity": "opacity",
    "cursor": "cursor",
    "transform": "transform"
};

//Apply style
//export function applyStyle (context, datum, props, target) {
//    //Draw all available styles
//    return each(props, function (key, value) {
//        //Check if this key is a style prop
//        if (typeof styleProps[key] !== "undefined" && value !== null) {
//            let parsedValue = context.value(props[key], ((isArray(datum) === true) ? datum[0] : datum)); //Get value from context
//            //Add this css style
//            target.style(styleProps[key], parsedValue);
//        }
//    });
//}

//Set style property to element
export function setStyle (element, name, value) {
    return element.style(styleProps[parseStyleName(name)], value);
}

//Parse style name
export function parseStypeProp (name) {
    return name.replace(/-/g, "").toLowerCase();
}

//Check if the provided name is a valid style property
export function isStyleName (name) {
    return typeof name === "string" && typeof styleProps[parseStyleName(name)] !== "undefined";
}

//Clear all styles of an element
export function cleanStyle (target) {
    return target.each(function () {
        this.style.cssText = "";
    });
}

