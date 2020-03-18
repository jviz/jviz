import {nest as nestObject} from "../util.js";
import {propTypes} from "../props.js";

//Export rename transform
export const renameTransform = {
    "transform": function (context, data, props) {
        return data.map(function (datum) {
            //Initialize the new datum object
            let newDatum = {};
            //For each field provided
            props.fields.forEach(function (field, index) {
                newDatum[props.as[index]] = nestObject(datum, field);
            });
            //Return the new datum object
            return Object.assign({}, datum, newDatum);
        });
    },
    "props": {
        "fields": propTypes.string(),
        "as": propTypes.string()
    }
};

