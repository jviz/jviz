import {path} from "../path.js";
import {getCurve} from "../curves/index.js";
import {propTypes} from "../../props.js";

//Curve default props
let defaultProps = {
    "x": propTypes.number(0),
    "y": propTypes.number(0),
    "curve": propTypes.string("linear") // linear|catmull-roll|step|step-after|step-before
};

//Generate a curve
function curve (args) {
    let data = args.data;
    let curvePath = path();
    //Get the wanted curve name 
    //--> if no curve is provided, linear will be used
    let curveDraw = getCurve(args.curve)(curvePath); //initialize the curve
    //Start drawing the curve
    for (let i = 0; i < data.length; i++) {
        curveDraw.point(args.x(data[i], i), args.y(data[i], i));
    }
    curveDraw.end(); //Finish the curve
    return curvePath.toString();
}

//Export curve geom
export const curveGeom = {
    "tag": "path",
    "type": "curve",
    "render": function (context, data, props, element) {
        element.attr("fill", "none"); //Hack to prevent filled polyline 
        return element.attr("d", line({
            "x": function (datum) {
                return context.value(props.x, datum, defaultProps.x.defaultValue);
            },
            "y": function (datum) {
                return context.value(props.y, datum, defaultProps.y.defaultValue);
            },
            "curve": context.value(props.curve, data[0], defaultProps.curve.defaultValue),
            "data": data
        }));
    },
    "props": defaultProps
};

