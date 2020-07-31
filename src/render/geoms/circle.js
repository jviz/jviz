//import {propTypes, parseProps} from "../../props.js";
import {circle} from "../primitives/circle.js";
import {isNumber} from "../../util.js";

//Circle shape default props
let defaultProps = {
    "x": null,
    "y": null,
    "radius": 5
};

//Export circle geom
export const circleGeom = {
    "tag": "path",
    "type": "circle",
    "render": function (context, datum, props, element) {
        element.attr("d", ""); //Reset circle path
        //Generate circle arguments
        let args = {
            "x": context.value(props.x, datum, null),
            "y": context.value(props.y, datum, null),
            "radius": context.value(props.radius, datum, null)
        };
        //Check if there are a not valid argument
        if (!isNumber(args.x) || !isNumber(args.y) || !isNumber(args.radius)) {
            return null; //TODO: display warning message
        }
        //Build the circle element
        return element.attr("d", circle(args));
    },
    "props": defaultProps
};

