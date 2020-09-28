import {isString, isArray, isNumber, range} from "../util.js";
import {clamp} from "../math.js";
import {generatePartition} from "./util/partition.js";

//Default props
let defaultMethods = ["equal", "optimized"];
let defaultProps = {
    "groupby": null,
    "method": "equal", //equal|optimized
    "field": "",
    "domain": null, //Domain for the data
    "range": [0, 1], //Default range
    "separation": 0, //Spacing distance
    //"join": true, //Join new positions to the original data
    "clamp": false, //Clamp the position between the range
    "as": "x" //Field to store the new position
};

//Available methods
let methods = {
    "equal": function (items, repulsion) {
        let minPosition = 0 + (repulsion / 2); //Math.min(scale.range[0], scale.range[1]);
        let maxPosition = 1 - (repulsion / 2); //Math.max(scale.range[0], scale.range[1]);
        //Calculate the separation between each item
        let spacing = (maxPosition - minPosition) / (items.length + 1);
        //Set the end item position
        return items.map(function (item, index) {
            return Object.assign(item, {
                "position": minPosition + spacing * (index + 1)
            });
        });
    },
    "optimized": function (items, repulsion, clampRange) {
        let minPosition = 0 + (repulsion / 2); //Math.min(scale.range[0], scale.range[1]);
        let maxPosition = 1 - (repulsion / 2); //Math.max(scale.range[0], scale.range[1]);
        //Place all items
        for (let i = 0; i < items.length; i++) {
            //Check for not the first item
            if (i > 0) {
                let j = i - 1;
                if (items[i].origin < items[j].position + repulsion) {
                    let centerSum = items[i].origin + items[j].origin;
                    let centerCount = 2;
                    j = j - 1;
                    while (j >= 0) {
                        if (Math.abs(items[j + 1].position - items[j].position) > 3 * repulsion / 2) {
                            break; //No more items to add
                        }
                        //Add this group
                        centerSum = centerSum + items[j].origin;
                        centerCount = centerCount + 1;
                        //Previous group
                        j = j - 1;
                    }
                    //Calculate the next center pointer
                    let center = centerSum / centerCount;
                    //Set the position of this item
                    items[i].position = center + (centerCount - 1) * repulsion / 2;
                    //Update the position of each item position
                    for (let k = i - 1; k >= 0; k--) {
                        //Check the distance between the two items positions
                        let diff = items[k].position - items[k + 1].position + repulsion;
                        if (diff <= 0) {
                            break;
                        }
                        //Update the position of the group circle
                        items[k].position = items[k].position - diff;
                    }
                }
            }
        }
        //Check if the clamp option has been provided
        if (clampRange === true) {
            //Check the position of the first item
            if (items[0].position < minPosition) {
                items[0].position = minPosition;
                //Update the position of solaped circles
                for (let i = 1; i < items.length; i++) {
                    let diff = items[i-1].position - items[i].position + repulsion;
                    if (diff <= 0) {
                        break; //Mo more circles to move
                    }
                    items[i].position = items[i].position + diff;
                }
            }
            //Check the position of the last item
            let lastIndex = items.length - 1;
            if (items[lastIndex].position > maxPosition) {
                items[lastIndex].position = maxPosition;
                //Update the position of solaped circles
                for (let i = lastIndex - 1; i >= 0; i--) {
                    let diff = items[i].position - items[i+1].position + repulsion;
                    if (diff <= 0) {
                        break; //No more circles to move
                    }
                    items[i].position = items[i].position - diff;
                }
            }
        }
        //Return items
        return items;
    }
};

//Parse domain data
let parseDomain = function (context, domain, data, field) {
    if (isArray(domain) === true && domain.length === 2) {
        let d = domain.map(function (value) {
            return context.value(value, null, null);
        });
        //Validate the values of the new domain
        return (isNumber(d[0]) && isNumber(d[1])) ? d : null;
    }
    //Other value --> get domain from data
    return range(data, function (datum) {
        return datum[field];
    });
};

//Parse repulsion distance
let parseRepulsion = function (context, separation) {
    let value = context.value(separation, null, defaultProps.separation);
    if (typeof value === "undefined" || value === null) {
        return defaultProps.separation; //Return default value
    }
    //Convert to number
    value = Number(value);
    return (isNaN(value) === true) ? defaultProps.separation : value;
};

//Export spacing transform properties
export const spacingTransform = {
    "transform": function (context, data, props) {
        //Check for empty data --> skip transform
        if (data.length === 0) {
            return data; //Nothing to do
        }
        let field = isString(props.field) ? props.field.trim() : null; 
        let as = isString(props.as) ? props.as : defaultProps.as;
        let method = context.value(props.method, null, defaultProps.method);
        let clampRange = props.clamp === true; //Clamp range
        let repulsion = parseRepulsion(context, props.separation); //context.value(props.distance, null, 0);
        if (field === null) {
            //Missing field value --> throw error
            return context.error("Field option is mandatory for spacing transform");
        }
        //Check for no valid method provided
        if (method === null || typeof methods[method] === "undefined") {
            return context.error(`Unknown provided method '${method}' for the spacing transform`); 
        }
        let newData = []; //New data object
        let partition = generatePartition(data, props); //Generate partition
        partition.groups.forEach(function (group) {
            let domain = parseDomain(context, props.domain, group, field); //Get domain
            //Initialize the items to space
            let domainSize = domain[1] - domain[0];
            let items = group.map(function (datum, index) {
                //let value = scale(item[props.field]);
                let value = clamp((datum[field] - domain[0]) / domainSize, 0, 1);
                return {
                    "index": index,
                    "origin": value,
                    "position": value
                };
            });
            //Apply spacing method
            return methods[method](items, repulsion, clampRange).forEach(function (item) {
                newData.push(Object.assign(group[item.index], {
                    [as]: item.position
                }));
            });
        });
        //Return new data object
        return newData;
    },
    "props": defaultProps,
    "sourceProps": ["domain", "method", "separation"]
};

