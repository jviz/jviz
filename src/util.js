//Type checkers

//Check if a value is null
export function isNull (value) {
    return typeof value === "object" && value === null;
}

//Check if a value is an object
export function isObject (value) {
    return typeof value === "object" && value !== null;
}

//Check if a value is an array
export function isArray (value) {
    return typeof value === "object" && value !== null && Array.isArray(value);
}

//Check if a vaule is a number
export function isNumber (value) {
    return typeof value === "number" && isNaN(value) === false;
}

//Check if a vaule is boolean
export function isBool (value) {
    return typeof value === "boolean";
}

//Check if a vaule is a string
export function isString (value) {
    return typeof value === "string";
}

//Check if the provided value is undefined
export function isUndef (value) {
    return typeof value === "undefined";
}

//Check if the provided value is a valid value (not undef or null)
export function isValid (value) {
    return typeof value !== "undefined" && value !== null;
}


//Functions utils

//Generate a function that always returns the same constant value
export function constant (value) {
    return function () {
        return value;
    };
}

//Export a function that returns the value provided as an argument
export function identity (value) {
    return value;
}

//Call the provided function
export function call (callback, env, args) {
    if (typeof callback === "function") {
        return callback.apply(env, args);
    }
    //No callback to call
    return null;
}


//Object utils

//Ponifill to get a list with all the values of an object
export function values (obj) {
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}

//Get keys of an object (alias of Object.keys)
export function keys (obj) {
    return Object.keys(obj);
}

//Object entries --> return an array with the pair [key,value] of the object
export function entries (obj) {
    return Object.keys(obj).map(function (key) {
        return [key, obj[key]];
    });
}

//Get nested values
export function nest (obj, path) {
    if (path.trim() === "") {
        return obj;
    }
    //Convert indexes to properties and remove the leading dot
    let paths = path.replace(/\[["']?(\w+)['"]?\]/g, ".$1").replace(/^\./, "").split(".");
    let currentValue = obj;
    //For each nested key
    for (let i = 0; i < paths.length; i++) {
        currentValue = currentValue[paths[i]];
    }
    //Return the nested field value
    return currentValue;
}

//Deep clone
export function deepClone (target) {
    //Check for array target --> clone the array
    if (isArray(target)) {
        return target.map(deepClone);
    }
    //Check for valid object
    else if (isObject(target) && target !== null) {
        let output = {};
        Object.keys(target).forEach(function (key) {
            output[key] = deepClone(target[key]);
        });
        //Return cloned object
        return output;
    }
    //Other value --> return
    return target;
}


//Array methods

//Calculate the average of the elements of an array
export function average (values, getValue) {
    let sumValues = 0, counter = 0;
    //Check for no getValue function provided
    if (typeof getValue !== "function") {
        getValue = identity;
    }
    //Iterate over all elements of the array
     for (let i = 0; i < values.length; i++) {
        let value = getValue(values[i], i);
        if (typeof value !== "undefined" && value !== null) {
            sumValues = sumValues + value;
            counter = counter + 1;
        } 
     }
    //Return the average only if the count of numbers is > 0
    return (counter > 0) ? sumValues / counter : 0;
}

//Get the maximum value of an array
export function max (values, getValue) {
    let maxValue = null;
    //Check for no getValue function provided
    if (typeof getValue !== "function") {
        getValue = identity;
    }
    //Iterate over all elements of the array
     for (let i = 0; i < values.length; i++) {
        let value = getValue(values[i], i);
        if (typeof value !== "undefined" && value !== null) {
            if (maxValue === null || value > maxValue) {
                maxValue = value;
            }
        } 
    }
    //Return the maximum value
    return maxValue;
}

//Get the minimum value of an array 
export function min (values, getValue) {
    let minValue = null;
    //Check for no getValue function provided
    if (typeof getValue !== "function") {
        getValue = identity;
    }
    //Iterate over all elements of the array
    for (let i = 0; i < values.length; i++) {
        let value = getValue(values[i], i);
        if (typeof value !== "undefined" && value !== null) {
            if (minValue === null || value < minValue) {
                minValue = value;
            }
        } 
    }
    //Return the minimum value
    return minValue;
}

//Get min and max values of an array
export function range (values, valueOf) {
    //Check for no items in the array
    if (values.length === 0) {
        return null;
    }
    //Check the valueOf method
    if (typeof valueOf !== "function") {
        valueOf = identity;
    }
    //Initialize the output object
    let minValue = valueOf(values[0], 0);
    let maxValue = minValue;
    //Iterate over all elements of the array
    for (let i = 1; i < values.length; i++) {
        let value = valueOf(values[i], i);
        //Check for min value
        if (value < minValue) {
            minValue = value;
        }
        //Check for max value
        else if (maxValue < value) {
            maxValue = value;
        }
    }
    //Return the min and max values
    return [minValue, maxValue];
}

//Calcumate the sum of all values of an array
export function sum (values, getValue) {
    let sumValues = 0;
    //Check for no getValue function provided
    if (typeof getValue !== "function") {
        getValue = identity;
    }
    //Iterate over all elements of the array
    for (let i = 0; i < values.length; i++) {
        let value = getValue(values[i], i);
        if (typeof value !== "undefined" && value !== null) {
            sumValues = sumValues + value;
        }
    }
    //Return the sum of all values
    return sumValues;
}

//Extract unique values of an array
export function unique (values, valueOf) {
    let uniqueValues = {};
    if (typeof valueOf !== "function") {
        valueOf = identity;
    }
    //Get all unique values
    for (let i = 0; i < values.length; i++) {
        uniqueValues[valueOf(values[i], i)] = true;
    }
    //Return only the keys
    return Object.keys(uniqueValues);
}

//Span method: get the difference between the last and the first item of the array
export function span (values, valueOf) {
    return (values.length > 1) ? values[values.length - 1] - values[0] : 0;
}

//Check if the provided value is in the provided range
export function inrange (value, array) {
    return isArray(array) && array.length > 1 && array[0] <= value && value <= array[array.length - 1];
}


//String utils

//Capitalize a string
export function capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//Get the camel-case version of the provided string
export function camelCase (str) {
    if (typeof str !== "string") {
        return str; 
    }
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, reg1, reg2) { 
        if (typeof reg2 !== "undefined" && reg2) {
            return reg2.toUpperCase();
        } else {
            return reg1.toLowerCase();
        }
    });
}

//Repeat a string n times
export function repeat (str, n) {
    return new Array(n + 1).join(str);
}

//Pad a number `string` adding the provided value on the left side if it has less characters than `length`
export function pad (str, length, chars) {
    //let str = num.toString();
    if (length <= str.length) {
        return str;
    }
    if (typeof chars !== "string" || chars === "") {
        chars = " "; //Default padding character
    }
    let padTimes = Math.floor((length - str.length) / chars.length);
    let left = repeat(chars, padTimes + 1);
    return (left + str).slice(-length);
}

//Truncates the provided `str` text if is longer than a provided `length`. Optional arguments:
// - `omission`: the `string` to be used to represent clipped text. Default is `"..."`. 
// This text is added to the returned string, so the ammount of text displayed from `str` will be decreased.
export function truncate (str, l, o) {
    //Check the string
    if (typeof str !== "string") {
        throw new Error("No string to truncate provided");
    }
    let omission = (typeof o === "string") ? o : "...";
    let length = Math.max(0, l - omission.length);
    //Check the length of the string
    if (str.length <= length) {
        return str;
    }
    //Return the string
    return str.substring(0, length) + omission;
}

//Returns the kebab-case form of `str`.
//https://en.wikipedia.org/wiki/Letter_case#Special_case_styles
export function kebabCase (str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
}

//Returns the snake case form of `str`.
export function snakeCase (str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\s+/g, '_').toLowerCase();
}

//Check if a string starts with the specified substring
//Ponyfill of str.startsWith: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
export function startsWith (str, search) {
    return search.length <= str.length && str.substring(0, search.length) === search;
}

//Check if a string ends with the speficied substring
//Ponyfill of str.endsWith: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
export function endsWith (str, search) {
    return search.length <= str.length && str.substring(str.length - search.length, str.length) === search;
}


//Common methods

//Execute a function in each item of an array/object
export function each (list, callback) {
    //Check for object type
    if (typeof list !== "object" || list === null) {
        return null;
    }
    //Save if object is an array
    let listIsArray = isArray(list);
    //Get the keys object
    let itemKeys = (listIsArray === false) ? keys(list) : {"length": list.length}; 
    //Iterate over all elements of the array/object
    for (let i = 0; i < itemKeys.length; i++) {
        //Get the key and the value
        let key = (listIsArray === true) ? i : itemKeys[i];
        let value = list[key];
        //Call the provided callback method and check for stopping the loop
        if (callback(key, value) === false) {
            return null;
        }
    } 
}

//Convert a value to array
export function toArray (value) {
    return (isArray(value)) ? value : [value];
}

//Available values
let timestampValues = ["YYYY", "MM", "DD", "hh", "mm", "ss", "Www", "Mmm"];

//Parse the provided pattern and return the wanted timestamp
export function timestamp (pattern, currentDate) {
    if (typeof pattern !== "string") {
        pattern = "YYYY-MM-DD hh:mm:ss";
    }
    let date = (typeof currentDate === "undefined") ? new Date() : currentDate; //Get the current date
    //Check for number or string date --> convert to date
    if (typeof currentDate === "number" || typeof currentDate === "string") {
        date = new Date(currentDate);
    }
    let result = {};
    let currentRegex = /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).\d\d\dZ/g;
    let current = currentRegex.exec(date.toJSON());
    let dayAndMonth = /^(\w\w\w)\s(\w\w\w)/.exec(date); //Get day and month values
    if (current === null || current.length < 7 || dayAndMonth === null) {
        return pattern;
    }
    for (let i = 0; i < timestampValues.length - 2; i++) {
        //The first element is the full matched string
        result[timestampValues[i]] = current[i + 1];
    }
    //Add day and month values
    result[timestampValues[6]] = dayAndMonth[1]; //Add string day
    result[timestampValues[7]] = dayAndMonth[2]; //Add string month
    let regex = new RegExp("(" + timestampValues.join("|") + ")", "g");
    return pattern.replace(regex, function (match) {
        let value = result[match];
        while (value.length < match.length) {
            value = "0" + value;
        }
        return value;
    });
}

//Error utility: throws a new error with the provided error message
export function error (errorMessage) {
    throw new Error(errorMessage);
}

