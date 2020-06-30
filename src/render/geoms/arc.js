import {propTypes, parseProps} from "../../props.js";
import {arc} from "../primitives/arc.js";

//Arc default props
let defaultProps = {
    "startAngle": propTypes.number(),
    "endAngle": propTypes.number(),
    "innerRadius": propTypes.number(),
    "outerRadius": propTypes.number(),
    "angle": propTypes.number(),
    "radius": propTypes.number(),
    "x": propTypes.number(),
    "y": propTypes.number()
};

//Export arc geom
export const arcGeom = {
    "tag": "path",
    "type": "arc",
    "render": function (context, data, props, element) {
        //Initialize the arc options
        let options = parseProps(context, data, props, defaultProps);
        //Check if user has provided only a radius property
        if (typeof options.radius === "number") {
            Object.assign(options, {
                "innerRadius": 0, 
                "outerRadius": options.radius
            });
        }
        //Check for custom angle
        if (typeof options.angle === "number") {
            Object.assign(options, {
                "startAngle": 0,
                "endAngle": options.angle
            });
        }
        //Add the arc center
        Object.assign(options, {
            "centerX": options.x,
            "centerY": options.y
        });
        //Build the arc
        element.attr("d", arc(options));
    },
    "props": defaultProps
};

