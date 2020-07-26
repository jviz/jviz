import {isArray} from "../util.js";
import {generatePartition} from "./util/partition.js";
//import {propTypes} from "../props.js";

//Default strack generator
let defaultStackGenerator = function (group, sum, maxSum, field, as) {
    let last = {
        "positive": 0, //Last positive value
        "negative": 0  //Last negative value
    };
    return group.map(function (datum) {
        let value = (field !== null) ? datum[field] : defaultProps.value;
        let sign = (value < 0) ? "negative" : "positive";
        let newDatum = Object.assign({}, datum, {
            [as[0]]: last[sign], //Stack start
            [as[1]]: last[sign] + value //Stack end
        });
        last[sign] = last[sign] + value; //Update last value
        //Return updated datum
        return newDatum;
    });
};

//Centered stak generator
let centerStackGenerator = function (group, sum, maxSum, field, as) {
    let last = (maxSum - sum) / 2;
    return group.map(function (datum) {
        let value = (field !== null) ? datum[field] : defaultProps.value;
        let newDatum = Object.assign({}, datum, {
            [as[0]]: last, //Stack start
            [as[1]]: last + value //Stack end
        });
        last = last + value //Update last
        //Return updated datum
        return newDatum;
    });
};

//Stack generators
let stacks = {
    "default": defaultStackGenerator,
    "center": centerStackGenerator
};

//Default props
let defaultProps = {
    "groupby": null,
    "align": "default", //default | center
    "sortField": null,
    "sortOrder": "asc", //sort order: asc | des
    "field": null,
    "as": ["yStart", "yEnd"],
    "value": 1
};

//Export stack transform
export const stackTransform = {
    "transform": function (context, data, props) {
        //let groupby = (typeof props.groupby === "string") ? props.groupby : null; 
        let align = context.value(props.align, null, defaultProps.align); //Get align value
        if (typeof align !== "string" || (typeof align === "string" && typeof stacks[align] === "undefined")) {
            align = defaultProps.align; //Unknown align value ---> set default
        }
        let field = (typeof props.field === "string") ? props.field : null; //Get stack field
        let as = (isArray(props.as) && props.as.length === 2) ? props.as : defaultProps.as;
        let {groups, groupby} = generatePartition(data, {"groupby": props.groupby}); //Stack groups
        //let maxSumValue = 0; //Store max value of all groups
        let groupSum = []; //To store the grpups sums
        //Get the sum value of all groups
        groups.forEach(function (group, index) {
            groupSum[index] = 0; //Initialize group sum
            group.forEach(function (datum) {
                let value = (field !== null) ? Math.abs(datum[field]) : defaultProps.value;
                groupSum[index] = groupSum[index] + value;
            });
        });
        let groupMaxSum = Math.max.apply(null, groupSum); //Get max group sums
        let outputData = []; //Output data object
        //Build the stack for each group
        groups.forEach(function (group, index) {
            stacks[align](group, groupSum[index], groupMaxSum, field, as).forEach(function (datum) {
                outputData.push(datum); //Save the new datum object
            });
        });
        //Return the new data
        return outputData;
    },
    "props": defaultProps,
    "sourceProps": ["align"]
};

