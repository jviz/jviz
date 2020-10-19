import {colors} from "../color.js";
import {polyline} from "./primitives/polyline.js";
import {isArray, isObject, isNumber, span} from "../util.js";
import {isContinuousScale, isDiscreteScale} from "../scales/index.js";
import {getExpressionSources} from "../runtime/expression.js";
import {getValueSources} from "../runtime/value.js";
import {createHashMap} from "../hashmap.js";
import {ticks as generateTicks} from "../math.js";

import {getPanelsLayout} from "./panels.js";

//Available position values
let positionValues = ["top", "bottom", "left", "right"];

//Axis default props
let defaultProps = {
    "values": [],
    //Line configuration
    "line": true,
    "lineColor": "black",
    "lineWidth": "1px",
    "lineOpacity": 1,
    //Labels default attributes
    "label": true,
    "labelColor": "black",
    "labelSize": "11px",
    "labelOpacity": 0.8,
    "labelOffset": 5,
    "labelRotation": 0,
    "labelBaseline": "middle", //hanging|middle|baseline
    "labelAnchor": "middle",   //start|middle|center
    "labelFormat": null,
    "labelInterval": 0.5,      //Label position for interval scales
    //Default ticks attributes
    "tick": false,
    "tickColor": "black",
    "tickWidth": "1px",
    "tickOpacity": 1,
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

//Get position
let getPosition = function (value) {
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
    let draw = context.current.draw; //Get current drawing values
    let scale = context.scales[props.scale].value;
    //Check for empty scale (no domain provided)
    if (scale === null || scale.domain === null || scale.domain.length < 2 || span(scale.domain) === 0) {
        context.target.selectAll(`g[data-axis='${node.id}']`).empty(); //Clear all axes related to this node
        return null; //Ignore this axis
    }
    //Axis positions and size
    let axisSize = Math.abs(scale.range[1] - scale.range[0]); //Axis size
    //let axisStart = scale.range[0];
    //let axisEnd = scale.range[1];
    //Axis position
    //let position = context.value(props.position, 0, 0); //defaultProps.position);
    //Get the axis type
    let position = getPosition(props.position);
    let isXAxis = position === "top" || position === "bottom";
    //let hasAxisLabels = context.value(props.label, null, defaultProps.label); //Display labels
    //let hasAxisTicks = context.value(props.tick, null, defaultProps.tick); //Display axis ticks
    let hasAxisGrid = context.value(props.grid, null, defaultProps.grid); //Display axis grid
    let hasAxisLine = context.value(props.line, null, defaultProps.line); //Display axis line
    //TODO: this should be moved inside panel iterator?
    let values = []; //Values to display
    if (isArray(props.values) === true) {
        values = props.values.map(function (value) {
            return context.value(value, 0, 0);
        });
    }
    //Check for object --> get from context
    else if (isObject(props.values)) {
        values = context.value(props.values, [], []); //Get values from context
    }
    //Other value --> generate values from scale
    else {
        values = generateValues(scale, isNumber(props.values) ? props.values : 0);
    }
    //Get panels where this axis will be rendered
    getPanelsLayout(context, props.panel).forEach(function (panelItem) {
        let panel = panelItem.panel; //Get panel layout
        let element = panelItem.element; //Get panel element
        context.current.panel = panelItem.panel; //Save current panel
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
                "x1": 0 + Math.min(scale.range[0], scale.range[1]),
                "x2": 0 + Math.max(scale.range[0], scale.range[1]),
                "y1": (position === "top") ? 0 : panel.height, //draw.height,
                "y2": (position === "top") ? 0 : panel.height, //draw.height
            };
        }
        else {
            axisPosition = {
                "x1": (position === "left") ? 0 : panel.width, //draw.width,
                "x2": (position === "left") ? 0 : panel.width, //draw.width,
                "y1": 0 + Math.min(scale.range[0], scale.range[1]),
                "y2": 0 + Math.max(scale.range[0], scale.range[1])
            };
        }
        //console.log(axisPosition);
        //Display ticks
        //if (props.ticks === true) { // && (typeof props.tickCount === "number" || viz.isArray(props.values))) {
        if (context.value(props.label, null, defaultProps.label) === true) {
            let labelAngle = context.value(props.labelRotation, null, defaultProps.labelRotation); //Get rotation angle
            let labelOffset = context.value(props.labelOffset, 0, defaultProps.labelOffset); //Get ticks offset
            let labelTick = context.value(props.tick, null, defaultProps.tick); //Display tick slot
            let labelInterval = 0; //Interval position
            if (scale.type === "interval") {
                labelInterval = context.value(props.labelInterval, null, defaultProps.labelInterval);
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
                    valuePosition = valuePosition + scale.step * labelInterval;
                }
                //let labelX = (isXAxis) ? position : props.x - props.labelMargin;
                //let labelY = (props.type === "y") ? position : props.y + props.labelMargin;
                let labelX = 0, labelY = 0; //, tickAnchor = "middle", tickBaseline = "middle";
                let tickLine = null;
                let gridLine = null;
                //let labelAnchor = (props.position === "left") ? "end" : "start";
                //Calculate the label positions
                if (position === "left" || position === "right") {
                    labelX = axisPosition.x1 + (((position === "left") ? -1 : +1) * labelOffset);
                    labelY = valuePosition + 0; //props.y + props.height - position;
                    //Check for displaying the tick slot
                    if (labelTick === true && hasAxisLine === true) {
                        let px2 = axisPosition.x1 + (((position === "left") ? -1 : +1) * labelOffset / 3);
                        tickLine = target.append("path");
                        tickLine.attr("d", polyline({
                            "points": [[axisPosition.x1, labelY], [px2, labelY]],
                            "closed": false
                        }));
                    }
                    //Check for displaying the grid line
                    if (hasAxisGrid === true) {
                        gridLine = target.append("path");
                        gridLine.attr("d", polyline({
                            "points": [[0, labelY], [panel.width, labelY]],
                            "closed": false
                        }));
                    }
                }
                else {
                    labelX = valuePosition + 0;
                    labelY = axisPosition.y1 + (((position === "top") ? -1 : +1) * labelOffset);
                    //Check for displaying the tick slot
                    //if (props.tickSlot === true && props.line === true) {
                    if (labelTick === true && hasAxisLine === true) {
                        let py2 = axisPosition.y1 + (((position === "top") ? -1 : +1) * labelOffset / 3);
                        tickLine = target.append("path");
                        tickLine.attr("d", polyline({
                            "points": [[labelX, axisPosition.y1], [labelX, py2]],
                            "closed": false
                        }));
                    }
                    //Check for displaying the grid line
                    if (hasAxisGrid === true) {
                        gridLine = target.append("path");
                        gridLine.attr("d", polyline({
                            //"points": [[labelX, 0], [labelX, draw.height]],
                            "points": [[labelX, 0], [labelX, panel.height]],
                            "closed": false
                        }));
                    }
                }
                //Check for slot line --> set slot style
                if (tickLine !== null) {
                    tickLine.attr("fill", "none");
                    tickLine.attr("stroke-width", context.value(props.tickWidth, null, defaultProps.tickWidth)); //Default tick width
                    tickLine.attr("stroke", context.value(props.tickColor, null, context.theme.axesTickColor));
                    tickLine.style("opacity", context.value(props.tickOpacity, 0, defaultProps.tickOpacity));
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
                text.text(context.value(props.labelFormat, value, value));
                text.attr("x", labelX);
                text.attr("y", labelY);
                text.attr("text-anchor", context.value(props.labelAnchor, null, defaultProps.labelAnchor));
                text.attr("alignment-baseline", context.value(props.labelBaseline, null, defaultProps.labelBaseline));
                text.attr("transform", `rotate(${labelAngle}, ${labelX}, ${labelY})`); 
                //Tick text style
                text.attr("fill", context.value(props.labelColor, null, context.theme.axesLabelColor));
                text.style("font-weight", "bold"); //Default font-weight
                text.style("font-size", context.value(props.labelSize, null, defaultProps.labelSize));
                text.style("opacity", context.value(props.labelOpacity, null, defaultProps.labelOpacity));
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
    context.current.panel = null; //Reset current panel
}

