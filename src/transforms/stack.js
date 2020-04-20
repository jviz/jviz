import {isArray} from "../util.js";
//import {propTypes} from "../props.js";

//Default strack generator
let defaultStackGenerator = function (group, maxGroupValue, field, as) {
    let last = {
        "positive": 0, //Last positive value
        "negative": 0  //Last negative value
    };
    return group.forEach(function (datum) {
        let value = datum[field];
        let sign = (value < 0) ? "negative" : "positive";
        datum[as[0]] = last[sign]; //Set stack start
        datum[as[1]] = last[sign] + value; //Set stack end
        last[sign] = last[sign] + value; //Update last value
    });
};

//Centered stak generator
let centerStackGenerator = function (group, maxGroupValue, field, as) {
    let last = (maxGroupValue - group.sum) / 2;
    return group.forEach(function (datum) {
        let value = Math.abs(datum[field]);
        datum[as[0]] = last; //Set stack start
        datum[as[1]] = last + value; //Set stack end
        last = last + value
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
    "field": "",
    "as": ["yStart", "yEnd"]
};

//Export stack transform
export const stackTransform = {
    "transform": function (context, data, props) {
        let groupby = (typeof props.groupby === "string") ? props.groupby : null; 
        let groups = []; //Stack groups
        let maxGroupValue = 0; //Store max value of all groups
        //Check if no groupby has been provided
        //console.log(groupby);
        if (groupby === null || groupby === "") {
            groups = [data];
            //Calculate the sum value of the group
            groups[0].sum = 0;
            groups[0].forEach(function (datum) {
                groups[0].sum = groups[0].sum + Math.abs(datum[props.field]);
            });
            //maxGroupValue = groups[0].sum; //Update max value
        }
        //Else: groupby value provided --> generate groups
        else {
            let maps = {}; //Groups mappings
            data.forEach(function (datum, index) {
                let key = datum[groupby];
                //Check if this group is not defined
                if (typeof maps[key] === "undefined") {
                    groups.push([]);
                    groups[groups.length - 1].sum = 0; //Initialize group sum value
                    maps[key] = groups.length - 1;
                }
                //Insert this datum
                groups[maps[key]].push(datum);
                groups[maps[key]].sum = groups[maps[key]].sum + Math.abs(datum[props.field]);
            });
        }
        //console.log(groups);
        //Get max value
        groups.forEach(function (group) {
            maxGroupValue = Math.max(group.sum, maxGroupValue);
        });
        //Build the stack for each group
        groups.forEach(function (group) {
            stacks[props.align](group, maxGroupValue, props.field, defaultProps.as);
        });
        //Return the data
        return data;
    },
    "props": defaultProps
};

