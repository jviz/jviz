import {colors, toRgbaString, toHexString} from "../color.js";
import {ticks as generateTicks} from "../math.js";
import {getGlyph} from "./primitives/glyphs.js";
import {isDiscreteScale} from "../scales/index.js";
import {measureText} from "./util/text.js";
import {rectangle} from "./primitives/rectangle.js";
import {each, values as objectValues, isArray, isObject} from "../util.js";
import {createGradient} from "./util/defs.js";
//import {setStyle} from "./style.js";
import {getValueSources} from "../runtime/value.js";
import {getExpressionSources} from "../runtime/expression.js";

//Legend positions values
let positionValues = ["left", "right"];
let orientationValues = ["vertical", "horizontal"];

//Legend default configuration
let defaultLegendConfig = {
    "minWidth": 80, //Legend min width 
    "offset": 10, //Spacing between legends
    "itemsOffset": 5, //Spacing between legend items
    "itemsMaxSize": 20 //Naximum size of items
};

//Default props
let defaultProps = {
    "type": "", //gradiend|glyph
    "position": "right", //left|right
    "orientation": "vertical", //vertical|horizontal
    "scale": null, //Scale for the legend
    //General legend configuration
    "fill": "#ffffff",
    "stroke": null,
    "strokeWidth": "0px",
    "padding": 0,
    "radius": 0,
    //Legend title
    "title": null,
    "titleSize": "10px",
    "titleWeight": "bold",
    "titleFill": "",
    "titleOpacity": "1",
    "titleOffset": 5, //Separation between the title and the legend content
    //Gradient scales configuration
    "gradientSize": 10,
    "gradientLength": 50,
    "gradientTicks": null,
    "gradientOpacity": "1",
    //Glyph scales configuration
    "glyph": "circle",
    "glyphSize": 10,
    "glyphFill": "none",
    "glyphStroke": null,
    "glyphStrokeWidth": null,
    "glyphOpacity": "1",
    "label": "",
    "labelSize": "8px",
    "labelWeight": "normal",
    "labelFill": "",
    "labelOpacity": "1",
    "labelOffset": 5
};

//Render gradient legend
let renderGradientLegend = function () {
    return null;
};

//Render a glyph legend
let renderGlyphLegend = function () {
    return null;
};

//Check if is a valid legend configuration
let isValidLegendConfig = function (type, scale) {
    if (type === "gradient" && scale.type === "color") {
        return scale.range.length >= 2; //Only valid for >= 2 colors
    }
    else if (type === "glyph" && isDiscreteScale(scale) === true) {
        return true; //Valid combination
    }
    //Other combination --> not valid
    return false;
};

//Get gradient ticks
let getGradientTicks = function (context, props, scale) {
    let values = scale.domain; //Default ticks
    //TODO: check and parse gradientValues prop
    let ticksCount = context.value(props.gradientTicks, null, null);
    if (typeof ticksCount === "number" && ticksCount > 1) {
        values = generateTicks(scale.domain[0], scale.domain[1], ticksCount);
    }
    //Return ticks in the domain interval
    //console.log(values);
    return values.filter(function (value) {
        return scale.domain[0] <= value && value <= scale.domain[1];
    });
};

//Ignore the following keys in props for getting the sources nodes
let ignorePropsSources = ["type", "scale"];

//Create a legend node
export function createLegendNode (context, name, props) {
    let node = context.addNode({
        "id": `legend:${name}`,
        "name": name,
        "props": props, //Object.assign({}, defaultProps, props),
        "type": "legend",
        "targets": null, //createNodeList(),
        "parent": context.scene.element.append("g"),
        "value": null
    });
    //Assign node parent attributes
    node.parent.attr("data-legend", node.id).attr("data-type", "legend");
    //Add sources for this scale
    if (typeof props.scale === "string" && context.scales[props.scale] !== "undefined") {
        context.scales[props.scale].targets.add(node.id, node); //Bind to the scale
    }
    each(node.props, function (propKey, propValue) {
        if (ignorePropsSources.indexOf(propKey) !== -1) {
            return null; //Ignore this property key
        }
        //Find sources for this property
        return getValueSources(context, propValue).forEach(function (source) {
            source.targets.add(node.id, node);
        });
    });
    //Save reference to this node
    context.legends["" + name] = node;
}

//Update a legend node
export function updateLegendNode (context, node) {
    let margin = context.draw.outerMargin.value; //Get outer margins
    node.value = null; //Reset legend values
    node.parent.empty(); //Remove legend content
    let legendPosition = context.value(node.props.position, null, defaultProps.position); //Get legend position
    if (margin[legendPosition] < defaultLegendConfig.minWidth) {
        return null; //Not enought space for this scale
    }
    let orientation = context.value(node.props.orientation, null, defaultProps.orientation); //Get legend orientation
    if (orientationValues.indexOf(orientation) === -1) {
        orientation = defaultProps.orientation; //Get default orientation
    }
    let legendScale = node.props.scale; //context.value(node.props.scale, null);
    let legendType = node.props.type; //context.value(node.props.type, null, defaultProps.type);
    if (typeof legendScale !== "string" || typeof context.scales[legendScale] === "undefined") {
        return null; //TODO: throw error --> undefined scale for this legend
    }
    let scale = context.scales[legendScale].value; //Get scale node
    //Check for a valid legend configuration
    if (isValidLegendConfig(legendType, scale) === false) {
        return null; //TODO: throw error --> not valid type+scale combination
    }
    //Initialize legend sizes values
    let padding = context.value(node.props.padding, 0, 0); //Get padding
    let strokeWidth = context.value(node.props.strokeWidth, null, defaultProps.strokeWidth); //Get stroke width
    let backgroundElement = node.parent.append("rect"); //Legend background
    let border = parseInt(strokeWidth.replace("px", "").trim()); //Parse stroke width
    if (isNaN(border) === true) {
        border = 0; //Prevent bugs
    }
    node.value = {
        "width": margin[legendPosition] - 2 * border, 
        "height": padding + border, 
        "padding": padding,
        "position": legendPosition
    };
    //Render legend title
    let title = context.value(node.props.title, null, defaultProps.title);
    if (title !== null && title !== "") {
        let titleSize = context.value(node.props.titleSize, null, defaultProps.titleSize);
        let titleWeight = context.value(node.props.titleWeight, null, defaultProps.titleWeight);
        let fullTitleSize = measureText(title, {"fontSize": titleSize, "fontWeight": titleWeight}); //Get full title size
        //Render the title
        let titleElement = node.parent.append("text");
        titleElement.text(title); //Add title text
        titleElement.style("font-size", titleSize);
        titleElement.style("font-weight", titleWeight);
        titleElement.style("fill", context.value(node.props.titleFill, null, defaultProps.titleFill));
        titleElement.style("opacity", context.value(node.props.titleOpacity, null, defaultProps.titleOpacity));
        //Set title position
        titleElement.attr("dominant-baseline", "middle"); //Set default baseline
        titleElement.attr("x", padding);
        titleElement.attr("y", padding + fullTitleSize.height / 2);
        //Update legend size
        node.value.height = padding + fullTitleSize.height + defaultProps.titleOffset;
    }
    //Check the legend type
    if (legendType === "glyph") {
        //First iteration --> get max glyph size
        let maxGlyphSize = Math.max.apply(null, scale.domain.map(function (value) {
            return context.value(node.props.glyphSize, value, defaultProps.glyphSize);
        }));
        //Second iteration --> render each item of the legend
        scale.domain.forEach(function (value, index) {
            console.log("Legend value ---> " + value);
            //Render the glyph
            let glyphType = context.value(node.props.glyph, value, defaultProps.glyph);
            let glyphSize = context.value(node.props.glyphSize, value, defaultProps.glyphSize); //Get glyph size
            let labelText = context.value(node.props.label, value, value); //Get label text
            let labelSize = context.value(node.props.labelSize, value, defaultProps.labelSize); //Get label size
            let labelWeight = context.value(node.props.labelWeight, value, defaultProps.labelWeight); //Get label weight
            let fullLabelSize = measureText(labelText, {"fontSize": labelSize, "fontWeight": labelWeight}); //Get full label size
            let height = Math.max(glyphSize, fullLabelSize.height); //Get max block size
            //Render the glyph
            let glyphElement = node.parent.append("path");
            glyphElement.attr("d", getGlyph(glyphType, {"size": glyphSize}));
            glyphElement.style("fill", context.value(node.props.glyphFill, value, defaultProps.glyphFill));
            glyphElement.style("stroke", context.value(node.props.glyphStroke, value, defaultProps.glyphStroke));
            glyphElement.style("stroke-width", context.value(node.props.glyphStrokeWidth, value, defaultProps.glyphStrokeWidth));
            glyphElement.style("opacity", context.value(node.props.glyphOpacity, value, defaultProps.glyphOpacity));
            glyphElement.attr("transform", `translate(${padding + maxGlyphSize / 2},${node.value.height + height / 2})`);
            //Render the label text
            let labelElement = node.parent.append("text");
            labelElement.text(labelText);
            labelElement.style("font-size", labelSize);
            labelElement.style("font-weight", labelWeight);
            labelElement.style("fill", context.value(node.props.labelFill, value, defaultProps.labelFill));
            labelElement.style("opacity", context.value(node.props.labelOpacity, value, defaultProps.labelOpacity));
            //Set label position
            labelElement.attr("dominant-baseline", "middle"); //Default baseline
            labelElement.attr("x", padding + maxGlyphSize + defaultProps.labelOffset);
            labelElement.attr("y", node.value.height + height / 2);
            //Update the height
            node.value.height = node.value.height + height + defaultProps.labelOffset;
        });
    }
    //Check for gradient legend type
    else if (legendType === "gradient") {
        let gradientName = `legend-gradient-${node.name}`; //Gradient definition name
        createGradient(context.defs, gradientName, orientation, scale.range.map(function (color, index) {
            return toRgbaString(color); //Return color as RGBA string
        }));
        let gradientSize = context.value(node.props.gradientSize, 10, defaultProps.gradientSize); 
        //let gradientLength = context.value(node.props.gradientLength, 50, defaultProps.gradientLength);
        let gradientWidth = (node.value.width - 2 * padding); //Full gradient width
        let gradientHeight = gradientSize; //Full gradient height
        let gradientY = node.value.height;
        //Check for vertical orientation
        if (orientation === "vertical") {
            gradientWidth = gradientSize;
            gradientHeight = context.value(node.props.gradientLength, 50, defaultProps.gradientLength);
        }
        //Render the gradient element
        let gradientElement = node.parent.append("rect");
        gradientElement.style("fill", `url('#${gradientName}')`); //`linear-gradient(90deg,${gradientColors.join(",")})`); 
        gradientElement.attr("width", gradientWidth + "px");
        gradientElement.attr("height", gradientHeight + "px");
        gradientElement.attr("x", padding);
        gradientElement.attr("y", gradientY);
        //Update the legend height with the gradient rectangle
        node.value.height = node.value.height + gradientHeight;
        //Get labels sizes
        let labelItems = getGradientTicks(context, node.props, scale);
        let maxLabelHeight = 0; //Math.max.apply(null, scale.domain.map(function (value) {}));
        //let labelIncrement = 1 / (labelItems.length - 1); //Get label items increment
        //Display gradient labels
        labelItems.forEach(function (value, index) {
            let labelText = context.value(node.props.label, value, value); //Get label text
            let labelSize = context.value(node.props.labelSize, value, defaultProps.labelSize); //Get label size
            let labelWeight = context.value(node.props.labelWeight, value, defaultProps.labelWeight); //Get label weight
            let fullLabelSize = measureText(labelText, {"fontSize": labelSize, "fontWeight": labelWeight}); //Get full label size
            maxLabelHeight = Math.max(fullLabelSize.height, maxLabelHeight);
            let pos = Math.abs((value - scale.domain[0]) / (scale.domain[1] - scale.domain[0])); //Label position
            //Render the label text
            let labelElement = node.parent.append("text");
            labelElement.text(labelText);
            labelElement.style("font-size", labelSize);
            labelElement.style("font-weight", labelWeight);
            labelElement.style("fill", context.value(node.props.labelFill, value, defaultProps.labelFill));
            labelElement.style("opacity", context.value(node.props.labelOpacity, value, defaultProps.labelOpacity));
            //Set label position
            if (orientation === "horizontal") {
                labelElement.attr("text-anchor", (pos < 0.01) ? "start" : ((pos > 0.99) ? "end" : "middle"));
                labelElement.attr("dominant-baseline", "hanging"); //Default baseline
                labelElement.attr("x", padding + pos * gradientWidth);
                labelElement.attr("y", node.value.height + defaultProps.labelOffset);
            }
            else {
                labelElement.attr("text-anchor", "start");
                labelElement.attr("dominant-baseline", (pos < 0.01) ? "hanging" : ((pos > 0.99) ? "baseline" : "middle"));
                labelElement.attr("x", padding + gradientWidth + defaultProps.labelOffset);
                labelElement.attr("y", gradientY + pos * gradientHeight);
            }
        });
        //Update the height
        if (orientation === "horizontal") {
            node.value.height = node.value.height + maxLabelHeight + defaultProps.labelOffset;
        }
    }
    //Add the bottom padding
    node.value.height = node.value.height + padding + border;
    //Render the legend background element
    backgroundElement.attr("width", node.value.width + "px");
    backgroundElement.attr("height", node.value.height + "px");
    backgroundElement.attr("rx", context.value(node.props.radius, null, defaultProps.radius));
    backgroundElement.style("fill", context.value(node.props.fill, null, defaultProps.fill));
    backgroundElement.style("stroke", context.value(node.props.stroke, null, defaultProps.stroke));
    backgroundElement.style("stroke-width", strokeWidth);
}

//Update the position of the legend nodes
export function updateLegendPosition (context) {
    let margin = context.draw.outerMargin.value; //Get outer margins
    let positions = {"left": margin.top, "right": margin.top}; //Initialize positions counter
    return objectValues(context.legends).forEach(function (node) {
        if (node.value === null) {
            return null; //Not visible legend
        }
        //Move the legend
        let x = (node.value.position === "left") ? 0 : context.draw.width.value - margin.right; //Get x position
        let y = positions[node.value.position]; //Get y position
        node.parent.attr("transform", `translate(${x},${y})`);
        //Increment the legends position
        positions[node.value.position] = positions[node.value.position] + node.value.height + defaultLegendConfig.offset;
    });
}

