//Parse size value
export function parseSizeValue (value) {
    if (typeof value === "undefined" || value === null) {
        return 0; //Default size value
    }
    //Return parsed value
    return parseInt(value);
}

//Parse a background value
export function parseBackgroundValue (value, theme) {
    if (typeof value === "string" && value !== "") {
        if (typeof theme.colors[value] !== "undefined") {
            return theme.colors[value]; //Get bg from colors
        }
        //Return the background string value
        return value;
    }
    //Default --> return the theme background
    return theme["background"];
}

//Method for creating a margin object
let buildMarginObject = function (value) {
    return {
        "left": value,
        "right": value,
        "top": value,
        "bottom": value
    };
};

//Parse a margin value
export function parseMarginValue (values, defaultValue) {
    //Check for number margin
    if (typeof values === "number") {
        return buildMarginObject(values);
    }
    //Check for object margin
    else if (typeof values === "object" && values !== null) {
        return Object.assign({}, buildMarginObject(defaultValue), values);
    }
    //Other value: return default margin object
    return buildMarginObject(defaultValue);
}


