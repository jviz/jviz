import {isArray, each} from "../util.js";

//Style props
export const styleProps = {
    //Fill props
    "fill": "fill",
    //Stroke props
    "stroke": "stroke",
    "strokeWidth": "stroke-width",
    "strokeDash": "stroke-dasharray",
    "strokeDashOffset": "stroke-dashoffset",
    "strokeLineCap": "stroke-linecap",  //Values: butt|square|round
    "strokeLineJoin": "stroke-linejoin",  //Values: arcs|bevel|miter|miter-clip|round
    //Text
    "color": "color",
    "fontSize": "font-size",
    "fontFamily": "font-family",  //Values: arial|Times|serif
    "fontStyle": "font-style",  //Values: normal|italic|oblique
    "fontWeight": "font-weight",  //Values: normal|bold
    //Border
    "border": "border",
    "borderColor": "border-color",
    "borderStyle": "border-style",
    "borderWidth": "border-width",
    //General
    "opacity": "opacity",
    "cursor": "cursor",
    "transform": "transform"
};

//Apply shape stypes
export function applyStyle (context, datum, props, target) {
    //Draw all available styles
    return each(props, function (key, value) {
        //Check if this key is a style prop
        if (typeof styleProps[key] !== "undefined" && value !== null) {
            let parsedValue = context.value(props[key], ((isArray(datum) === true) ? datum[0] : datum)); //Get value from context
            //Add this css style
            target.style(styleProps[key], parsedValue);
        }
    });
}

//Clear all styles of an element
export function cleanStyle (target) {
    target.each(function () {
        this.style.cssText = "";
    });
}

