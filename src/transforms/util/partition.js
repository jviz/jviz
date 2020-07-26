import {isArray} from "../../util.js";

//Check if the provided groupby parameter is valid
let validateGroupby = function (value) {
    if (typeof value === "string" && value.trim() !== "") {
        return true; //Valid groupby value
    }
    //Check for array
    if (isArray(value) === true && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== "string" || value[i].trim() === "") {
                return false; //Not valid
            }
        }
        //If all items are valid
        return true;
    }
    //Other value --> not valid
    return false;
}

//Generate a partition
export function generatePartition (data, options) {
    //TODO: check if groupby is an array
    //Check if a group option has been provided
    //if (typeof options.groupby === "undefined" || options.groupby === null || options.groupby === "") {
    if (validateGroupby(options.groupby) === false) {
        return {"groups": [data], "groupby": []}; //Return a single group
    }
    let groups = []; //Output groups
    let groupby = isArray(options.groupby) ? options.groupby : [options.groupby];
    let maps = {}; //Groups mappings
    data.forEach(function (datum, index) {
        let key = groupby.map(function (field) {
            return "" + datum[field];
        }).join("---");
        //Check if this group is not defined
        if (typeof maps[key] === "undefined") {
            groups.push([]);
            maps[key] = groups.length - 1;
        }
        //Insert this datum
        groups[maps[key]].push(datum);
    });
    //Return generated groups
    return {"groups": groups, "groupby": groupby};
}


