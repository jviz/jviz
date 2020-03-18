//Build an object from an array
let toObject = function (array, callback) {
    return array.reduce(callback, {});
};

//Create primitive checker
let createPrimitiveChecker = function (type) {
    return function (defaultValue, isRequired) {
        return {
            "type": type,
            "defaultValue": defaultValue,
            "isRequired": (typeof isRequired === "boolean") ? isRequired : false
        };
    };
};

//Export proptypes
export const propTypes = {
    "string": createPrimitiveChecker("string"),
    "number": createPrimitiveChecker("number"),
    "boolean": createPrimitiveChecker("boolean")
};

//Get property value
export function getPropValue (prop, value) {
    return (typeof value === prop.type) ? value : prop.defaultValue;
}

//Parse props
export function parseProps (context, datum, props, defaultProps) {
    let propsKeys = Object.keys(defaultProps);
    return toObject(propsKeys, function (current, key) {
        //Check if this property is defined
        if (typeof props[key] !== "undefined") {
            //Save to the current props object
            //current[key] = getProuValue(defaultProps[key], context.getContextValue(props[key], datum));
            current[key] = context.value(props[key], datum);
        }
        //Check for default value
        else if (typeof defaultProps[key].defaultValue !== "undefined") {
            current[key] = defaultProps[key].defaultValue;
        }
        //Return the current props object
        return current;
    }); 
}


