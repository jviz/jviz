import {isArray} from "../util.js";
import {propTypes} from "../props.js";

//Export stack transform
export const stackTransform = {
    "transform": function (context, data, props) {
        let groupby = (typeof props.groupby === "string") ? props.groupby : null; 
        let groups = [];
        //Check if no groupby has been provided
        if (groupby === null) {
            groups = [data];
        }
        else {
            let maps = {}; //Groups mappings
            data.forEach(function (datum, index) {
                let key = data[groupby];
                //Check if this group is not defined
                if (typeof maps[key] === "undefined") {
                    groups.push([]);
                    maps[key] = groups.length;
                }
                //Insert this datum
                groups[maps[key]].push(datum);
                //Update the sum
                //groups[maps[key]].sum = groups[maps[key]].sum + Math.abs(datum[props.field]);
            });
        }
        //Build the stack for each group
        groups.forEach(function (group) {
            let lastValue = 0; //Initialize the accumulator
            return group.forEach(function (item) {
                Object.assign(item, {
                    [props.as[0]]: lastValue,
                    [props.as[1]]: lastValue + item[props.field]
                });
                //Update the last value
                lastValue = lastValue + item[props.field];
            });
        });
        //Return the data
        return data;
    },
    "props": {
        "groupby": propTypes.string(""),
        "sort": propTypes.string(""),
        "field": propTypes.string(""),
        "as": ["yStart", "yEnd"]
    }
};

