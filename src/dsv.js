import {isArray, isObject} from "./util.js";

//Char codes
let QUOTE = 34; //Quote character
let NEWLINE = 10; //New line character
let RETURN = 13; //Return character

//Parse options
let defaultOptions = {
    "header": [] //custom header fields
};

//Parse a DSV line
let parseLine = function (line, sep) {
    if (typeof line !== "string" || line === "") {
        return []; //No line to parse
    }
    //Split the line in items
    let items = line.trim().match(/(".*?"|[^",\r\n]+)(?=\s*[,\r\n]|\s*$)/g);
    if (items === null) {
        return []; //Unable to parse line
    }
    //Parse items of the line
    return items.map(function (item) {
        item = item.trim();
        //Remove double quote pairs from start and end
        while (item.length >= 2 && item.charCodeAt(0) === QUOTE && item.charCodeAt(item.length - 1) === QUOTE) {
            item = item.substr(1, item.length - 2).trim(); //Remove start and end "
        }
        //Check for number value or return as string
        return (/^-?\d*\.?\d*$/.test(item)) ? Number(item) : item;
    });
}

//DSV parser
export function dsvParse (content, sep, options) {
    options = isObject(options) ? options : {}; //Fix options
    let rows = []; //Output rows list
    let columns = (isArray(options.header) && options.header.length > 0) ? options.header : []; //Columns
    let lines = content.replace(/\r/g, "").split("\n").filter(function (line) {
        return line.trim().length > 0; //Filter empty lines
    });
    //Parse all lines
    for (let i = 0; i < lines.length; i++) {
        //Check if no custom header has been provided --> parse from first line
        if (i === 0 && columns.length === 0) {
            columns = parseLine(lines[i]); //Parse the columns
        }
        //Other --> add as row
        else {
            let row = {}; //Row container
            let items = parseLine(lines[i], sep);
            if (items.lenght === 0) {
                continue; //Not valid line
            }
            //Check for no columns provided --> add as an array of items
            if (columns.length === 0) {
                row = items; //save as an array of values
            }
            else {
                //Convert an array to object using the columns
                items.forEach(function (value, index) {
                    row[columns[index]] = value; //Save this value
                });
            }
            rows.push(row); //Save this row
        }
    }
    //Return rows
    return rows;
}

//Alias
export function csvParse (content, options) {
    return dsvParse(content, ",", options);
}


