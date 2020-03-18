import {evaluate} from "../evaluate.js";
import {propTypes} from "../props.js";

//Export filter transform properties
export const filterTransform = {
    "transform": function (context, data, props) {
        //Filter the data list
        return data.filter(function (datum, index) {
            return context.expression(props.expr, {"datum": datum}) === true; 
        });
    },
    "props": {
        "expr": propTypes.string()
    }
};

