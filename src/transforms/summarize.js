//import {propTypes} from "../props.js";
import {applyOperation, isOperation} from "./util/operations.js";
import {isArray} from "../util.js";

//Default props
let defaultProps = {
    "groupby": null,
    "join": false,
    "fields": null,
    "op": null,
    "as": null
};

//Create aggregation
let createAggregation = function (data, field) {
    let groups = {};
    data.forEach(function (datum, index) {
        let key = (field !== "__main") ? datum[field] : "__main"; //Check for no group field provided
        //Check if this group is not defined
        if (typeof groups[key] === "undefined") {
            groups[key] = {
                "key": key,
                "items": [],
                "summary": {}
            };
        }
        //Save to this group
        groups[key].items.push(datum);
    });
    //Return the groups
    return groups;
};

//Apply groups operations
let applyGroupsOperations = function (groups, fields, op, as) {
    Object.keys(groups).forEach(function (key) {
        let output = {}
        //Add the group field
        //output["" + groups[key].field + ""] = group.key;
        //Build for each field
        fields.forEach(function (field, index) {
            //Get the value
            let value = applyOperation(op[index], groups[key].items, field); 
            //Check for renaming field
            if (isArray(as) === true && typeof as[index] === "string") {
                output["" + as[index] + ""] = value;
            }
            //Default: save it as the original field name
            else {
                output["" + field + ""] = value;
            }
        });
        //Assign to the group item
        groups[key].summary = output;
    });
    //Return the groups object
    return groups;
};

//Export summarize transform
export const summarizeTransform = {
    "transform": function (context, data, props) {
        //Get the group field
        let groupField = (typeof props.groupby === "string") ? props.groupby : "__main"; 
        //Build the aggregation groups
        let groups = createAggregation(data, groupField);
        //Check if no operation is provided
        if (typeof props.fields === "undefined" || isArray(props.fields) === false) {
            //Perform only the count operation for each group
            Object.keys(groups).forEach(function (key) {
                groups[key].summary = {
                    "count": groups[key].items.length
                };
            });
        }
        else {
            //Apply transform operations
            groups = applyGroupsOperations(groups, props.fields, props.op, props.as);
        }
        //Check the join to items option
        if (typeof props.join === "boolean" && props.join === true) {
            //Join the summary data to each item of the data
            return data.map(function (item) {
                let group = (groupField !== "__main") ? groups[item[groupField]] : groups[groupField];
                //Assing extra keys to this item
                Object.keys(group.summary).forEach(function (key) {
                    item[key] = group.summary[key];
                });
                return item;
            });
        }
        //No join option provided --> return only the summary data
        return Object.keys(groups).map(function (key) {
            let output = groups[key].summary;
            //Add the grouped key
            if (groupField !== "__main") {
                output[groupField] = key;
            }
            //Return the summary object
            return output;
        });
    },
    "props": defaultProps
};

