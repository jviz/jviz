//Style props
export const styleProps = {
    //Fill props
    "fill": "fill",
    "backgroundColor": "background-color",
    "background": "background-color", //background-color alias
    //Stroke props
    "stroke": "stroke",
    "strokeWidth": "stroke-width",
    "strokeDash": "stroke-dasharray",
    "strokeDashOffset": "stroke-dashoffset",
    "strokeLineCap": "stroke-linecap",  //Values: butt|square|round
    "strokeLineJoin": "stroke-linejoin",  //Values: arcs|bevel|miter|miter-clip|round
    //Text
    //"color": "color", // ---> use fill instead
    "fontSize": "font-size",
    "fontFamily": "font-family",  //Values: arial|Times|serif
    "fontStyle": "font-style",  //Values: normal|italic|oblique
    "fontWeight": "font-weight",  //Values: normal|bold
    "fontColor": "color", //Alias for color
    //Border
    "border": "border",
    "borderColor": "border-color",
    "borderStyle": "border-style",
    "borderWidth": "border-width",
    "borderRadius": "border-radius",
    //General
    "opacity": "opacity",
    "cursor": "cursor",
    "transform": "transform"
};

//Set style property to element
export function setStyle (element, name, value) {
    return element.style(styleProps[name], value);
}

//Check if the provided name is a valid style property
export function isStyleName (name) {
    return typeof name === "string" && typeof styleProps[name] !== "undefined";
}

