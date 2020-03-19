//General regex
let documentStartRegex = /<jviz(.*)>/; //Document start
let documentEndRegex = /<\/jviz>/; //Document end
let tagStartRegex = /<\/?([a-z]+):(\w+)\s?(.*?)\/?>/; //Capturing a tag start
let tagEndRegex = /<\/?([a-z]+):(\w)>/; //Capturing a tag end
let commentRegex = /<!--(.*)-->/; //Capture a comment

//Check if the provided type is a numeric type
let isNumbericType = function (value) {
    if (typeof value !== "string") {
        return false; //Nothing to check
    }
    //Check for int|float|number
    return value === "int" || value === "float" || value === "number";
};

//Parse value
let getParsedValue = function (value, type) {
    value = value.trim();
    //Check for number
    if (/^\+?\-?\d+\.?\d*$/.test(value) === true || isNumericType(type)) {
        return Number(value); //Convert to number
    }
    //Check for JSON expression
    else if (value.charAt(0) === "{" || value.charAt(0) === "[" || type === "json") {
        return JSON.parse(value); //Convert to json
    }
    //Check for boolean expression
    else if (value === "true" || value === "false" || type === "bool") {
        return value === "true"; //Convert to boolean
    }
    //Default: return the value in string format
    return value;
};

//Parse Xml line
let parseXmlLine = function (line) {
    let match = line.match(tagStartRegex);
    if (match === null) {
        return null; //Not valid line
    }
    //console.log(match);
    //Return the parsed line
    return {
        "name": match[1], //Save tag name
        "type": match[2], //Save tag type
        "attributes": parseXmlAttributes(match[3]),
        "closed": line.indexOf("/>") !== -1 //Closed tag
    };
};

//Parse html attributes format
//https://stackoverflow.com/a/13898200 
let parseXmlAttributes = function (str) {
    let attributes = {}; //Output attributes object
    let regex = /([^\s]*)=[\"](.*?)[\"]|([\w\-]+)/g; //Regex for capturing attributes
    let match = null;
    while ((match = regex.exec(str)) !== null) {
        if (typeof match[0] !== "string") {
            break; //Unexpected error
        }
        //Check for boolean attributes
        if (typeof match[1] !== "string") {
            attributes[match[0]] = true; //Set as boolean
        }
        else {
            //Save the attribute value
            attributes[match[1]] = match[2];
        }
    }
    //Return parsed attributes object
    return attributes;
};

//Recursive parse an xml a generate a new tree
let parseXml = function (xmlString) {
    //Initialize compile context
    let context = {
        "lines": xmlString.replace(/\r/g, "").split("\n").map(function (line) {
            return line.replace(/\t/g, "").trim(); //Remove tabs and spaces
        }),
        "index": 0 //Current parsing line
    };
    //Parse children content
    let parseChildren = function (endTag) {
        let children = []; //Output children content
        while(context.index < context.lines.length) {
            let line = context.lines[context.index]; //Get current line
            if (line.indexOf(endTag) > -1) {
                break; //Stop processing children
            }
            //Parse the xml line
            let element = parseXmlLine(line);
            if (element !== null) {
                //TODO: validate children element
                if (element.closed === false) {
                    context.index = context.index + 1; //Start parsing next line
                    element["children"] = parseChildren(`</${element.name}:${element.type}>`);
                }
                //delete element["closed"]; //Remove closed attribute
                children.push(element); //Save parsed element
            }
            //Next line
            context.index = context.index + 1;
        }
        //Return the children content
        return children;
    };
    //Initialize parser
    return parseChildren("</jviz>");
    //let output = parseChildren("</jviz>");
    //console.log(output);
    //return output;
};

//Parse props values
let parseValueAttributes = function (attr) {
    if (typeof attr["value"] === "string" && typeof attr["type"] === "string") {
        attr["value"] = getParsedValue(attr["value"], attr["type"]); //Get parsed value
        delete attr["type"]; //Remove type
    }
    //Return the attributes object
    return attr;
};

//Parse a padding element
let parsePaddingElement = function (element) {
    let attr = element["attributes"];
    if (typeof attr["value"] === "string") {
        return parseInt(attr["value"]);
    }
    //Parse as an object
    let padding = {};
    ["top", "bottom", "left", "right"].forEach(function (position) {
        if (typeof attr[position] === "string") {
            padding[position] = parseInt(attr[position]);
        }
    });
    //Return parsed padding object
    return padding;
};

//Parse a transform element
let parseTransformElement = function (element) {
    let transform = Object.assign(element["attributes"], {
        "type": element["type"].toLowerCase()
    });
    //No closed transform --> parse children
    if (element["closed"] === false && element["type"] === "summarize") {
        Object.assign(transform, {
            "fields": [],
            "op": [],
            "as": []
        });
        element["children"].forEach(function (child) {
            if (child["name"] !== "operation" || typeof tag.attributes["field"] !== "string") {
                return null; //TODO: throw error
            }
            //Get field and as attributes
            let field = child["attributes"]["field"];
            let as = child["attributes"]["as"];
            transform.fields.push(field); //Save field
            transform.op.push(child["type"]); //Save operation
            transform.as.push((typeof as === "string") ? as : field); //Save as 
        });
    }
    //Return the transform object
    return transform;
};

//Parse the state element
let parseStateElement = function (element) {
    let state = parseValueAttributes(element["attributes"]);
    if (typeof state["name"] !== "string") {
        throw new Error(""); //TODO
    }
    if (typeof state["value"] === "undefined") {
        state["value"] = null; //Set initial state value
    }
    //Return the parsed state value
    return state;
};

//Parse data tag
let parseDataElement = function (element) {
    let data = Object.assign(element["attributes"], {
        "value": [],
        "transform": [] //Empty transform object
    });
    if (typeof data["name"] !== "string") {
        throw new Error(""); //TODO
    }
    //Check for no closed data --> parse transform tags
    if (element["closed"] === false) {
        element["children"].forEach(function (child) {
            if (child["name"] !== "transform") {
                return null; //TODO: throw error
            }
            data.transform.push(parseTransformElement(child));
        });
    }
    //Return the parsed data object
    return data;
};

//Parse a scale element
let parseScaleElement = function (element) {
    let scale = Object.assign(element["attributes"], {
        "type": element["type"].toLowerCase(),
        "domain": [],
        "range": []
    });
    //Check for no scale name provided
    if (typeof scale["name"] !== "string") {
        throw new Error(""); //TODO
    }
    //Parse scale children
    element["children"].forEach(function (child) {
        if (child["name"] !== "domain" && child["name"] !== "range") {
            return null; //TODO: throw error
        }
        if (child["type"] === "from") {
            scale[child["name"]] = parseValueAttributes(child["attributes"]);
        }
        else if (child["type"] === "start") {
            scale[child["name"]][0] = parseValueAttributes(child["attributes"]);
        }
        else if (child["type"] === "end") {
            scale[child["name"]][1] = parseValueAttributes(child["attributes"]);
        }
        else if (child["type"] === "value" && child["name"] === "domain") {
            scale["domain"].push(parseValueAttributes(child["attributes"]));
        }
        else {
            //TODO: throw error --> invalid tag type
        }
    });
    //Return the scale
    return scale;
};

//Parse an axis element
let parseAxisElement = function (element) {
    let axis = Object.assign(element["attributes"], {
        "orientation": element["type"].toLowerCase()
    });
    //Parse axis children content
    element["children"].forEach(function (child) {
        if (child["name"] !== "axis") {
            return null; //TODO: throw error
        }
        //Assign the axis content
        if (child["type"] === "position") {
            axis["position"] = parseValueAttributes(child["attributes"]);
        }
        else {
            let type = child["type"];
            axis[type] = true; //Enable the axis property
            Object.keys(child["attributes"]).forEach(function (key) {
                //Convert the name to the format 'ticksValues'
                let name = type + key.charAt(0).toUpperCase() + key.slice(1);
                axis[name] = getParsedValue(child["attributes"][key], "");
            });
        }
    });
    //Return the parsed axis config
    return axis;
};

//Parse event element
let parseEventElement = function (element) {
    return Object.assign(element["attributes"], {
        "type": element["type"].toLowerCase()
    });
};

//Parse render element
let parseRenderElement = function (element) {
    let render = {}; //Initialize render props
    element["children"].forEach(function (child) {
        if (child["name"] !== "prop") {
            return null; //TODO: throw error
        }
        render[child["type"]] = parsePropElement(child);
    });
    //Return the render props
    return render;
};

//Parse a prop element
let parsePropElement = function (element) {
    if (element["closed"] === true) {
        return parseValueAttributes(element["attributes"]); //Parse value
    }
    //Parse as conditional
    let props = [];
    element["children"].forEach(function (child) {
        if (child["name"] !== "choose") {
            return null; //TODO: throw error
        }
        //Save the property object
        props.push(parseValueAttributes(child["attributes"])); //Parse props
    });
    //Return parsed props
    return props;
};

//Parse a shape element
let parseShapeElement = function (element) {
    //Check for no children on shape element
    if (element["closed"] === true) {
        throw new Error("Invalid shape: must contain at least one render children element");
    }
    //Initialize shape object
    let shape = {
        "type": element["type"],
        "source": null,
        "transform": [],
        "render": {},
        "shapes": (element["type"] === "group") ? [] : undefined,
        "on": []
    };
    //Check for data shape source
    if (typeof element.attributes["data"] === "string") {
        shape["source"] = {
            "data": element.attributes["data"]
        };
    }
    //Parse children content
    element.children.forEach(function (child) {
        if (child["name"] === "transform") {
            shape.transform.push(parseTransformElement(child));
        }
        else if (child["name"] === "render") {
            shape.render[child["type"]] = parseRenderElement(child);
        }
        else if (child["name"] === "shape" && shape.type === "group") {
            shape.shapes.push(parseShapeElement(child));
        }
        else if (child["name"] === "on") {
            shape.on.push(parseEventElement(child));
        }
        //Ignore other tags
    });
    //Return the parsed shape element
    return shape;
};

//Initialize output object
let initializeSchema = function () {
    let schemaObject = {
        "state": [],
        "data": [],
        "scales": [],
        "axes": [],
        "shapes": []
    };
    return schemaObject; //Return empty schema
};

//Export schema compiler
export function compileSchema (xmlString) {
    let schema = initializeSchema(); //Initialize schema object
    parseXml(xmlString).forEach(function (element) {
        //Parse shape element
        if (element["name"] === "shape") {
            schema.shapes.push(parseShapeElement(element));
        }
        //Parse scale element
        else if (element["name"] === "scale") {
            schema.scales.push(parseScaleElement(element));
        }
        //Parse axis element
        else if (element["name"] === "axis") {
            schema.axes.push(parseAxisElement(element));
        }
        //Check for define element --> multiple types
        else if (element["name"] === "define") {
            if (element["type"] === "state") {
                schema.state.push(parseStateElement(element));
            }
            else if (element["type"] === "data") {
                schema.data.push(parseDataElement(element));
            }
            else if (element["type"] === "width" || element["type"] === "height") {
                schema[element["type"]] = parseInt(element["attributes"]["value"]);
            }
            else if (element["type"] === "padding") {
                schema["padding"] = parsePaddingElement(element);
            }
            else {
                //Other: throw error (TODO)
            }
        }
    });
    //Return the compiled schema object
    return schema;
}

//Validate a JSON schema
export function validateSchema (schema) {
    return schema; //TODO
}

//Compile + validate schema wrapper
export function parseSchema (schema) {
    return validateSchema(compileSchema(schema));
}

