import {getGlyph} from "../primitives/glyphs.js";
import {isNumber} from "../../util.js";

//Glyph default props
let defaultProps = {
    "x": null,
    "y": null,
    "type": "circle",
    "angle": 0,
    "size": 0
};

//Export glyph geom
export const glyphGeom = {
    "tag": "path",
    "type": "glyph",
    "render": function (context, datum, props, element) {
        element.attr("fill", "none"); //Hack to prevent unwanted filled glyphs
        element.attr("d", ""); //Reset glyph path
        element.attr("transform", ""); //Reset transform
        //Initialize glyph arguments
        let args = {
            "x": context.value(props.x, datum, null),
            "y": context.value(props.y, datum, null),
            "type": context.value(props.type, datum, defaultProps.type),
            "angle": context.value(props.angle, datum, defaultProps.angle),
            "size": context.value(props.size, datum, 0)
        };
        //Check for 0 sized glyhp --> ignore this glyph
        if (args.size === null || args.size <= 0) {
            return; //Nothong to render
        }
        //Check for no valid values
        if (!isNumber(args.x) || !isNumber(args.y) || typeof args.type !== "string") {
            return context.log.warn("Invalid values provided to glyph geom");
        }
        element.attr("transform", `translate(${args.x},${args.y})`); //Translate the glyph
        element.attr("d", getGlyph(args.type, args)); //Build the glyph
    },
    "props": defaultProps
};

