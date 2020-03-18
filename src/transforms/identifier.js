import {propTypes} from "../props.js";

//Export identifier transform properties
export const identifierTransform = {
    "transform": function (context, data, props) {
        return data.map(function (datum, index) {
            return Object.assign(datum, {
                [props.as]: index  //Add the index as an identifier of this datum
            });
        });
    },
    "props": {
        "as": propTypes.string()
    }
};

