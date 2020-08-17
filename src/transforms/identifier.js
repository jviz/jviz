import {isString} from "../util.js";

//Default transform props
let defaultProps = {
    "groupby": null,
    "as": "index"
};

//Export identifier transform properties
export const identifierTransform = {
    "transform": function (context, data, props) {
        let groupby = (typeof props.groupby === "string") ? props.groupby.trim() : null; 
        let as = isString(props.as) ? props.as : defaultProps.as;
        let groups = [];
        //Build groups
        if (groupby !== null) {
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
        }
        //No groupby property provided --> use only one group
        else {
            groups = [data]; //Register only one group with all elements
        }
        //Add the index for all datum elements
        let newData = []; //New data list
        groups.forEach(function (group) {
            return group.forEach(function (datum, index) {
                return newData.push(Object.assign({}, datum, {
                    [as]: index //Save the index of the datum in the list
                }));
            });
        });
        //Return the new data object
        return newData;
    },
    "props": defaultProps,
    "sourceProps": []
};

