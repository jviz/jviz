import {path} from "../path.js";
import {getCurve} from "../curves/index.js";
import {isNumber} from "../../util.js";

//Curve default props
let defaultProps = {
    "x": null,
    "y": null,
    "curve": "linear" // linear|catmull-roll|step|step-after|step-before
};

//Export curve geom
export const curveGeom = {
    "tag": "path",
    "type": "curve",
    "render": function (context, data, props, element) {
        element.attr("fill", "none"); //Hack to prevent filled polyline 
        element.attr("d", ""); //Reset line path
        //Check if no data object has been provided
        if (data === null) {
            return context.log.warn("Curve geom needs a valid data object to be rendered");
        }
        //Check if data object does not have at least 2 points
        if (data.length < 2) {
            return context.log.warn(`Curve geom needs at least 2 points to be rendered, but provided '${data.length}'`);
        }
        //Initialize the curve arguments
        let args = {
            "curve": context.value(props.curve, data[0], defaultProps.curve)
        };
        if (typeof args.curve !== "string" || args.curve.length === 0) {
            return context.log.warn("Invalid curve type provided to curve geom");
        }
        //Initialize the path for drawing the curve
        let curvePath = path();
        //Get the wanted curve name 
        //--> if no curve is provided, linear will be used
        let curve = getCurve(args.curve)(curvePath); //initialize the curve
        //Start drawing the curve
        for (let i = 0; i < data.length; i++) {
            let x = context.value(props.x, data[i], null); //Get x value
            let y = context.value(props.y, data[i], null); //Get y value
            if (!isNumber(x) || !isNumber(y)) {
                return context.log.warn(`Invalid pair (x,y) provided at position '${i}' of the curve geom`);
            }
            //Add this point
            curve.point(x, y);
        }
        curve.end(); //Finish the curve
        //Return the curve element
        return element.attr("d", curvePath.toString());
    },
    "props": defaultProps
};

