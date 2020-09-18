import {isNumber, isArray} from "../../util.js";
import {polyline} from "../primitives/polyline.js";

//Segment line default props
let defaultProps = {
    "points": [],
    "closed": false
};

//Export polyline geom
export const polylineGeom = {
    "tag": "path",
    "type": "polyline",
    "render": function (context, datum, props, element) {
        element.attr("fill", "none"); //Hack to prevent filled polyline 
        if (!isArray(props.points) || props.points.length === 0) {
            return element.attr("d", ""); //Nothing to draw
        }
        //Build points
        let points = [];
        props.points.forEach(function (point) {
            if (!isArray(point) || point.length !== 2) {
                return null; //Not valid point
            }
            //Save this point parsed
            return points.push(point.map(function (value) {
                return context.value(value, datum, 0)
            }));
        });
        //Draw the polyline
        return element.attr("d", polyline({
            "points": points,
            "closed": context.value(props.closed, datum, defaultProps.closed) 
        }));
    },
    "props": defaultProps
};

