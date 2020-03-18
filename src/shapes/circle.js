import {propTypes, parseProps} from "../props.js";
import {circle} from "../render/primitives/circle.js";

//Circle shape default props
let defaultProps = {
    "x": propTypes.number(),
    "y": propTypes.number(),
    "radius": propTypes.number(5)
};

//Export circle shape
export const circleShape = {
    "tag": "path",
    "type": "circle",
    "render": function (context, data, props, element) {
        //Parse the circle options
        let options = parseProps(context, data, props, defaultProps);
        //Build the circle element
        return element.attr("d", circle({
            //Circle position
            "x": options.x, //context.getContextValue(props.x, data),
            "y": options.y, //context.getContextValue(props.y, data),
            //Circle radius
            "radius": options.radius //context.getContextValue(props.radius, data)
        }));
    },
    "props": defaultProps
};

