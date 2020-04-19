import {tooltipShowEvent, tooltipMoveEvent, tooltipHideEvent} from "./util/event.js";
import {parseEvent} from "./util/event.js";
import {measureText} from "./util/text.js";
import {colors} from "../color.js";

//Tooltip default style
let tooltipStyle = {
    "borderRadius": 3,
    "borderWidth": "1px",
    "borderColor": colors.navy,
    "background": colors.white,
    "textSize": "10px",
    "textFont": "monospace",
    "textColor": colors.navy,
    "padding": 5
};

//Tooltip handler
let TooltipHandler = function (target) {
    this.target = target;
    this.offset = 5; //Tooltip offset
    this.quarter = null; //Quarter position
    this.width = 100; //Current tooltip width
    this.height = 20; //Current tooltip height
    this.transform = "translate(10, 10)"; //Extra transform
    //Set group style
    //this.target.style("transition", "transform 0.05s");
};

//Tooltip handler prototype
TooltipHandler.prototype = {
    //Set tooltip position
    "move": function (x, y, quarter) {
        if (quarter !== this.quarter) {
            if (quarter === "tl") {
                this.transform = `translate(${this.offset},${this.offset})`;
            }
            else if (quarter === "tr") {
                this.transform = `translate(${(-this.width)-this.offset},${this.offset})`;
            }
            else if (quarter === "bl") {
                this.transform = `translate(${this.offset},${(-this.height)-this.offset})`;
            }
            else {
                this.transform = `translate(${(-this.width)-this.offset},${(-this.height)-this.offset})`;
            }
            this.quarter = quarter;
        }
        this.target.attr("transform", `${this.transform} translate(${x}, ${y})`);
    },
    //Display tooltip
    "show": function (content) {
        let size = measureText(content, {
            "fontSize": tooltipStyle.textSize,
            "fontFamily": tooltipStyle.textFont
        });
        this.width = size.width + 2 * tooltipStyle.padding;
        this.height = size.height + 2 * tooltipStyle.padding;
        //Build tooltip rectangle
        this.target.append("rect")
            .attr("width", this.width + "px")
            .attr("height", this.height + "px")
            .attr("rx", tooltipStyle.borderRadius)
            .style("fill", tooltipStyle.background)
            .style("stroke", tooltipStyle.borderColor)
            .style("strokeWidth", tooltipStyle.borderWidth);
        //Build tooltip text
        this.target.append("text")
            .attr("x", tooltipStyle.padding)
            .attr("y", tooltipStyle.padding)
            .attr("dominant-baseline", "hanging")
            .style("font-family", tooltipStyle.textFont)
            .style("font-size", tooltipStyle.textSize)
            .style("color", tooltipStyle.textColor)
            .text(content);
    },
    //Hide tooltip
    "hide": function () {
        this.target.empty(); //Clean 
        this.quarter = null; //Reset current quarter
    }
};

//Create a tooltip
export function createTooltip (target, options) {
    return new TooltipHandler(target);
}

//Register tooltip events to an element
export function setTooltipEvents (context, element, datum, props) {
    //Register element enter event listener ---> display tooltip
    element.on(tooltipShowEvent, function (event) {
        let content = context.expression(props.value, {
            "datum": datum
        });
        return context.tooltip.show(content);
    });
    //Register element move event listener ---> move tooltip
    element.on(tooltipMoveEvent, function (event) {
        let e = parseEvent(context, event); //Parse event
        return context.tooltip.move(e.sceneX, e.sceneY, e.quarter); //Move tooltip
    });
    //Register element leave event listener ---> hide tooltip
    element.on(tooltipHideEvent, function (event) {
        return context.tooltip.hide();
    });
}

