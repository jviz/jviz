import {each} from "../util.js";
import {getTransform} from "../transforms/index.js";
import {getValueSources} from "./value.js";
import {getExpressionSources} from "./expression.js";

//Apply transforms
export function transform (values, transforms) {
    let context = this;
    let data = values; //Initialize the data values
    //Apply all available transforms
    each(transforms, function (index, props) {
        data = getTransform(props.type).transform(context, data, props);
    });
    //Return the data transformed
    return data;
}

//Get transform sources
export function getTransformSources (context, transforms) {
    //Check for no transforms to check
    if (typeof transforms !== "object" || transforms === null) {
        return [];
    }
    //Initialize sources list
    let sources = []; //createNodeList();
    //Get sources for each transform
    each(transforms, function (index, transform) {
        //Check for transforms with expressions
        if (transform.type === "formula" || transform.type === "filter") {
            getExpressionSources(context, transform.expr).forEach(function (source) {
                sources.push(source);
            });
        }
        //Check for extend transform
        else if (transform.type === "extend") {
            sources.push(context.data[transform.from]); // <-- Add data as a source
        }
        //Check for range transform
        else if (transform.type === "range") {
            sources.push(context.state[transform.state]); // <-- Add state as a source
        }
    });
    //Return the sources
    return sources;
}

