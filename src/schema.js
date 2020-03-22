//General regex
let documentStartRegex = /<jviz(.*)>/; //Document start
let documentEndRegex = /<\/jviz>/; //Document end
//let tagStartRegex = /<\/?([a-z]+):(\w+)\s?(.*?)\/?>/; //Capturing a tag start
//let tagEndRegex = /<\/?([a-z]+):(\w)>/; //Capturing a tag end
let tagStartRegex = /<jviz:([a-z\-]+)\s?(.*?)\/?>/; //Capture a tag start
let tagEndRegex = /<\/jviz:([a-z\-]+)\s?>/; //Capturing a tag end
let commentRegex = /<!--(.*)-->/; //Capture a comment
let commentStartRegex = /<!--/; //Capture comment start
let commentEndRegex = /-->/; //Capture comment end

//Allowed tags
let shapeTags = ["rectangle", "area", "line", "text", "segment", "circle", "arc", "polyline"];
//Allowed children tags
let scaleChildren = ["domain", "domain-start", "domain-end", "range", "range-start", "range-end"];
let renderChildren = shapeTags.concat(["axis", "group"]);

//Check if the provided format is a numeric format
let isNumericFormat = function (value) {
    if (typeof value !== "string") {
        return false; //Nothing to check
    }
    //Check for int|float|number
    return value === "int" || value === "float" || value === "number";
};

//Parse value
let getParsedValue = function (value, format) {
    value = value.trim();
    //Check for number
    if (/^\+?\-?\d+\.?\d*$/.test(value) === true || isNumericFormat(format)) {
        return Number(value); //Convert to number
    }
    //Check for JSON expression
    else if (value.charAt(0) === "{" || value.charAt(0) === "[" || format === "json") {
        return JSON.parse(value); //Convert to json
    }
    //Check for boolean expression
    else if (value === "true" || value === "false" || format === "bool") {
        return value === "true"; //Convert to boolean
    }
    //Default: return the value in string format
    return value;
};

//Parse Xml line
//Example: <jviz:attr name="a" value="b" />
//match[0] --> contains the matched string
//match[1] --> "attr": tag name
//match[2] --> "name=\"a\" value=\"b\"": attributes
let parseXmlLine = function (line, index) {
    let match = line.match(tagStartRegex);
    if (match === null) {
        return null; //Not valid line
    }
    //if (match[1].toLowerCase() !== "jviz") {
    //    return null; //Invalid namespace
    //}
    //console.log(match);
    //Return the parsed line
    return {
        "index": index, //Save line index
        "line": line, //Save line for reference
        "name": match[1].toLowerCase(), //Save tag name
        "attributes": parseXmlAttributes(match[2]),
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
    //TODO: get version from first line
    //Parse children content
    let parseChildren = function (endTag) {
        let children = []; //Output children content
        while(context.index < context.lines.length) {
            let line = context.lines[context.index]; //Get current line
            if (line.indexOf(endTag) > -1) {
                break; //Stop processing children
            }
            //Check for comment line (TODO)
            //Parse the xml line
            let element = parseXmlLine(line, context.index);
            if (element !== null) {
                //TODO: validate children element
                if (element.closed === false) {
                    context.index = context.index + 1; //Start parsing next line
                    element.children = parseChildren(`</jviz:${element.name}>`);
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
    if (typeof attr["value"] === "string" && typeof attr["format"] === "string") {
        attr["value"] = getParsedValue(attr["value"], attr["format"]); //Get parsed value
        delete attr["format"]; //Remove format attribute
    }
    //Return the attributes object
    return attr;
};

//Parse a padding element
let parsePaddingElement = function (element) {
    let attr = element.attributes;
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
    if (typeof element.attributes["type"] !== "string") {
        throw new Error("No transform type provided");
    }
    //Initialize the transform attributes
    let transform = Object.assign(element.attributes, {
        "type": element.attributes["type"].toLowerCase()
    });
    //Check for extend transform --> convert source-key and target-key
    if (transform["type"] === "extend") {
        //Check for no children --> throw error
        if (element.closed === true) {
            throw new Error(""); //TODO
        }
        //Assign extend attributes
        Object.assign(transform, {
            "sourceKey": transform["source-key"],
            "targetKey": transform["target-key"],
            "fields": [],
            "as": []
        });
        delete transform["source-key"]; //Remove original source-key attribute
        delete transform["target-key"]; //Remove original target-key attribute
        element.children.forEach(function (child) {
            if (child.name !== "copy") {
                return null; //TODO: throw error
            }
            transform["fields"].push(child.attributes["field"]); //Save rename field attr
            transform["as"].push(child.attributes["as"]); //Save rename as attr
        });
    }
    //Check for summarize transform
    else if (transform["type"] === "summarize") {
        if (element.closed === true) {
            throw new Error(""); //TODO: summarize transform sould contain at least one child
        }
        //Assign transform attributes
        Object.assign(transform, {
            "fields": [],
            "op": [],
            "as": []
        });
        element.children.forEach(function (child) {
            if (child.name !== "op" || typeof child.attributes["field"] !== "string") {
                return null; //TODO: invalid transform child
            }
            //Get field and as attributes
            let field = child.attributes["field"];
            let as = child.attributes["as"];
            transform.fields.push(field); //Save field
            transform.op.push(child.attributes["type"]); //Save operation type
            transform.as.push((typeof as === "string") ? as : field); //Save as 
        });
    }
    //Return the transform object
    return transform;
};

//Parse the state element
let parseStateElement = function (element) {
    let state = parseValueAttributes(element.attributes);
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
    let data = Object.assign(element.attributes, {
        "value": [],
        "transform": [] //Empty transform object
    });
    if (typeof data["name"] !== "string") {
        throw new Error(""); //TODO
    }
    //Check for no closed data --> parse transform tags
    if (element.closed === false) {
        element.children.forEach(function (child) {
            if (child.name !== "transform") {
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
    if (typeof element.attributes["type"] !== "string") {
        throw new Error(`No scale type provided at line ${element.index}`);
    }
    //Initialize scale attributes
    let scale = Object.assign(element.attributes, {
        "type": element.attributes["type"].toLowerCase(),
        "domain": [],
        "range": []
    });
    //Check for no scale name provided
    if (typeof scale["name"] !== "string") {
        throw new Error(`No scale name provided at line ${element.index}`);
    }
    //Parse scale children
    element.children.forEach(function (child) {
        if (scaleChildren.indexOf(child.name) === -1) {
            throw new Error(`Unknown tag ${child.name} at line ${line.index}`);
        }
        //Check for domain or range only tag
        if (child.name === "domain" || child.name === "range") {
            scale[child.name] = parseValueAttributes(child["attributes"]);
        }
        //Check for start tag
        else if (child.name.indexOf("-start") > 0) {
            scale[child.name.replace("-start", "")][0] = parseValueAttributes(child.attributes);
        }
        //Check for end tag
        else if (child.name.indexOf("-end") > 0) {
            scale[child.name.replace("-end", "")][1] = parseValueAttributes(child.attributes);
        }
    });
    //Return the scale
    return scale;
};

//Parse an attribute element
let parseAttrElement = function (element) {
    if (element.closed === true) {
        return parseValueAttributes(element.attributes); //Parse value
    }
    //Parse as conditional
    return element.children.map(function (child) {
        if (child.name !== "choose") {
            throw new Error(`Invalid tag name "${child.name}" at line ${child.index}`);
        }
        //Save the parsed condition object
        return parseValueAttributes(child.attributes);
    });
};

//Parse an axis element
let parseAxisElement = function (element) {
    let axis = element.attributes; //Get axis initial attributes
    //TODO: parse orientation attribute
    //Parse axis children content
    element.children.forEach(function (child) {
        if (child.name !== "attr") {
            throw new Error(`Unkown tag name "${child.name}" on line ${child.index}`);
        }
        let name = child.attributes["name"]; //Get attribute name
        //Check for no attribute name provided
        if (typeof name !== "string" || name.length === 0) {
            throw new Error(`No attribute name provided at line ${child.index}`);
        }
        //Add this attribute to the axis
        axis[name] = parseAttrElement(child);
    });
    //Return the parsed axis config
    return axis;
};

//Parse event element
let parseEventElement = function (element) {
    return element.attributes; //Return event attributes
    //Convert the event name to camelcase
    //"click-down" --> "clickDown"
    //return Object.assign(element["attributes"], {
    //    "type": camelCase(element["type"].toLowerCase())
    //});
};

//Parse a shape element
let parseShapeElement = function (element) {
    //Check for no children on shape element
    if (element.closed === true) {
        throw new Error(`Invalid shape at line ${child.index}: shape must contain at least one render children element`);
    }
    //Initialize shape object
    let shape = {
        "type": element.name,
        "source": null,
        "transform": [],
        "render": {},
        "shapes": (element.name === "group") ? [] : undefined,
        "on": []
    };
    //Check for data shape source
    if (typeof element.attributes["data"] === "string") {
        shape["source"] = {
            "data": element.attributes["data"],
            "groupby": element.attributes["groupby"]
        };
    }
    //Parse children content
    element.children.forEach(function (child) {
        //Check for transform child --> parse as transform
        if (child.name === "transform") {
            shape.transform.push(parseTransformElement(child));
        }
        //Check for attr child --> parse
        else if (child.name === "attr" && element.name !== "group") {
            let name = child.attributes["name"]; //Get attribute name
            let key = (typeof child.attributes["on"] === "string") ? child.attributes["on"] : "mount";
            if (typeof shape.render[key] === "undefined") {
                shape.render[key] = {}; //Initialize
            }
            //Save render attribute
            shape.render[key][name] = parseAttrElement(child);
        }
        //Check for other shape
        else if (shapeTags.indexOf(child.name) > -1 && shape.type === "group") {
            shape.shapes.push(parseShapeElement(child));
        }
        //Check for an event tag
        else if (child.name === "event" && element.name !== "group") {
            shape.on.push(parseEventElement(child));
        }
        //Other tags --> show error
        else {
            throw new Error(`Unknown tag name ${child.name} at line ${child.index}`);
        }
    });
    //Return the parsed shape element
    return shape;
};

//Parse render element
let parseRenderElement = function (element) {
    //Initialize allowed render elements
    let render = {
        "shapes": [],
        "axes": []
    };
    //Parse children elements
    element.children.forEach(function (child) {
        //Check for no allowed child type
        if (renderChildren.indexOf(child.name) === -1) {
            throw new Error(`Unknown tag name "${child.name}" at line ${child.index}`);
        }
        //Check for axis child
        if (child.name === "axis") {
            render.axes.push(parseAxisElement(child)); //Save as axis element
        }
        //Other element --> parse as shape
        else {
            render.shapes.push(parseShapeElement(child));
        }
    });
    return render;
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
        //Parse render wrapper
        if (element.name === "render") {
            Object.assign(schema, parseRenderElement(element));
            //schema.shapes.push(parseShapeElement(element));
        }
        //Parse scale element
        else if (element.name === "scale") {
            schema.scales.push(parseScaleElement(element));
        }
        //Parse axis element
        //else if (element["name"] === "axis") {
        //    schema.axes.push(parseAxisElement(element));
        //}
        //Check for state element
        else if (element.name === "state") {
            schema.state.push(parseStateElement(element));
        }
        //Check for data element
        else if (element.name === "data") {
            schema.data.push(parseDataElement(element));
        }
        //Check for with or height elements
        else if (element.name === "width" || element.name === "height") {
            schema[element.name] = parseInt(element.attributes["value"]);
        }
        //Check for padding element
        else if (element.name === "padding") {
            schema["padding"] = parsePaddingElement(element);
        }
        //Meta element --> nothing to do
        else if (element.name === "meta") {
            //Skip this
        }
        //Other element --> throw error
        else {
            throw new Error(`Invalid tag name "${element.name}" at line ${element.index}`);
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

