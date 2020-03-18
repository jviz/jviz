import {evaluate} from "../evaluate.js";
import {propTypes} from "../props.js";

//Export formula transform
export const formulaTransform = {
    "transform": function (context, data, props) {
        return data.map(function (datum, index) {
            //Save the expression value as a new datum field
            datum[props.as] = context.expression(props.expr, {
                "datum": datum
            });
            //Return the new datum object
            return datum;
        });
    },
    "props": {
        "expr": propTypes.string(),
        "as": propTypes.string()
    }
};

