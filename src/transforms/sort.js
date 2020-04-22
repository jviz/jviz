import {sort} from "../math.js";
import {isArray} from "../util.js";

//Export sort transform
export const sortTransform = {
    "transform": function (context, data, props) {
        let fields = isArray(props.fields) ? props.fields : [props.fields]; //Convert fields to array
        let order = isArray(props.order) ? props.order : [props.order]; //Convert order to array
        //Check if fields and order have not the same size
        if (order.length !== fields.length) {
            throw new Error("Order has not the same length of fields in sort transform");
        }
        //Sort data
        return sort(data, fields, order);
    },
    "props": {
        "fields": [],
        "order": []
    }
};

