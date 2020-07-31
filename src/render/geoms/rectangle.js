import {isNumber} from "../../util.js";
import {rectangle} from "../primitives/rectangle.js";

//Rectangle default props
let defaultProps = {
    "x": null,
    "y": null,
    "width": null,
    "height": null,
    "x1": null,
    "y1": null,
    "x2": null,
    "y2": null,
    "xCenter": null,
    "yCenter": null,
    "mask": false,
    "radius": 0
};

//Rectangle geom
export const rectangleGeom = {
    "tag": "path",
    "type": "rectangle",
    "render": function (context, datum, props, element) {
        element.attr("d", ""); //Reset path
        //Get rectangle arguments
        let args = {
            "radius": context.value(props.radius, datum, defaultProps.radius),
            "mask": context.value(props.mask, datum, defaultProps.mask)
        };
        //Check for x1 and x2 values
        if (typeof props.x1 !== "undefined" && typeof props.x2 !== "undefined") {
            args.x = context.value(props.x1, datum, null);
            let width = context.value(props.x2, datum, null);
            args.width = (width !== null) ? width - args.x : null;
        }
        //Check for x and width value provided
        else if (typeof props.x !== "undefined" && typeof props.width !== "undefined") {
            args.x = context.value(props.x, datum, null);
            args.width = context.value(props.width, datum, null);
        }
        //Check if user has provided xCenter and width values
        else if (typeof options.xCenter === "number" && typeof options.width === "number") {
            args.width = context.value(props.width, datum, null);
            let x = context.value(props.xCenter, datum, null);
            args.x = (x !== null) ? x - args.width / 2 : null;
        }
        //Verify if we have x and width valid values --> if not, exit with a warning
        if (!isNumber(args.x) || !isNumber(args.width)) {
            return; //context.log.warn("");
        }
        //Check for y1 and y2 values
        if (typeof props.y1 !== "undefined" && typeof props.y2 !== "undefined") {
            args.y = context.value(props.y1, datum, null);
            let height = context.value(props.y2, datum, null);
            args.height = (height !== null) ? height - args.y : null;
        }
        //Check for y and height value provided
        else if (typeof props.y !== "undefined" && typeof props.height !== "undefined") {
            args.y = context.value(props.y, datum, null);
            args.height = context.value(props.height, datum, null);
        }
        //Check if user has provided yCenter and height values
        else if (typeof options.yCenter === "number" && typeof options.height === "number") {
            args.height = context.value(props.height, datum, null);
            let y = context.value(props.yCenter, datum, null);
            args.y = (y !== null) ? y - args.height / 2 : null;
        }
        //Verify if we have y and height valid values --> if not, exit with a warning
        if (!isNumber(args.y) || !isNumber(args.height)) {
            return; //context.log.warn("");
        }
        //Draw the rectangle
        return element.attr("d", rectangle(args));
    },
    "props": defaultProps
};

