import {isArray, isObject} from "../util.js";
import {range} from "../util.js";
import {clamp} from "../math.js";
import {kde, bandwidth as getBandwidth} from "../statistics.js";
import {uniformKernel, gaussianKernel, cosineKernel, epanechnikovKernel, quarticKernel} from "../statistics.js";

//Available kernes
let kernels = {
    "uniform": uniformKernel,
    "gaussian": gaussianKernel,
    "normal": gaussianKernel, //gaussian kernel is also named as normal
    "cosine": cosineKernel,
    "epanechnikov": epanechnikovKernel, //Default kernel used for kde
    "quarticKernel": quarticKernel
};

//Default props
let defaultProps = {
    "groupby": null,
    "field": "",
    "kernel": "epanechnikov",
    "bandwidth": 0, // --> calculated from values
    "steps": 25, //Number of steps
    "minSteps": 5,
    "maxSteps": 200,
    "domain": null,
    "counts": false, //Output should be probability estimate (false) or smooth counts (true)
    "as": ["value", "density"]
};

//Get a kernel
let getKernel = function (context, kernel) {
    let name = context.value(kernel, "", defaultProps.kernel); //Get kernel from context
    return (typeof name === "string" && typeof kernels[name] !== "undefined") ? kernels[name] : epanechnikovKernel;
};

//Get steps
let getSteps = function (context, steps) {
    let value = (typeof steps === "number" && steps > 0) ? steps : defaultProps.steps; //Get initial steps value
    if (isObject(steps)) {
        value = context.value(steps, null, defaultProps.steps); //Get steps from context
    }
    //Return parsed steps value
    return clamp(value, defaultProps.minSteps, defaultProps.maxSteps);
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

//Export kde transform
export const kdeTransform = {
    "transform": function (context, data, props) {
        let groupby = (typeof props.groupby === "string") ? props.groupby.trim() : null; 
        let kernel = getKernel(context, props.kernel); //Get kernel 
        let bandwidth = context.value(props.bandwidth, null, defaultProps.bandwidth); //Bandwidth
        let steps = getSteps(context, props.steps);
        let field = props.field;
        let as = (isArray(props.as) && props.as.length === 2) ? props.as : defaultProps.as;
        let domain = getDomain(context, props.domain); //Get domain
        let counts = context.value(props.counts, null, defaultProps.counts); //Counts flag
        let groups = [];
        let values = []; //Output values object
        //Check if a group option has been provided
        if (groupby !== null && groupby !== "") {
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
        //If no groupby is provided
        else {
            groups = [data]; //Generate only one group
        }
        //Generate the density for each group
        groups.forEach(function (group) {
            let items = group.map(function (datum) {
                return datum[field]; //Get only wanted value
            });
            let d = (domain === null) ? range(items) : domain; //Get the data domain
            let h = (typeof bandwidth === "number" && bandwidth > 0) ? bandwidth : getBandwidth(items); //Get bandwidth
            let key = (groupby !== null && groupby !== "") ? group[0][groupby] : null; //Get group key
            let s = (counts === true) ? group.length : 1;
            //Generate all density values
            for (let i = 0; i <= steps; i++) {
                let x = d[0] + i * (d[1] - d[0]) / steps; //Get point
                let datum = {}; //Initialize datum object
                datum[as[0]] = x; //Save point
                datum[as[1]] = kde(x, items, kernel, h) * s; //Save density value
                if (key !== null) {
                    datum[groupby] = key; //Save the groupby field
                }
                values.push(datum); //Save this datum value
            }
        });
        //Return density values
        return values;
    },
    "props": defaultProps
};

