import {colors} from "../color.js";
import {polyline} from "../render/primitives/polyline.js";
import {isArray} from "../util.js";
import {isContinuousScale, isDiscreteScale} from "../scales/index.js";
import {getExpressionSources} from "../runtime/expression.js";
import {getValueSources} from "../runtime/value.js";
import {createHashMap} from "../hashmap.js";

//Axis default props
let defaultProps = {
    "position": 0,
    //Values to display
    "scale": null,
    //Axis orientation: left|right|top|bottom
    "orientation": "left",
    //Axis line
    "line": true,
    "lineColor": colors.navy,
    "lineWidth": "1px",
    "lineOpacity": 1,
    //Labels configuration
    "label": true,
    "labelColor": colors.navy,
    "labelSize": "11px",
    "labelOpacity": 0.8,
    "labelPadding": 5,
    "labelRotation": 0,
    "labelBaseline": "middle", //hanging|middle|baseline
    "labelAnchor": "middle",   //start|middle|center
    //Ticks configuration
    "ticks": false,
    "tickCount": null,
    "tickValues": null,
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
        let range = {
            "start": Math.min.apply(null, scale.domain),
            "end": Math.max.apply(null, scale.domain)
        };
        //Output values list
        let values = [];
        //Check for the same range values
        if(range.start === range.end) {
            return [range.start];
        }
        //Determine Range length
        range.length = range.end - range.start; // + 1;
        //console.log(range);
        // Adjust ticks if needed
        if (count < 3) {
            count = 3; //At least add the start and end values
        }
        //Get the raw tick size
        let unroundedTickSize = range.length / count;
        //Round the tick size into nice amounts
        let mag = Math.ceil(Math.log10(unroundedTickSize)-1);
        let magPow = Math.pow(10, mag);
        let roundedTickRange = Math.ceil(unroundedTickSize / magPow) * magPow;
        //Adjust the lower and upper bound accordingly
        let minRounded = roundedTickRange * Math.floor(range.start / roundedTickRange);
        let maxRounded = roundedTickRange * Math.ceil(range.end / roundedTickRange);
        //Generate the values
        for(let x = minRounded; x <= maxRounded; x = x + roundedTickRange) {
            //Add this value only if is in the range interval
            if (range.start <= x && x <= range.end) {
                values.push(parseFloat(x.toFixed(8))); //Convert 1.2000000000000002 --> 1.2
            }
        }
        //Return the interpolated values
        return values;
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
let getDisplayValue = function (context, props, value) {
    if (typeof props.tickFormat === "string") {
        return context.expression(props.tickFormat, {
            "value": value
        });
    }
    //Return the default value
    return value;
}

//Create an axis node
export function createAxisNode (context, parent, props, index) {
    let node = context.addNode(`axis:${index}`, {
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
    let props = Object.assign({}, defaultProps, node.props);
    let draw = context.draw.computed;
    let scale = context.scales[props.scale].value;
    //Remove old children nodes
    target.empty();
    //Axis positions and size
    let axisSize = Math.abs(scale.range[1] - scale.range[0]); //Axis size
    //let axisStart = scale.range[0];
    //let axisEnd = scale.range[1];
    //Axis position
    let position = context.value(props.position, defaultProps.position);
    //Get the axis type
    let isXAxis = props.orientation === "top" || props.orientation === "bottom";
    //Calculate the axis positions
    let axisPosition = {};
    //Check for top|bottom axis
    if (isXAxis === true) {
        axisPosition = {
            "x1": position + Math.min(scale.range[0], scale.range[1]),
            "x2": position + Math.max(scale.range[0], scale.range[1]),
            "y1": (props.orientation === "top") ? 0 : draw.height,
            "y2": (props.orientation === "top") ? 0 : draw.height
        };
    }
    else {
        axisPosition = {
            "x1": (props.orientation === "left") ? 0 : draw.width,
            "x2": (props.orientation === "left") ? 0 : draw.width,
            "y1": position + Math.min(scale.range[0], scale.range[1]),
            "y2": position + Math.max(scale.range[0], scale.range[1])
        };
    }
    //console.log(axisPosition);
    //Display the axis edge
    if (props.line === true) {
        let line = target.append("path");
        line.attr("fill", "none");
        line.attr("stroke", props.lineColor);
        line.attr("stroke-width", props.lineWidth);
        line.style("opacity", props.lineOpacity);
        line.attr("d", polyline({
            "points": [
                [axisPosition.x1, axisPosition.y1],
                [axisPosition.x2, axisPosition.y2]
            ],
            "closed": false
        }));
    }
    //Display ticks
    if (props.ticks === true) { // && (typeof props.tickCount === "number" || viz.isArray(props.tickValues))) {
        //Parse the rotation angle
        let angle = props.tickRotation;
        //Get values to display
        let values = isArray(props.tickValues) ? props.tickValues : generateValues(scale, props.tickCount);
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
            //let labelAnchor = (props.orientation === "left") ? "end" : "start";
            //Calculate the label positions
            if (props.orientation === "left" || props.orientation === "right") {
                tickX = axisPosition.x1 + (((props.orientation === "left") ? -1 : +1) * props.tickPadding);
                tickY = valuePosition + position; //props.y + props.height - position;
                //Check for displaying the tick slot
                if (props.tickSlot === true && props.line === true) {
                    let px2 = axisPosition.x1 + (((props.orientation === "left") ? -1 : +1) * props.tickPadding / 3);
                    let slotLine = target.append("path");
                    slotLine.attr("d", polyline({
                        "points": [
                            [axisPosition.x1, tickY],
                            [px2, tickY]
                        ],
                        "closed": false
                    }));
                    slotLine.attr("fill", "none");
                    slotLine.attr("stroke", props.lineColor);
                    slotLine.attr("stroke-width", "1px");
                    slotLine.style("opacity", props.lineOpacity);
                }
                //labelAngle = props.labelRotation;
                //tickAnchor = (props.orientation === "left") ? "end" : "start"; //Default label anchor
                //Check the rotation angle
                //if (angle === 90) {
                //    tickAnchor = "middle";
                //    tickBaseline = (props.orientation === "left") ? "hanging" : "baseline";
                //}
                //else if (angle === -90) {
                //    tickAnchor = "middle";
                //    tickBaseline = (props.orientation === "left") ? "baseline" : "hanging";
                //}
            }
            else {
                tickX = valuePosition + position;
                tickY = axisPosition.y1 + (((props.orientation === "top") ? -1 : +1) * props.tickPadding);
                //Check for displaying the tick slot
                if (props.tickSlot === true && props.line === true) {
                    let py2 = axisPosition.y1 + (((props.orientation === "top") ? -1 : +1) * props.tickPadding / 3);
                    let slotLine = target.append("path");
                    slotLine.attr("d", polyline({
                        "points": [
                            [tickX, axisPosition.y1],
                            [tickX, py2]
                        ],
                        "closed": false
                    }));
                    slotLine.attr("fill", "none");
                    slotLine.attr("stroke", props.lineColor);
                    slotLine.attr("stroke-width", "1px");
                    slotLine.style("opacity", props.lineOpacity);
                }
                //tickAnchor = "start";
                //labelAngle = (props.orientation === "top") ? props.labelRotation - 90 : 90 - props.labelRotation;
                //Check for no rotation angle
                //if (angle === 0) {
                //    tickBaseline = (props.orientation === "top") ? "baseline" : "hanging";
                //    tickAnchor = "middle";
                //}
            }
            //Display the text element
            let text = target.append("text");
            text.text(getDisplayValue(context, props, value));
            text.attr("x", tickX);
            text.attr("y", tickY);
            text.attr("text-anchor", props.tickAnchor);
            text.attr("alignment-baseline", props.tickBaseline);
            text.attr("transform", `rotate(${angle}, ${tickX}, ${tickY})`); 
            //Tick text style
            text.attr("fill", props.tickColor);
            text.style("font-size", props.tickSize);
            text.style("font-weight", "bold");
            text.style("opacity", props.tickOpacity);
        });
    }
    //Done drawing the axis
    //return target;
}

