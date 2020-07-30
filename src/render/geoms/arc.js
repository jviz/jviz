//import {propTypes, parseProps} from "../../props.js";
import {arc} from "../primitives/arc.js";
import {isNumber} from "../../util.js";

//Arc default props
let defaultProps = {
    "startAngle": 0,
    "endAngle": 0,
    "innerRadius": 0,
    "outerRadius": 0,
    "angle": 0,
    "radius": 0, 
    "x": 0, 
    "y": 0
};

//Export arc geom
export const arcGeom = {
    "tag": "path",
    "type": "arc",
    "render": function (context, datum, props, element) {
        element.attr("d", ""); //Reset arc
        //Initialize the arc arguments
        let args = {
            "centerX": context.value(props.x, datum, null),
            "centerY": context.value(props.y, datum, null),
            "innerRadius": 0, //Initial inner radius
            "outerRadius": null,
            "startAngle": 0,  //Initial start angle
            "endAngle": null
        };
        //Check for no x or y value provided
        if (!isNumber(args.centerX) || !isNumber(args.centerY)) {
            return context.log.warn("Not valid 'x' or 'y' value provided to arc geom");
        }
        //Check for custom radius
        if (typeof props.radius !== "undefined" && props.radius !== null) {
            args.outerRadius = context.value(props.radius, datum, null);
        }
        //Check for custom inner and outer radius
        if (typeof props.innerRadius !== "undefined" && typeof props.outerRadius !== "undefined") {
            args.innerRadius = context.value(props.innerRadius, datum, null);
            args.outerRadius = context.value(props.outerRadius, datum, null);
        }
        //Check if there is not valid inner or uter radius values
        if (!isNumber(args.innerRadius) || !isNumber(args.outerRadius)) {
            return context.log.warn("Not valid radius value provided to arc geom");
        }
        //Check for single angle value provided
        if (typeof props.angle !== "undefined") {
            args.endAngle = context.value(props.angle, datum, null);
        }
        //Check if a pair start and end angle has been provided
        if (typeof props.startAngle !== "undefined" && typeof props.endAngle !== "undefined") {
            args.startAngle = context.value(props.startAngle, datum, null);
            args.endAngle = context.value(props.endAngle, datum, null);
        }
        //Check if no angle has been provided
        if (!isNumber(args.startAngle) || !isNumber(args.endAngle)) {
            return context.log.warn("Not valid angle value provided to arc geom");
        }
        //Build the arc
        element.attr("d", arc(args));
    },
    "props": defaultProps
};

