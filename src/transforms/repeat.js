import {isString} from "../util.js";

//Default transform props
let defaultProps = {
    "field": null,
    "as": "rep"
};

//Export repeat transform properties
export const repeatTransform = {
    "transform": function (context, data, props) {
        let field = (typeof props.field === "string") ? props.field.trim() : null; 
        let as = isString(props.as) ? props.as : defaultProps.as;
        if (field === null) {
            //Missing field value --> throw error
            return context.error("Field options is mandatory in repeat transform");
        }
        //New data object
        let newData = []; //New data list
        data.forEach(function (datum) {
            let times = (typeof datum[field] === "number") ? datum[field] : 0;
            for (let i = 0; i < times; i++) {
                newData.push(Object.assign({}, datum, {
                    [as]: i //Save the repeat index
                }));
            }
        });
        //Return the new data object
        return newData;
    },
    "props": defaultProps,
    "sourceProps": []
};

