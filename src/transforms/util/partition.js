import {isArray} from "../../util.js";

//Generate a partition
export function generatePartition (data, groupby) {
    //TODO: check if groupby is an array
    //Check if a group option has been provided
    if (groupby === null || groupby === "") {
        return [data]; //Return a single group
    }
    let groups = [];
    let maps = {}; //Groups mappings
    data.forEach(function (datum, index) {
        let key = datum[groupby];
        //Check if this group is not defined
        if (typeof maps[key] === "undefined") {
            groups.push([]);
            maps[key] = groups.length - 1;
        }
        //Insert this datum
        groups[maps[key]].push(datum);
    });
    //Return generated groups
    return groups;
}


