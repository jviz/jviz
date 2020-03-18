//Build an object from an array
let toObject = function (array, callback) {
    return array.reduce(callback, {});
};

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

//Method for creating a padding object
let buildPaddingObject = function (value) {
    return {
        "left": value,
        "right": value,
        "top": value,
        "bottom": value
    };
};

//Parse padding
export function parsePadding (padding) {
    //Check for number padding
    if (typeof padding === "number") {
        return buildPaddingObject(padding);
    }
    //Check for object padding
    else if (typeof padding === "object" && padding !== null) {
        return Object.assign({}, buildPaddingObject(0), padding);
    }
    //Other value: return default padding object
    return buildPaddingObject(0);
}

