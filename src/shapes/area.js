import {propTypes} from "../props.js";
import {path} from "../path.js";
import {getCurve} from "./curves/index.js";

//Area default props
let defaultProps = {
    //"x": propTypes.number(),
    //"y": propTypes.number(),
    "x1": propTypes.number(0),
    "x2": propTypes.number(0),
    "y1": propTypes.number(0),
    "y2": propTypes.number(0),
    "curve": propTypes.string("linear") // linear|catmull-roll|step|step-after|step-before
};

//Method for drawing an area
function area (args) {
    //Initialize the path
    let data = args.data;
    let areaPath = path(); //Get the path generator
    let curve = getCurve(args.curve)(areaPath); //Build the curve generator
    //Build the forward line of the area
    for (let i = 0; i < data.length; i++) {
        curve.point(args.x1(data[i], i), args.y1(data[i], i));
    }
    curve.end();
    //Move reverse
    for (let i = data.length - 1; i >= 0; i--) {
        curve.point(args.x2(data[i], i), args.y2(data[i], i));
    }
    curve.end(); //End the curve
    areaPath.close(); //End the path
    return areaPath.toString();
}

//Export area shape
export const areaShape = {
    "type": "area",
    "tag": "path",
    "render": function (context, data, props, element) {
        return element.attr("d", area({
            "x1": function (datum) {
                return context.value(props.x1, datum, 0);
            },
            "x2": function (datum) {
                return context.value(props.x2, datum, 0);
            },
            "y1": function (datum) {
                return context.value(props.y1, datum, 0);
            },
            "y2": function (datum) {
                return context.value(props.y2, datum, 0)
            },
            //Interpolation curve
            "curve": context.value(props.curve, data[0], defaultProps.curve.defaultValue),
            //Points to draw
            "data": data
        }));
    },
    "props": defaultProps
};

