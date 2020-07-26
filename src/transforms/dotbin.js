import {generatePartition} from "./util/partition.js";
import {dotbin} from "../statistics.js";
//import {range} from "../util.js";

//Dotbin transform default props
let defaultProps = {
    "field": null,
    "groupby": null,
    "as": "bin",
    "step": null
};

//Export dotbin transform
export const dotbinTransform = {
    "transform": function (context, data, props) {
        let field = props.field; //Get wanted field
        let as = (typeof props.as === "string" && props.as.length > 0) ? props.as : defaultProps.as;
        let groupby = (typeof props.groupby === "string") ? props.groupby.trim() : null;
        let groups = generatePartition(data, props.groupby);
        let outputValues = []; //Output values
        groups.forEach(function (group, index) {
            let values = group.map(function (datum) {
                return datum[field]; //Get wanted field
            });
            let n = values.length;
            let domain = [values[0], values[n - 1]]; //Get domain
            let span = domain[1] - domain[0]; //Get domain size
            let step = context.value(props.step, null, span / 30); //Get step for this group
            dotbin(values, step, false).forEach(function (bin) {
                for (let i = bin.startIndex; i <= bin.endIndex; i++) {
                    outputValues.push(Object.assign({}, group[i], {
                        [as]: bin.position
                    }));
                }
            });
        });
        //Return new dataset
        return outputValues;
    },
    "props": defaultProps,
    "sourceProps": ["step"]
};

