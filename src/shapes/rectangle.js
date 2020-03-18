import {parseProps, propTypes} from "../props.js";
import {rectangle} from "../render/primitives/rectangle.js";

//Rectangle default props
let defaultProps = {
    "x": propTypes.number(),
    "y": propTypes.number(),
    "width": propTypes.number(),
    "height": propTypes.number(),
    "x1": propTypes.number(),
    "y1": propTypes.number(),
    "x2": propTypes.number(),
    "y2": propTypes.number(),
    "xCenter": propTypes.number(),
    "yCenter": propTypes.number(),
    "mask": propTypes.boolean(),
    "radius": propTypes.number()
};

//Rectangle shape
export const rectangleShape = {
    "tag": "path",
    "type": "rectangle",
    "render": function (context, data, props, element) {
        let options = parseProps(context, data, props, defaultProps);
        //let x = props.x, y = props.y, width = props.width, height = props.height;
        //Check for x2 values
        if (typeof options.x2 === "number") {
            options.width = options.x2 - options.x1;
        }
        //Check por x value provided
        else if (typeof options.x === "number") {
            options.x1 = options.x;
        }
        //Chekc if user has provided xCenter values
        else if (typeof options.xCenter === "number" && typeof options.width === "number") {
            options.x1 = options.xCenter - options.width / 2;
        }
        //Check for y2 values
        if (typeof options.y2 === "number") {
            options.height = options.y2 - options.y1;
        }
        else if (typeof options.y === "number") {
            options.y1 = options.y;
        }
        //Check if the user has provided yCenter values
        else if (typeof options.yCenter === "number" && typeof options.height === "number") {
            options.y1 = options.yCenter - options.height / 2;
        }
        //Draw the rectangle
        return element.attr("d", rectangle({
            "x": options.x1,
            "y": options.y1,
            "width": options.width,
            "height": options.height,
            "mask": options.mask,
            "radius": options.radius
        }));
    },
    "props": defaultProps
};

