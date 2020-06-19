import {parseProps, propTypes} from "../../props.js";

//Text default props
let defaultProps = {
    "text": propTypes.string(""),
    "x": propTypes.number(),
    "y": propTypes.number(),
    "offsetX": propTypes.number(),
    "offsetY": propTypes.number(),
    "rotation": propTypes.number(null),
    "textLength": propTypes.number(),
    //https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
    "textAnchor": propTypes.string("middle"), //start|middle|end
    //https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline
    "baseline": propTypes.string("middle") //hanging|middle|baseline 
};

//Export text geom
export const textGeom = {
    "tag": "text",
    "type": "text",
    "render": function (context, data, props, element) {
        //Parse text props
        let options = parseProps(context, data, props, defaultProps);
        //Set the text positions
        let x = options.x + ((typeof options.offsetX === "number") ? options.offsetX : 0);
        let y = options.y + ((typeof options.offsetY === "number") ? options.offsetY : 0);
        //Generate the text element
        element.text(options.text);
        //Set text position
        element.attr("x", x);
        element.attr("y", y);
        //Check the rotation
        if (options.rotation !== null) {
            element.attr("transform", `rotate(${options.rotation}, ${x}, ${y})`);
        }
        //Set text style attributes
        //element.attr("textLength", options.textLength);
        element.attr("text-anchor", options.textAnchor);
        element.attr("dominant-baseline", options.baseline);
    },
    "props": defaultProps
};


