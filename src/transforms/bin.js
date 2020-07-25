import {clamp} from "../math.js";
import {bins} from "../statistics.js";
import {isArray, isObject, range} from "../util.js";

//Bin transform default props
let defaultProps = {
    "field": null,
    "domain": null,
    "step": null,
    "bins": 10,
    "minbins": 10,
    "maxbins": 50,
    "as": ["binIndex", "binStart", "binEnd"]
};

//Get domain
let getDomain = function (context, domain) {
    //Check for array domain --> call context.value for each item
    if (isArray(domain) && domain.length === 2) {
        return domain.map(function (value) {
            return context.value(value, null, 0);
        });
    }
    //Check for object
    else if (isObject(domain)) {
        return context.value(domain, null, null); //Get domain from context
    }
    //Other value --> no domain provided
    return null;
};

//Export bin transform
export const binTransform = {
    "transform": function (context, data, props) {
        let field = props.field;
        let domain = getDomain(context, props.domain); //Get bin domain
        let domainSize = 0; //To store domain size
        let as = (isArray(props.as) && props.as.length === 3) ? props.as : defaultProps.as;
        let numbins = context.value(props.bins, null, null);
        let step = context.value(props.step, null, null);
        //Get values from data
        let values = data.map(function (datum) {
            return datum[field];
        });
        //Calculate the domain
        if (domain === null) {
            domain = range(values); //Get domain from values
        }
        else {
            //Filter values data to get only the values in the domain
            values = values.filter(function (value) {
                return domain[0] <= value && value <= domain[1];
            });
        }
        domainSize = Math.abs(domain[1] - domain[0]); //Get domain size
        //console.log(`Domain: [${domain[0]},${domain[1]}]`);
        //Check if user has provided a number of bins to apply
        if (typeof numbins === "number" && numbins > 0) {
            //step = domainSize / numbins;
            //Nothing to do, we have the numbins
        }
        else if (typeof step === "number" && step > 0) {
            console.log(`custom step --> ${step}`);
            numbins = Math.ceil(domainSize / step); //Calculate the number of bins
            //step = domainSize / numbins; //Fix step
        }
        else {
            let estimated = bins(values, context.value(props.minbins, null, defaultProps.minbins)); //Extimate bins
            numbins = Math.min(estimated.bins, context.value(props.maxbins, null, defaultProps.maxbins));
            //step = domainSize / numbins; //Build step size
        }   
        step = domainSize / numbins; //Build step size
        //Build bin values
        let binValues = [];
        data.forEach(function (datum) {
            let value = datum[field];
            //Check if this value is outside the domain
            if (value < domain[0] || domain[1] < value) {
                return;
            }
            let index = clamp(Math.floor((value - domain[0]) / step), 0, numbins - 1); //Get the bin index
            //console.log(`'${value}' ---> '${index}'`);
            binValues.push(Object.assign({}, datum, {
                [as[0]]: index,
                [as[1]]: domain[0] + index * step,
                [as[2]]: domain[0] + (index + 1) * step
            })); 
        });
        //Return bin values
        return binValues;
    },
    "props": defaultProps,
    "sourceProps": ["bins", "step", "minsteps", "maxsteps", "domain"]
};

