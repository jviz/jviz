import {isNumber} from "../../util.js";
import {polyline} from "../primitives/polyline.js";

//Segment line default props
let defaultProps = {
    "x": null,
    "y": null,
    "x1": null,
    "x2": null,
    "y1": null,
    "y2": null
};

//Export line segment shape
export const lineGeom = {
    "tag": "path",
    "type": "line",
    "render": function (context, data, props, element) {
        element.attr("d", ""); //Reset line path
        element.attr("fill", "none"); //Hack to prevent filled polyline 
        let args = {}; //Initialize line arguments
        //Check if user has provided a vaild x1 and x2 values
        if (typeof props.x1 !== "undefined" && typeof props.x2 !== "undefined") {
            args.x1 = context.value(props.x1, datum, null);
            args.x2 = context.value(props.x2, datum, null);
        }
        //Check if user has provided a single x value
        else if (typeof props.x !== "undefined") {
            args.x1 = context.value(props.x, datum, null);
            args.x2 = args.x1; //Clone x1 value
        }
        //Check for no valid x1 and x2 computed values
        if (!isNumber(args.x1) || !isNumber(args.x2)) {
            return; //TODO: display warning
        }
        //Check if user has provided a vaild y1 and y2 values
        if (typeof props.y1 !== "undefined" && typeof props.y2 !== "undefined") {
            args.y1 = context.value(props.y1, datum, null);
            args.y2 = context.value(props.y2, datum, null);
        }
        //Check if user has provided a single y value
        else if (typeof props.y !== "undefined") {
            args.y1 = context.value(props.y, datum, null);
            args.y2 = args.y1; //Clone y1 value
        }
        //Check for no valid y1 and y2 computed values
        if (!isNumber(args.y1) || !isNumber(args.y2)) {
            return; //TODO: display warning
        }
        //Generate the line
        return element.attr("d", polyline({
            "points": [[args.x1, args.y1], [args.x2, args.y2]],
            "closed": false
        }));
    },
    "props": defaultProps
};

