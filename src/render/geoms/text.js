import {isNumber, isValid} from "../../util.js";

//Text default props
let defaultProps = {
    "text": "",
    "x": null,
    "y": null,
    "offsetX": null,
    "offsetY": null,
    "rotation": 0,
    "textLength": null,
    //https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
    "textAnchor": "middle", //start|middle|end
    //https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline
    "baseline": "middle" //hanging|middle|baseline 
};

//Export text geom
export const textGeom = {
    "tag": "text",
    "type": "text",
    "render": function (context, datum, props, element) {
        element.attr("x", 0).attr("y", 0).text(""); //Reset text values
        //Parse text arguments
        let args = {
            "x": context.value(props.x, datum, null),
            "y": context.value(props.y, datum, null),
            "offsetX": context.value(props.offsetX, datum, 0),
            "offsetY": context.value(props.offsetY, datum, 0),
            "text": context.value(props.text, datum, null),
            "rotation": context.value(props.rotation, datum, 0)
        };
        //Check for valid x, y and text values
        if (!isNumber(args.x) || !isNumber(args.y) || !isValid(args.text)) {
            return; //TODO: display warning
        }
        let x = args.x + (isNumber(args.offsetX) ? args.offsetX : 0);
        let y = args.y + (isNumber(args.offsetY) ? args.offsetY : 0);
        //Set the text attributes
        element.attr("x", x).attr("y", y).text(args.text);
        //Check the rotation
        if (isNumber(args.rotation)) {
            element.attr("transform", `rotate(${args.rotation}, ${x}, ${y})`);
        }
        //Set text style attributes
        //element.attr("textLength", options.textLength);
        element.attr("text-anchor", context.value(props.textAnchor, datum, defaultProps.textAnchor));
        element.attr("dominant-baseline", context.value(props.baseline, datum, defaultProps.baseline));
    },
    "props": defaultProps
};


