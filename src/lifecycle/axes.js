import {colors} from "../color.js";
import {polyline} from "../render/primitives/polyline.js";
import {isArray, isObject} from "../util.js";
import {isContinuousScale, isDiscreteScale} from "../scales/index.js";
import {getExpressionSources} from "../runtime/expression.js";
import {getValueSources} from "../runtime/value.js";
import {createHashMap} from "../hashmap.js";
import {ticks as generateTicks} from "../math.js";

//Available orientation values
let orientationValues = ["top", "bottom", "left", "right"];

//Axis default props
let defaultProps = {
    "line": true,
    "lineColor": colors.navy,
    "lineWidth": "1px",
    "lineOpacity": 1,
    //Labels default attributes
    "label": true,
    "labelColor": colors.navy,
    "labelSize": "11px",
    "labelOpacity": 0.8,
    "labelPadding": 5,
    "labelRotation": 0,
    "labelBaseline": "middle", //hanging|middle|baseline
    "labelAnchor": "middle",   //start|middle|center
    //Default ticks attributes
    "ticks": false,
    "tickCount": 0,
    "tickValues": [],
    "tickColor": colors.navy,
    "tickSize": "11px",
    "tickOpacity": 0.8,
    "tickPadding": 5,
    "tickRotation": 0,
    "tickFormat": null,
    "tickBaseline": "middle",   //hanging|middle|baseline
    "tickAnchor": "middle",     //start|middle|end
    "tickSlot": true    //Display a line indication the tick position
};

//Interpolate scale values
let generateValues = function (scale, count) {
    //Check for continuous scale
    if (isContinuousScale(scale) === true) {
        //Get the range values
        let start = Math.min.apply(null, scale.domain); //Get start value
        let end = Math.max.apply(null, scale.domain); //Get end value
        //Return ticks values
        return generateTicks(start, end, count);
    }
    //Check for discrete scale
    else if (isDiscreteScale(scale) === true) {
        return scale.domain;
    }
    //Other scale type: error and return an empty values array
    //TODO
    return [];
};

//Get the display value
//let getDisplayValue = function (context, props, value) {
//    if (typeof props.tickFormat === "string") {
//        return context.expression(props.tickFormat.expr, {
//            "value": value
//        });
//    }
//    //Return the default value
//    return value;
//};

//Get orientation
let getOrientation = function (value) {
    return value.toLowerCase();
};

//Create an axis node
export function createAxisNode (context, parent, props, index) {
    let node = context.addNode({
        "id": `axis:${index}`,
        "props": props, //Object.assign({}, defaultProps, props),
        "type": "axis",
        "targets": null, //createNodeList(),
        "parent": parent
    });
    //Add sources fo this axis
    if (typeof node.props.scale === "string") {
        context.scales[node.props.scale].targets.add(node.id, node);
    }
    //Axis position can be extracted from sources
    getValueSources(context, node.props.position).forEach(function (source) {
        source.targets.add(node.id, node);
    });
    //Check if tickformat is a string --> evaluate as an expression
    if (typeof node.props.tickFormat === "strong") {
        getExpressionSources(context, node.props.tickFormat).forEach(function (source) {
            source.targets.add(node.id, node);
        });
    }
    //Render this axis
    //return updateAxis(context, node);
}

//Export axis drawing
export function updateAxisNode (context, node) {
    let target = node.parent; //parent.append("g");
    let props = node.props; //Object.assign({}, defaultProps, node.props);
    let draw = context.draw.computed;
    let scale = context.scales[props.scale].value;
    //Remove old children nodes
    target.empty();
    //Axis positions and size
    let axisSize = Math.abs(scale.range[1] - scale.range[0]); //Axis size
    //let axisStart = scale.range[0];
    //let axisEnd = scale.range[1];
    //Axis position
    let position = context.value(props.position, 0, 0); //defaultProps.position);
    //Get the axis type
    let orientation = getOrientation(props.orientation);
    let hasAxisLine = context.value(props.line, null, defaultProps.line); //Display axis line
    let isXAxis = orientation === "top" || orientation === "bottom";
    //Calculate the axis positions
    let axisPosition = {};
    //Check for top|bottom axis
    if (isXAxis === true) {
        axisPosition = {
            "x1": position + Math.min(scale.range[0], scale.range[1]),
            "x2": position + Math.max(scale.range[0], scale.range[1]),
            "y1": (orientation === "top") ? 0 : draw.height,
            "y2": (orientation === "top") ? 0 : draw.height
        };
    }
    else {
        axisPosition = {
            "x1": (orientation === "left") ? 0 : draw.width,
            "x2": (orientation === "left") ? 0 : draw.width,
            "y1": position + Math.min(scale.range[0], scale.range[1]),
            "y2": position + Math.max(scale.range[0], scale.range[1])
        };
    }
    //console.log(axisPosition);
    //Display the axis edge
    //if (context.value(props.line, null, defaultProps.line) === true) {
    if (hasAxisLine === true) {
        let line = target.append("path");
        line.attr("fill", "none"); //Prevent errors
        line.attr("stroke", context.value(props.lineColor, null, defaultProps.lineColor));
        line.attr("stroke-width", context.value(props.lineWidth, null, defaultProps.lineWidth));
        line.style("opacity", context.value(props.lineOpacity, null, defaultProps.lineOpacity));
        line.attr("d", polyline({
            "points": [
                [axisPosition.x1, axisPosition.y1],
                [axisPosition.x2, axisPosition.y2]
            ],
            "closed": false
        }));
    }
    //Display ticks
    //if (props.ticks === true) { // && (typeof props.tickCount === "number" || viz.isArray(props.tickValues))) {
    if (context.value(props.ticks, null, defaultProps.ticks) === true) {
        let angle = context.value(props.tickRotation, null, defaultProps.tickRotation); //Get rotation angle
        let tickPadding = context.value(props.tickPadding, 0, defaultProps.tickPadding); //Get ticks padding
        let tickSlot = context.value(props.tickSlot, null, defaultProps.tickSlot); //Display tick slot
        let values = []; //Values to display
        if (isObject(props.tickValues) === true) {
            //Get value from context
            values = context.value(props.tickValues, [], []);
        }
        else {
            //Generate values
            values = generateValues(scale, context.value(props.tickCount, 0, defaultProps.tickCount));
        }
        //Display each label value
        values.forEach(function (value, index) {
            //Calculate the label positions
            let valuePosition = scale(value, index);
            //console.log(value + " --> " + valuePosition);
            //Check for null value --> not valid label
            if (valuePosition === null || typeof valuePosition === "undefined") {
                return false;
            }
            //Check for interval scale
            if (scale.type === "interval") {//if (typeof props.scale.step === "number") {
                valuePosition = valuePosition + scale.step / 2;
            }
            //let labelX = (isXAxis) ? position : props.x - props.labelMargin;
            //let labelY = (props.type === "y") ? position : props.y + props.labelMargin;
            let tickX = 0, tickY = 0; //, tickAnchor = "middle", tickBaseline = "middle";
            let slotLine = null;
            //let labelAnchor = (props.orientation === "left") ? "end" : "start";
            //Calculate the label positions
            if (orientation === "left" || orientation === "right") {
                tickX = axisPosition.x1 + (((orientation === "left") ? -1 : +1) * tickPadding);
                tickY = valuePosition + position; //props.y + props.height - position;
                //Check for displaying the tick slot
                if (tickSlot === true && hasAxisLine === true) {
                    let px2 = axisPosition.x1 + (((orientation === "left") ? -1 : +1) * tickPadding / 3);
                    slotLine = target.append("path");
                    slotLine.attr("d", polyline({
                        "points": [
                            [axisPosition.x1, tickY],
                            [px2, tickY]
                        ],
                        "closed": false
                    }));
                }
            }
            else {
                tickX = valuePosition + position;
                tickY = axisPosition.y1 + (((orientation === "top") ? -1 : +1) * tickPadding);
                //Check for displaying the tick slot
                //if (props.tickSlot === true && props.line === true) {
                if (tickSlot === true && hasAxisLine === true) {
                    let py2 = axisPosition.y1 + (((orientation === "top") ? -1 : +1) * tickPadding / 3);
                    slotLine = target.append("path");
                    slotLine.attr("d", polyline({
                        "points": [
                            [tickX, axisPosition.y1],
                            [tickX, py2]
                        ],
                        "closed": false
                    }));
                }
            }
            //Check for slot line --> set slot style
            if (slotLine !== null) {
                slotLine.attr("fill", "none");
                slotLine.attr("stroke-width", "1px"); //Default slot width
                slotLine.attr("stroke", context.value(props.lineColor, null, defaultProps.lineColor));
                slotLine.style("opacity", context.value(props.lineOpacity, 0, defaultProps.lineOpacity));
            }
            //Display the text element
            let text = target.append("text");
            text.text(context.value(props.tickFormat, value, value));
            text.attr("x", tickX);
            text.attr("y", tickY);
            text.attr("text-anchor", context.value(props.tickAnchor, null, defaultProps.tickAnchor));
            text.attr("alignment-baseline", context.value(props.tickBaseline, null, defaultProps.tickBaseline));
            text.attr("transform", `rotate(${angle}, ${tickX}, ${tickY})`); 
            //Tick text style
            text.attr("fill", context.value(props.tickColor, null, defaultProps.tickColor));
            text.style("font-weight", "bold"); //Default font-weight
            text.style("font-size", context.value(props.tickSize, null, defaultProps.tickSize));
            text.style("opacity", context.value(props.tickOpacity, null, defaultProps.tickOpacity));
        });
    }
    //Done drawing the axis
    //return target;
}

