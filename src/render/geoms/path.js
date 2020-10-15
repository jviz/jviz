import {isNumber} from "../../util.js";

//Path default props
let defaultProps = {
    "x": null,
    "y": null,
    "path": ""
};

//Export path geom
export const pathGeom = {
    "tag": "path",
    "type": "path",
    "render": function (context, datum, props, element) {
        element.attr("transform", ""); //Reset transform
        let path = context.value(props["path"], datum, defaultProps.path); //Get path value
        let x = context.value(props["x"], datum, null);
        let y = context.value(props["y"], datum, null);
        if (isNumber(x) && isNumber(y)) {
            element.attr("transform", `translate(${x},${y})`); //Translate the path
        }
        //Return the element with the path attribute
        return element.attr("d", path);
    },
    "props": defaultProps
};

