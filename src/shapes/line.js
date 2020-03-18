import {propTypes} from "../props.js";
import {path} from "../path.js";
import {getCurve} from "./curves/index.js";

//Line default props
let defaultProps = {
    "x": propTypes.number(0),
    "y": propTypes.number(0),
    "curve": propTypes.string("linear") // linear|catmull-roll|step|step-after|step-before
};

//Generate a line (or polyline)
function line (args) {
    let data = args.data;
    let linePath = path();
    //Get the wanted curve name 
    //--> if no curve is provided, linear will be used
    let curve = getCurve(args.curve)(linePath); //initialize the curve
    //Start drawing the polyline
    for (let i = 0; i < data.length; i++) {
        curve.point(args.x(data[i], i), args.y(data[i], i));
    }
    curve.end(); //Finish the curve
    return linePath.toString();
}

//Export lie shape
export const lineShape = {
    "tag": "path",
    "type": "line",
    "render": function (context, data, props, element) {
        element.attr("fill", "none"); //Hack to prevent filled polyline 
        return element.attr("d", line({
            "x": function (datum) {
                return context.value(props.x, datum, 0);
            },
            "y": function (datum) {
                return context.value(props.y, datum, 0);
            },
            "curve": context.value(props.curve, data[0], defaultProps.curve.defaultValue),
            "data": data
        }));
    },
    "props": defaultProps
};

