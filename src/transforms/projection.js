import {nest, isArray} from "../util.js";

//Projection default props
let defaultProps = {
    "fields": [],
    "as": []
};

//Export projection transform
export const projectionTransform = {
    "transform": function (context, data, props) {
        let fields = isArray(props.fields) ? props.fields : [props.fields];
        let as = isArray(props.as) ? props.as : [props.as];
        if (as.length !== fields.length) {
            //TODO: throw error
            return [];
        }
        //Parse dataset rows
        return data.map(function (datum) {
            let newDatum = {}; //New datum object
            for (let i = 0; i < fields.length; i++) {
                newDatum[as[i]] = nest(datum, fields[i]); //Add field
            }
            //Return the new datum object
            return newDatum;
        });
    },
    "props": defaultProps,
    "sourceProps": []
};

