import {isArray} from "../util.js";
//import {propTypes} from "../props.js";

//Default strack generator
let defaultStackGenerator = function (group, maxGroupValue, field, as) {
    let last = {
        "positive": 0, //Last positive value
        "negative": 0  //Last negative value
    };
    return group.forEach(function (datum) {
        let value = (field !== null) ? datum[field] : defaultProps.value;
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
        let value = (field !== null) ? datum[field] : defaultProps.value;
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
    "sortField": null,
    "sortOrder": "asc", //sort order: asc | des
    "field": null,
    "as": ["yStart", "yEnd"],
    "value": 1
};

//Export stack transform
export const stackTransform = {
    "transform": function (context, data, props) {
        let groupby = (typeof props.groupby === "string") ? props.groupby : null; 
        let align = context.value(props.align, null, defaultProps.align); //Get align value
        if (typeof align !== "string" || (typeof align === "string" && typeof stacks[align] === "undefined")) {
            align = defaultProps.align; //Unknown align value ---> set default
        }
        let field = (typeof props.field === "string") ? props.field : null; //Get stack field
        let groups = []; //Stack groups
        let maxGroupValue = 0; //Store max value of all groups
        //Check if no groupby has been provided
        //console.log(groupby);
        if (groupby === null || groupby === "") {
            groups = [data];
            //Calculate the sum value of the group
            groups[0].sum = 0;
            groups[0].forEach(function (datum) {
                let value = (field !== null) ? Math.abs(datum[props.field]) : defaultProps.value;
                groups[0].sum = groups[0].sum + value;
            });
            //maxGroupValue = groups[0].sum; //Update max value
        }
        //Else: groupby value provided --> generate groups
        else {
            let maps = {}; //Groups mappings
            data.forEach(function (datum, index) {
                let key = datum[groupby];
                let value = (field !== null) ? Math.abs(datum[props.field]) : defaultProps.value;
                //Check if this group is not defined
                if (typeof maps[key] === "undefined") {
                    groups.push([]);
                    groups[groups.length - 1].sum = 0; //Initialize group sum value
                    maps[key] = groups.length - 1;
                }
                //Insert this datum
                groups[maps[key]].push(datum);
                groups[maps[key]].sum = groups[maps[key]].sum + value; //Math.abs(datum[props.field]);
            });
        }
        //console.log(groups);
        //Get max value
        groups.forEach(function (group) {
            maxGroupValue = Math.max(group.sum, maxGroupValue);
        });
        //Build the stack for each group
        groups.forEach(function (group) {
            stacks[align](group, maxGroupValue, field, defaultProps.as);
        });
        //Return the data
        return data;
    },
    "props": defaultProps,
    "sourceProps": ["align"]
};

