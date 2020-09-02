import {isArray} from "../util.js";

//Melt default props
let defaultProps = {
    "fields": [],
    "as": ["key", "value"]
};

//Export melt transform
export const meltTransform = {
    "transform": function (context, data, props) {
        let fields = (isArray(props.fields)) ? props.fields : [props.fields];
        let as = (isArray(props.as) && props.as.length === 2) ? props.as : defaultProps.as;
        let newData = []; //New data object
        //Iterate over fields items
        fields.forEach(function (field) {
            return data.forEach(function (datum, index) {
                if (typeof datum[field] === "undefined") {
                    throw new Error(`Undefined field '${field}' at position '${index}' of data`);
                }
                //Generate a new datum object
                newData.push(Object.assign({}, datum, {
                    [as[0]]: field,
                    [as[1]]: datum[field]
                }));
            });
        });
        //Return new data object
        return newData;
    },
    "props": defaultProps
};

