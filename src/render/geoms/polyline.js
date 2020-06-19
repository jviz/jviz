import {propTypes, parseProps} from "../props.js";
import {polyline} from "../render/primitives/polyline.js";

//Segment line default props
let defaultProps = {
    "x1": propTypes.number(),
    "y1": propTypes.number(),
    "x2": propTypes.number(),
    "y2": propTypes.number(),
    "x3": propTypes.number(),
    "y3": propTypes.number(),
    "x4": propTypes.number(),
    "y4": propTypes.number(),
    "x5": propTypes.number(),
    "y5": propTypes.number(),
    "x6": propTypes.number(),
    "y6": propTypes.number(),
    "x7": propTypes.number(),
    "y7": propTypes.number(),
    "x8": propTypes.number(),
    "y8": propTypes.number(),
    "x9": propTypes.number(),
    "y9": propTypes.number(),
    "x10": propTypes.number(),
    "y10": propTypes.number(),
    "x11": propTypes.number(),
    "y11": propTypes.number(),
    "x12": propTypes.number(),
    "y12": propTypes.number(),
    "closed": propTypes.boolean(false)
};

//Export polyline shape
export const polylineShape = {
    "tag": "path",
    "type": "polyline",
    "render": function (context, data, props, element) {
        //element.attr("fill", "none"); //Hack to prevent filled polyline 
        let options = parseProps(context, data, props, defaultProps); 
        let points = [];
        for (let i = 1; i <= 12; i++) {
            //Check if this point is not defined
            if (typeof options[`x${i}`] !== "number" || typeof options[`y${i}`] !== "number") {
                break;
            }
            //Add this point
            points.push([options[`x${i}`], options[`y${i}`]]);
        }
        //Draw the polyline
        return element.attr("d", polyline({
            "points": points,
            "closed": options.closed
        }));
    },
    "props": defaultProps
};

