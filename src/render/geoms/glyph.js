import {parseProps, propTypes} from "../../props.js";
import {getGlyph} from "../primitives/glyphs.js";

//Glyph default props
let defaultProps = {
    "x": propTypes.number(),
    "y": propTypes.number(),
    "type": propTypes.string("circle"),
    "angle": propTypes.number(0),
    "size": propTypes.number(0)
};

//Export glyph geom
export const glyphGeom = {
    "tag": "path",
    "type": "glyph",
    "render": function (context, data, props, element) {
        let options = parseProps(context, data, props, defaultProps); //Parse glyph options
        element.attr("fill", "none"); //Hack to prevent unwanted filled glyphs
        element.attr("transform", `translate(${options.x},${options.y})`); //Translate the glyph
        //Return the element
        return element.attr("d", getGlyph(options.type, options));
    },
    "props": defaultProps
};

