import {colors} from "../color.js";
import {polyline} from "./primitives/polyline.js";
import {isArray, isObject} from "../util.js";
import {isContinuousScale, isDiscreteScale} from "../scales/index.js";
import {getExpressionSources} from "../runtime/expression.js";
import {getValueSources} from "../runtime/value.js";
import {createHashMap} from "../hashmap.js";
import {ticks as generateTicks} from "../math.js";

import {getPanelsElements} from "./panels.js";

//Available orientation values
let orientationValues = ["top", "bottom", "left", "right"];

//Axis default props
let defaultProps = {
    "line": true,
    "lineColor": "black",
    "lineWidth": "1px",
    "lineOpacity": 1,
    //Labels default attributes
    "label": true,
    "labelColor": "black",
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
    "tickColor": "black",
    "tickSize": "11px",
    "tickOpacity": 0.8,
    "tickOffset": 5,
    "tickRotation": 0,
    "tickFormat": null,
    "tickBaseline": "middle",   //hanging|middle|baseline
    "tickAnchor": "middle",     //start|middle|end
    "slot": true,    //Display a line indication the tick position
    "slotColor": "black",
    "slotOpacity": 1,
    "slotWidth": "1px",
    //Default grid attributes
    "grid": false,
    "gridColor": "black",
    "gridOpacity": 1,
    "gridWidth": "1px"
};

//Interpolate scale values
let generateValues = function (scale, count) {
    //Check for continuous scale
    if (isContinuousScale(scale) === true) {
        //Get the range values
        let start = Math.min.apply(null, scale.domain); //Get start value
        let end = Math.max.apply(null, scale.domain); //Get end value
        //Return ticks values
        return generateTicks(start, end, count).filter(function (value) {
            return start <= value && value <= end;
        });
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
export function createAxisNode (context, index, props) {
    let node = context.addNode({
        "id": `axis:${index}`,
        "props": props, //Object.assign({}, defaultProps, props),
        "type": "axis",
        "targets": null, //createNodeList(),
        "parent": []
    });
    //Add sources fo this axis
    context.panels.targets.add(node.id, node); //Always ad the panels node
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
    //let target = node.parent; //parent.append("g");
    let props = node.props; //Object.assign({}, defaultProps, node.props);
    let draw = context.panels.value; //context.draw.computed;
    let scale = context.scales[props.scale].value;
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
    let hasAxisTicks = context.value(props.ticks, null, defaultProps.ticks); //Display ticks
    let hasAxisGrid = context.value(props.grid, null, defaultProps.grid); //Display axis grid
    let ticksValues = []; //Values to display
    if (hasAxisTicks === true) {
        if (isArray(props.tickValues) === true) {
            ticksValues = props.ticksValues.map(function (value) {
                return context.value(value, 0, 0);
            });
        }
        else if (isObject(props.tickValues)) {
            tickValues = context.value(props.tickValues, [], []); //Get values from context
        }
        else {
            //Generate values from counts
            ticksValues = generateValues(scale, context.value(props.tickCount, 0, defaultProps.tickCount));
        }
    }
    //Get panels where this axis will be rendered
    getPanelsElements(context, props.panel).forEach(function (element, index) {
        //Check if there is a group for this axis
        let target = element.selectAll(`g[data-axis='${node.id}']`);
        if (target.length === 0) {
            target = element.append("g").attr("data-axis", node.id); //Create a new axis
        }
        //Remove old children
        target.empty();
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
        //Display ticks
        //if (props.ticks === true) { // && (typeof props.tickCount === "number" || viz.isArray(props.tickValues))) {
        if (context.value(props.ticks, null, defaultProps.ticks) === true) {
            let angle = context.value(props.tickRotation, null, defaultProps.tickRotation); //Get rotation angle
            let tickOffset = context.value(props.tickOffset, 0, defaultProps.tickOffset); //Get ticks offset
            let tickSlot = context.value(props.slot, null, defaultProps.slot); //Display tick slot
            //Display each label value
            ticksValues.forEach(function (value, index) {
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
                let gridLine = null;
                //let labelAnchor = (props.orientation === "left") ? "end" : "start";
                //Calculate the label positions
                if (orientation === "left" || orientation === "right") {
                    tickX = axisPosition.x1 + (((orientation === "left") ? -1 : +1) * tickOffset);
                    tickY = valuePosition + position; //props.y + props.height - position;
                    //Check for displaying the tick slot
                    if (tickSlot === true && hasAxisLine === true) {
                        let px2 = axisPosition.x1 + (((orientation === "left") ? -1 : +1) * tickOffset / 3);
                        slotLine = target.append("path");
                        slotLine.attr("d", polyline({
                            "points": [
                                [axisPosition.x1, tickY],
                                [px2, tickY]
                            ],
                            "closed": false
                        }));
                    }
                    //Check for displaying the grid line
                    if (hasAxisGrid === true) {
                        gridLine = target.append("path");
                        gridLine.attr("d", polyline({
                            "points": [[0, tickY], [draw.width, tickY]],
                            "closed": false
                        }));
                    }
                }
                else {
                    tickX = valuePosition + position;
                    tickY = axisPosition.y1 + (((orientation === "top") ? -1 : +1) * tickOffset);
                    //Check for displaying the tick slot
                    //if (props.tickSlot === true && props.line === true) {
                    if (tickSlot === true && hasAxisLine === true) {
                        let py2 = axisPosition.y1 + (((orientation === "top") ? -1 : +1) * tickOffset / 3);
                        slotLine = target.append("path");
                        slotLine.attr("d", polyline({
                            "points": [
                                [tickX, axisPosition.y1],
                                [tickX, py2]
                            ],
                            "closed": false
                        }));
                    }
                    //Check for displaying the grid line
                    if (hasAxisGrid === true) {
                        gridLine = target.append("path");
                        gridLine.attr("d", polyline({
                            "points": [[tickX, 0], [tickX, draw.height]],
                            "closed": false
                        }));
                    }
                }
                //Check for slot line --> set slot style
                if (slotLine !== null) {
                    slotLine.attr("fill", "none");
                    slotLine.attr("stroke-width", context.value(props.slotWidth, null, defaultProps.slotWidth)); //Default slot width
                    slotLine.attr("stroke", context.value(props.slotColor, null, context.theme.axesSlotColor));
                    slotLine.style("opacity", context.value(props.slotOpacity, 0, defaultProps.slotOpacity));
                }
                //Check for grid line --> set grid line
                if (gridLine !== null) {
                    gridLine.attr("fill", "none");
                    gridLine.attr("stroke-width", context.value(props.gridWidth, null, defaultProps.gridWidth));
                    gridLine.attr("stroke", context.value(props.gridColor, null, context.theme.axesGridColor));
                    gridLine.style("opacity", context.value(props.gridOpacity, 0, defaultProps.gridOpacity));
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
                text.attr("fill", context.value(props.tickColor, null, context.theme.axesTickColor));
                text.style("font-weight", "bold"); //Default font-weight
                text.style("font-size", context.value(props.tickSize, null, defaultProps.tickSize));
                text.style("opacity", context.value(props.tickOpacity, null, defaultProps.tickOpacity));
            });
        }
        //Display the axis edge
        //if (context.value(props.line, null, defaultProps.line) === true) {
        if (hasAxisLine === true) {
            let line = target.append("path");
            line.attr("fill", "none"); //Prevent errors
            line.attr("stroke", context.value(props.lineColor, null, context.theme.axesLineColor));
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
    });
    //Done drawing the axis
    //return target;
}

