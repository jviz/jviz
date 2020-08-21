import {isArray} from "../../util.js";
import {max, min, sum, average} from "../../util.js";
import {quantile} from "../../math.js";

//Median function
let median = function (values, field) {
    return quantile(0.50, values, function (value) {
        return value[field];
    });
};

//Available operations
export const operations = {
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

//Check if the provided operation exists
export function isOperation (name) {
    return typeof operations[name] === "function";
}

//Apply the provided operation
export function applyOperation (name, values, field) {
    return operations[name](values, field);
}

