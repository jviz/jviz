import {isString, isArray, isNumber, range} from "../util.js";
import {clamp} from "../math.js";

//Default props
let defaultMethods = ["equal", "optimized"];
let defaultProps = {
    "method": "equal", //equal|optimized
    "field": "",
    "domain": null, //Domain for the data
    "separation": 0, //Spacing distance
    //"join": true, //Join new positions to the original data
    "as": "x" //Field to store the new position
};

//Parse domain data
let parseDomain = function (context, domain) {
    if (isArray(domain) === true && domain.length === 2) {
        let d = domain.map(function (value) {
            return context.value(value, null, null);
        });
        //Validate the values of the new domain
        return (isNumber(d[0]) && isNumber(d[1])) ? d : null;
    }
    //Other value --> domain not valid
    return null;
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
        let domain = parseDomain(context, props.domain, data);
        let method = context.value(props.method, null, defaultProps.method);
        let repulsion = parseRepulsion(context, props.separation); //context.value(props.distance, null, 0);
        if (field === null) {
            //Missing field value --> throw error
            return context.error("Field option is mandatory for spacing transform");
        }
        //Check for no valid method provided
        if (defaultMethods.indexOf(method.toLowerCase()) === -1) {
            return context.error(`Unknown provided method '${method}' for the spacing transform`); 
        }
        //Check for no valid domain provided --> get from data
        if (domain === null) {
            domain = range(data, function (datum) {
                return datum[field];
            });
        }
        //Initialize the items to space
        let items = data.map(function (item, index) {
            //let value = scale(item[props.field]);
            let value = clamp((value - domain[0]) / (domain[1]-domain[0]), 0, 1);
            return {
                "origin": value,
                "position": value
            };
        });
        //Get the other values
        let minPosition = 0; //Math.min(scale.range[0], scale.range[1]);
        let maxPosition = 1; //Math.max(scale.range[0], scale.range[1]);
        //Optimized spaciong algorithm
        if (method.toLowerCase() === "optimized") {
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
        //Equal spacing algorithm
        else {
            //Calculate the separation between each item
            let spacing = (maxPosition - minPosition) / (items.length + 1);
            //Set the end item position
            items.forEach(function (item, index) {
                item.position = minPosition + spacing * (index + 1);
            });
        }
        //Add the values to each datum
        return data.map(function (datum, index) {
            return Object.assign(datum, {
                [as]: items[index].position
            });
        });
    },
    "props": defaultProps,
    "sourceProps": ["domain", "method", "separation"]
};

