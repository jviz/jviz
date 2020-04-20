import {propTypes} from "../props.js";

//Export extend transform
export const extendTransform = {
    "transform": function (context, data, props) {
        let sourceData = context.data[props.from].value; //Source data
        let sourceMap = {}; // Create a mapping for all source keys
        sourceData.forEach(function (datum, index) {
            sourceMap[datum[props.sourceField]] = index;
        });
        return data.map(function (datum) {
            let key = datum[props.targetField];
            if (typeof sourceMap[key] !== "undefined") {
                let sourceDatum = sourceData[sourceMap[key]];
                props.fields.forEach(function (value, index) {
                    datum[props.as[index]] = sourceDatum[value];
                });
            }
            //Return the datun object
            return datum;
        });
    },
    "props": {
        "from": propTypes.string(),
        "sourceField": propTypes.string(),
        "targetField": propTypes.string(),
        "fields": propTypes.string(),
        "as": propTypes.string()
    }
};

