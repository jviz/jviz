import {parseProps, propTypes} from "../props.js";
import {polyline} from "../render/primitives/polyline.js";

//Segment line default props
let defaultProps = {
    "x": propTypes.number(),
    "y": propTypes.number(),
    "x1": propTypes.number(),
    "x2": propTypes.number(),
    "y1": propTypes.number(),
    "y2": propTypes.number()
};

//Export line segment shape
export const segmentShape = {
    "tag": "path",
    "type": "segment",
    "render": function (context, data, props, element) {
        element.attr("fill", "none"); //Hack to prevent filled polyline 
        let options = parseProps(context, data, props, defaultProps); 
        //let x1 = lineProps.x1, x2 = lineProps.x2, y1 = props.y1, y2 = lineProps.y2;
        //Check if user has provided a vaild x value
        if (typeof options.x === "number") {
            Object.assign(options, {
                "x1": options.x, 
                "x2": options.x
            });
        }
        //Check if user has provided a valid y value
        if (typeof options.y === "number") {
            Object.assign(options, {
                "y1": options.y, 
                "y2": options.y
            });
        }
        return element.attr("d", polyline({
            "points": [
                [options.x1, options.y1],
                [options.x2, options.y2]
            ],
            "closed": false
        }));
    },
    "props": defaultProps
};

