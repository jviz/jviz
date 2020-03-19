import {isObject, isString, isArray} from "../util.js";
import {each, values as objectValues} from "../util.js";
import {propTypes, parseProps} from "../props.js";
import {setStyle, isStyleName} from "../render/style.js";
import {setEvent, isEventName} from "../render/events.js";
import {getValueSources} from "../runtime/value.js";
import {getExpressionSources} from "../runtime/expression.js";
import {getShape} from "../shapes/index.js";

//build shape data
let buildShapeData = function (context, props) {
    //Get data in context
    let data = context.source(props.source);
    //Check for transform to apply
    if (isArray(props.transform) || isObject(props.transform)) {
        data = data.map(function (item) {
            return context.transform(item, props.transform);
        });
    }
    //Return the parsed data
    return data;
};

//Get shape data
let getShapeData = function (data, props) {
    //Check the type of shape
    if (props.type === "line" || props.type === "area") {
        return data;
    }
    //Return only the first item
    return data[0];
};

//Build shape element
let createShapeElement = function (shape, parent, index, group) {
    return parent.append(shape.tag).attr("id", `shape__${group}__${index}`);
};

//Get a shape element
let getShapeElement = function (shape, parent, index, group) {
    return parent.selectAll(`#shape__${group}__${index}`);
};

//Check if render props contain a shape props
let hasShapeRenderProps = function (props, shape) {
    let keys = Object.keys(props);
    for (let i = 0; i < keys.length; i++) {
        if (typeof shape.props[keys[i]] !== "undefined") {
            return true; //Found a shape prop
        }
    }
    //No shape props found
    return false;
};

//Get rendering props
let getShapeRenderProps = function (props, event) {
    let renderProps = {}; //props.render.mount;
    //Check if mounting props are provided
    if (typeof props.render["mount"] === "object" && props.render["mount"] !== null) {
        renderProps = Object.assign({}, props.render["mount"]);
    }
    //Check the current event
    if (typeof props.render[event] === "object" && props.render[event] !== null) {
        renderProps = Object.assign({}, renderProps, props.render[event]);
    }
    //Return the final props
    return renderProps;
};

//Get shape groups
let getShapeGroups = function (props) {
    if (props.type === "group") {
        return (typeof props.shapes !== "undefined") ? objectValues(props.shapes) : [];
    }
    //Else: return this shape props as an array
    return [props];
};

//Apply shape style
let applyShapeStyle = function (context, datum, props, target) {
    let datumValue = (isArray(datum) === true) ? datum[0] : datum; //Get datum value
    return each(props, function (key, value) {
        if (value !== null && isStyleName(key) === true) {
            return setStyle(target, key, context.value(props[key], datumValue)); //Apply style
        }
    });
}

//Create a new shape node
export function createShapeNode (context, parent, props, key) {
    //Initialize the shape node
    let node = context.createNode(`shape:${key}`, {
        "id": `shape:${key}`,
        "type": "shape",
        "props": props,
        "targets": null,
        "parent": parent,
        "source": null,
        "value": [],
    });
    //Get the source data
    if (typeof props.source === "object" && props.source !== null) {
        if (typeof props.source.data === "string") {
            let source = context.data[props.source.data];
            Object.assign(node, {
                "source": source
            });
            //Add this shape node as a target node for this data object
            source.targets.add(node.id, node);
        }
    } 
    //Get values sources
    getShapeGroups(node.props).forEach(function (groupProps) {
        return each(groupProps.render, function (key, renderProps) {
            return each(renderProps, function (propKey, propValue) {
                return getValueSources(context, propValue).forEach(function (source) {
                    //console.log(source);
                    source.targets.add(node.id, node); //Add this shape as a target node
                });
            })
        });
    });
    //Render this shape the first time
    //return updateShape(context, node, true);
}

//Update the provided node
export function updateShapeNode (context, node, forceRender) {
    //Check for force rendering the shape
    if (forceRender === true) {
        //Clean the parent node
        node.parent.empty();
        //Get data to apply
        Object.assign(node, {
            "value": buildShapeData(context, node.props)
        });
    }
    //Get shape groups
    getShapeGroups(node.props).forEach(function (props, groupIndex) {
        //Get the shape item
        let shape = getShape(props.type);
        //Mounting props
        let updateProps = getShapeRenderProps(props, "update");
        let hoverProps = getShapeRenderProps(props, "hover");
        //Check for no force render
        if (forceRender === false) {
            //Check for no update render
            if (typeof props.render.update !== "object" || props.render.update === null) {
                return;
            }
            //Check if we should reload each rendered shape
            let reloadShape = hasShapeRenderProps(props.render.update, shape); 
            //Access to all items
            return getShapeData(node.value, props).forEach(function (data, index) {
                //Select the element attached to this data node
                let element = getShapeElement(shape, node.parent, index, groupIndex);
                //Check for render props
                if (reloadShape === true) {
                    shape.render(context, data, updateProps, element); //Redraw this element
                }
                //Apply style props
                applyShapeStyle(context, data, props.render.update, element);
            });
        }
        //Build shapes for each data group
        getShapeData(node.value, props).forEach(function (data, index) { 
            let element = createShapeElement(shape, node.parent, index, groupIndex);
            shape.render(context, data, updateProps, element);  // --> render mount + update props
            //Apply style props
            applyStyle(context, data, updateProps, element);
            //Register on hover events
            if (typeof props.render.hover === "object" && props.render.hover !== null) {
                //Register enter event listener --> apply hover props
                element.on("mouseenter", function (event) {
                    if (hasShapeRenderProps(props.render.hover, shape) === true) {
                        shape.render(context, data, hoverProps, element); //Redraw this element
                    }
                    //Apply style props
                    applyShapeStyle(context, data, props.render.hover, element);
                });
                //Check for update props provided
                if (typeof props.render.update === "object" && props.render.update !== null) {
                    //Register on leave event listener --> apply update props to this element
                    element.on("mouseleave", function (event) {
                        if (hasShapeRenderProps(props.render.update, shape) === true) {
                            shape.render(context, data, updateProps, element); //Redraw this element
                        }
                        //Apply style props
                        applyShapeStyle(context, data, props.render.update, element);
                    });
                }
            }
            //Register additional event listening
            each(props.on, function (eventIndex, eventProps) {
                return setEvent(element, eventProps.type, function (event) {
                    //Check for signal update event
                    if (isString(eventProps.state) && isString(eventProps.value)) {
                        //Register an action to update this state
                        let stateNode = context.state[eventProps.state];
                        if (typeof stateNode !== "undefined") {
                            context.createAction(stateNode, context.expression(eventProps.value, {
                                "datum": data,
                                "event": event //TODO: process event values
                            }));
                            //Trigger the update action
                            context.render();
                        }
                    }
                    //Check for fire this event to the api
                    if (isString(eventProps.fire)) {
                        return context.events.dispatchEvent(eventProps.fire, event, data);
                    }
                });
            });
        });
    });
}

