import {isArray, values as objectValues} from "../util.js";

//Reduce an array
let reduce = function (array, initialValue, callback) {
    return array.reduce(callback, initialValue);
};

//Convert an argument to array
let toArray = function (values) {
    //Check if values is an array
    if (isArray(values) === true) {
        return values;
    }
    //Default: return the value as an item of an array
    return [values];
};

//Group data
let groupData = function (data, keys, index) {
    if (keys.length <= index) {
        return [data];
    }
    //Get the key to apply
    let key = keys[index];
    let groups = {};
    //Iterate over all data items
    data.forEach(function (datum, index) {
        if (typeof groups[datum[key]] === "undefined") {
            groups[datum[key]] = [];
        }
        //Save this datum item
        groups[datum[key]].push(datum);
    });
    return reduce(objectValues(groups), [], function (current, items) {
        return current.concat(groupData(items, keys, index + 1));
    });
};

//Get context source data
export function source (props) {
    let context = this;
    //Check if data props is defined
    if (typeof props === "object" && props !== null) {
        //Check for array data
        if (isArray(props) === true) {
            return [props];
        }
        //Check for forces data
        if (typeof props.force === "string") {
            return [context.forces.value[props.force]]; //Get from force data
        }
        //Check for undefined data source
        if (typeof props.data !== "string") {
            //TODO: throw error
        }
        //Initialize the output data object
        let data = [context.data[props.data].value];
        //console.log(context);
        //Check for group data by the provided key
        if (typeof props.groupby === "string" || isArray(props.groupby) === true) {
            data =  groupData(data[0], toArray(props.groupby), 0);
        }
        //Check for transform to apply to this data
        //if (isArray(props.transform) === true) {
        //    data = data.map(function (dataItem) {
        //        return context.transform(dataItem, props.transform);
        //    });
        //}
        //Return processed data
        return data;
    }
    //Default: return an empty data object
    return [[null]];
}


