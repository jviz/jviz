import {isArray} from "../util.js";
import {max, min, sum, average} from "../util.js";
import {quantile} from "../math.js";
import {propTypes} from "../props.js";

//Median function
let median = function (values, field) {
    return quantile(0.50, values, function (value) {
        return value[field];
    });
};

//Available operations
let availableOperations = {
    //Get the field value of the first item
    "first": function (values, field) {
        return values[0][field];
    },
    //Get the field value of the last item
    "last": function (values, field) {
        return values[values.length - 1][field];
    },
    //Calculate the minimum field value
    "min": function (values, field) {
        return min(values, function (value) {
            return value[field];
        });
    },
    //Calculate the max field value
    "max": function (values, field) {
        return max(values, function (value) {
            return value[field];
        });
    },
    //Calculate que 0,25 quantile
    "q1": function (values, field) {
        return quantile(0.25, values, function (value) {
            return value[field];
        });
    },
    //Calculate the 0.50 quantile (alias of median)
    "q2": function (values, field) {
        return median(values, field);
    },
    //Calculate the 0,75 quantile
    "q3": function (values, field) {
        return quantile(0.75, values, function (value) {
            return value[field];
        });
    },
    //Calculate the median
    "median": function (values, field) {
        return median(values, field);
    },
    //Calculate the mean value
    "mean": function (values, field) {
        return average(values, function (value) {
            return value[field];
        });
    },
    //Calcualte the sum of all field values
    "sum": function (values, field) {
        return sum(values, function (value) {
            return value[field];
        });
    },
    //Count the number of elements
    "count": function (values, field) {
        return values.length;
    }
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
            let value = availableOperations[op[index]](groups[key].items, field); 
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
    "props": {
        "groupby": propTypes.string(""),
        "join": propTypes.boolean(false),
        "fields": propTypes.string(""),
        "op": propTypes.string(""),
        "as": propTypes.string("")
    }
};

