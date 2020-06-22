import {isObject} from "../util.js";
import {setStyle} from "./style.js";

//Get a value
let getValue = function (a, b) {
    return (typeof a !== "undefined") ? a : b;
};

//Default title props
let defaultProps = {
    "text": "", //Title text
    "align": "center", //text align: left|center|right
    "offset": 0, //Text offset
    "fill": "black",
    "opacity": "1.0",
    "fontSize": "16px",
    "fontWeight": "bold"
};

//Style attributes
let titleStyles = ["fill", "opacity", "fontSize", "fontWeight"];

//Create a title node
export function createTitleNode (context, index, props) {
    let node = context.addNode({
        "id": "title",
        "type": "title",
        "value": null,
        "props": (typeof props === "string") ? {"text": props} : props,
        "target": null
    });
    //Add as a target of width and outerMargin nodes
    context.draw.width.targets.add(node.id, node);
    context.draw.outerMargin.targets.add(node.id, node);
    //Do not save this node in the context --> we do not need the reference
}

//Update a title node
export function updateTitleNode (context, node) {
    if (isObject(node.props) === false || typeof node.props.text !== "string") {
        return null; //Nothing to render
    }
    let props = node.props; //Get props reference
    let theme = context.theme; //Get theme reference
    let margins = context.draw.outerMargin.value; //Get outer margins
    //Check for null target --> create a new text node
    if (node.target === null) {
        node.target = context.scene.element.append("text"); //Create a new text element
        node.target.attr("dominant-baseline", "middle"); //Set default baseline
        //Render text --> this should be moved below
        node.target.text(props.text); //node.target.attr("text", props.text);
        setStyle(node.target, "fill", getValue(props["fill"], theme["titleColor"]));
        setStyle(node.target, "fontSize", getValue(props["fontSize"], theme["titleFontSize"]));
        setStyle(node.target, "fontWeight", getValue(props["fontWeight"], theme["titleFontWeight"]));
        setStyle(node.target, "opacity", getValue(props["opacity"], defaultProps["opacity"]));
    }
    //Move the text
    let align = getValue(props["align"], defaultProps["align"]); //Get align position
    let offset = getValue(props["offset"], defaultProps["offset"]); //Get text offset
    if (align === "left") {
        node.target.attr("text-anchor", "start"); //Align to start
        node.target.attr("x", margins.left);
    }
    else if (align === "right") {
        node.target.attr("text-anchor", "end"); //Align to end
        node.target.attr("x", margins.right);
    }
    else {
        node.target.attr("text-anchor", "middle"); //Centered
        node.target.attr("x", context.draw.width.value / 2);
    }
    //Set text position
    //node.target.attr("x", x); //Set x position
    node.target.attr("y", (margins.top / 2) + offset); //Set y position
}

