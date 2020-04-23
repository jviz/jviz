import {nest as objectNest} from "./util.js";

//Comparison chars
let compChars = ["=", "!", "<", ">", "&", "|"];

//Comparision methods
let compFunc = {
    "===": function (a, b) { return a === b; },
    "!==": function (a, b) { return a !== b; },
    "==": function (a, b) { return a === b; },
    "!=": function (a, b) { return a !== b; },
    "<=": function (a, b) { return a <= b; },
    ">=": function (a, b) { return a >= b; },
    "<": function (a, b) { return a < b; },
    ">": function (a, b) { return a > b; },
    "&&": function (a, b) { return a && b; },
    "||": function (a, b) { return a || b; }
};

//Regex expressions
let letterRegex = /^[A-Za-z]$/;
let valueRegex = /^[a-zA-Z\[\]'"0-9\.\_]$/;

//Parse a next character
let nextChar = function (ctx) {
    //Increment the current position
    ctx.pos = ctx.pos + 1;
    //Get the next character
    ctx.current = (ctx.pos < ctx.str.length) ? ctx.str.charAt(ctx.pos) : -1;
};

//Check if the current character is the provided character
let checkChar = function (ctx, ch) {
    //While the current character is a space charaacter
    while (ctx.current === " ") {
        nextChar(ctx);
    }
    //Check if the current character is the provided character
    if (ctx.current === ch) {
        nextChar(ctx);
        return true;
    }
    //Not equal
    return false;
};

//Parse a expression: addition or substraaction
let parseExpression = function (ctx) {
    let x = parseTerm(ctx);
    for (;;) {
        //Check for addition term
        if (checkChar(ctx, "+") === true) {
            x = x + parseTerm(ctx); // addition
        }
        //Check for subtraction term
        else if (checkChar(ctx, "-") === true) {
            x = x - parseTerm(ctx); // subtraction
        }
        //Else: return the current term
        else {
            return x;
        }
    }
};

//Parse a term: multiplication or division
let parseTerm = function (ctx) {
    let x = parseComparison(ctx);
    for (;;) {
        //Check for multiplication
        if (checkChar(ctx, "*") === true) {
            x = x * parseComparison(ctx);
        }
        //Check for division
        else if (checkChar(ctx, "/") === true) {
            x = x / parseComparison(ctx);
        }
        //Check for module
        else if (checkChar(ctx, "%") === true) {
            x = x % parseComparison(ctx);
        }
        //Else: return the current term
        else {
            return x;
        }
    }
};

//Parse a comparison
let parseComparison = function (ctx) {
    let x = parseFactor(ctx);
    for(;;) {
        //Save the current starting position
        let startPos = ctx.pos;
        //Check if the current character is one of the comparis
        if (compChars.indexOf(ctx.current) !== -1) {
            while (compChars.indexOf(ctx.current) !== -1) {
                nextChar(ctx);
            }
            //Get the comparison operator
            let comp = ctx.str.substring(startPos, ctx.pos)
            //Check for equal comparison
            if (typeof compFunc[comp] === "function") {
                x = compFunc[comp](x, parseFactor(ctx));
            }
            //Unknown operator
            else {
                throw new Error("Unknown operator: " + comp);
            }
        }
        //Return the current term
        else {
            return x;
        }
    }
};

//Parse a list of items
let parseList = function (ctx) {
    let items = [];
    do {
        //Save the parsed expression
        items.push(parseExpression(ctx));
    }
    while(checkChar(ctx, ",") === true);
    return items;
};

//Parse a factor
let parseFactor = function (ctx) {
    //Check for negation operator
    if (checkChar(ctx, "!") === true) {
        return !parseFactor(ctx);
    }
    //Check for unary plus
    if (checkChar(ctx, "+") === true) {
        return parseFactor(ctx);
    }
    //Check for unary minus
    if (checkChar(ctx, "-") === true) {
        return -parseFactor(ctx);
    }
    let x;
    let startPos = ctx.pos;
    //Check for subexpression
    if (checkChar(ctx, "(") === true) { 
        x = parseExpression(ctx);
        checkChar(ctx, ")");
    }
    //Check for array expressions
    else if (checkChar(ctx, "[") === true) {
        x = parseList(ctx);
        checkChar(ctx, "]");
    }
    //Check for string factors
    else if (checkChar(ctx, "'") === true) {
        x = "";
        while(ctx.current !== "'") {
            x = x + ctx.current;
            nextChar(ctx);
        }
        checkChar(ctx, "'");
    }
    //Check for digit
    else if ((ctx.current >= "0" && ctx.current <= "9") || ctx.current == ".") {
        while ((ctx.current >= "0" && ctx.current <= "9") || ctx.current == ".") {
            nextChar(ctx);
        }
        //Parse the number factor
        x = parseFloat(ctx.str.substring(startPos, ctx.pos));
    }
    //Check for or values functions
    else if (ctx.current !== -1 && ctx.current.match(letterRegex) !== null) {
        while (ctx.current !== -1 && ctx.current.match(valueRegex) !== null) {
            nextChar(ctx);
        }
        //Build the name
        let name = ctx.str.substring(startPos, ctx.pos);
        //Check for null value
        if (name === "null") {
            x = null;
        }
        //Check for boolean value (true or false)
        else if (name === "true") {
            x = true; //True boolean
        }
        else if (name === "false") {
            x = false; //False boolean
        }
        //Check if there is a function to apply
        else if (typeof ctx.values[name] === "function") {
            //Check if the next char is a pharentesis
            if (checkChar(ctx, "(") === false) {
                throw new Error("Unexpected character: " + ctx.current);
            }
            //Build the arguments to call this function
            let args = parseList(ctx);
            //End of pharentesis
            if (checkChar(ctx, ")") === false) {
                throw new Error("Unexpected character: " + ctx.current);
            }
            //Call this function with the parsed arguments
            x = ctx.values[name].apply(null, args);
        }
        //Check for other value
        else {
            x = objectNest(ctx.values, name);
        }
        //Function not available
        //else {
        //    throw new Error("Unknown function: " + func);
        //}
    }
    //Unexpected char
    else {
        throw new Error("Unexpected: " + ctx.current);
    }
    //Check for exponential operation
    if (checkChar(ctx, "^") === true) {
        x = Math.pow(x, parseFactor(ctx)); // exponentiation
    }
    //Return the parsed factor
    return x;
};

//Export evaluate function
export function evaluate (str, values) {
    //Initialize the evaluate context
    let ctx = {
        "pos": -1,
        "current": null,
        "str": str,
        "values": values
    };
    //Parse 
    nextChar(ctx);
    //Start evaluating the expression
    let x = parseExpression(ctx);
    //Check for error
    if (ctx.pos < ctx.str.length) {
        //console.error(str);
        throw new Error("Unexpected: " + ctx.current);
    }
    //Return the output value
    return x;
}

