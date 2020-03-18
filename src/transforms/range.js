import {range} from "../util.js";
import {propTypes} from "../props.js";

//Export range transform properties
export const rangeTransform = {
    "transform": function (context, data, props) {
        //Save the min and max values in the provided state variable
        context.state[props.state].value = range(data, function (datum) {
            return datum[props.field];
        });
        //Return the data without modification
        return data;
    },
    "props": {
        "field": propTypes.string(),
        "state": propTypes.string()
    }
};

