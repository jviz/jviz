//Method for creating a margin object
let buildMarginObject = function (value) {
    return {
        "left": value,
        "right": value,
        "top": value,
        "bottom": value
    };
};

//Parse margins
export function parseMargins (values) {
    //Check for number margin
    if (typeof values === "number") {
        return buildMarginObject(values);
    }
    //Check for object margin
    else if (typeof values === "object" && values !== null) {
        return Object.assign({}, buildMarginObject(0), values);
    }
    //Other value: return default margin object
    return buildMarginObject(0);
}

