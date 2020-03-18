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

