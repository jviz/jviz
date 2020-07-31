//import {propTypes} from "../../props.js";
import {path} from "../path.js";
import {getCurve} from "../curves/index.js";
import {isNumber} from "../../util.js";

//Area default props
let defaultProps = {
    "x": null,
    "y": null,
    "x1": 0,
    "x2": 0,
    "y1": 0,
    "y2": 0,
    "curve": "linear" // linear|catmull-roll|step|step-after|step-before
};

//Export area geom
export const areaGeom = {
    "type": "area",
    "tag": "path",
    "render": function (context, data, props, element) {
        element.attr("d", ""); //Reset area path
        if (data === null || data.length < 2) {
            return context.log.warn("Area geom needs a valid data object with at least 2 points.");
        }
        //Initialize the area arguments
        let args = {"x1": props.x1, "x2": props.x2, "y1": props.y1, "y2": props.y2};
        //Check if an x property has been provided --> use it for x1 and x2
        if (typeof props.x !== "undefined") {
            Object.assign(args, {"x1": props.x, "x2": props.x});
        }
        //Check if an y property has been provided --> use it for y1 and y2
        if (typeof props.y !== "undefined") {
            Object.assign(args, {"y1": props.y, "y2": props.y});
        }
        //Add and validate the curve value
        args.curve = context.value(props.curve, data[0], defaultProps.curve);
        if (typeof args.curve !== "string" || args.curve.length === 0){
            return context.log.warn("Invalid curve value provided to area geom");
        }
        //Build the area
        let areaPath = path(); //Get the path generator
        let curve = getCurve(args.curve)(areaPath); //Initialize the curve generator
        //Build the forward line of the area
        for (let i = 0; i < data.length; i++) {
            let x = context.value(args.x1, data[i], null); //Get x value
            let y = context.value(args.y1, data[i], null); //Get y value
            if (!isNumber(x) || !isNumber(y)) {
                return; context.log.warn(`Invalid pair (x,y) provided at position '${i}' of the area geom`);
            }
            //Add this point
            curve.point(x, y);
        }
        curve.end(); //End the top curve
        //Move reverse
        for (let i = data.length - 1; i >= 0; i--) {
            let x = context.value(args.x2, data[i], null); //Get x value
            let y = context.value(args.y2, data[i], null); //Get y value
            if (!isNumber(x) || !isNumber(y)) {
                return; context.log.warn(`Invalid pair (x,y) provided at position '${i}' of the area geom`);
            }
            //Add this point
            curve.point(x, y);
        }
        curve.end(); //End the bottom curve
        areaPath.close(); //End the path
        //Return the area path
        return element.attr("d", areaPath.toString());
    },
    "props": defaultProps
};

