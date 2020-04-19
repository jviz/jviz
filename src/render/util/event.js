//Tooltip event names
export const tooltipShowEvent = "mouseenter";
export const tooltipMoveEvent = "mousemove";
export const tooltipHideEvent = "mouseleave";

//Parse event
export function parseEvent (context, event) {
    //let client = context.scene.client(); //Get scene client
    let size = context.scene.size(); //Get scene size
    let x = event.clientX - size.left - context.scene.node.clientLeft;
    let y = event.clientY - size.top - context.scene.node.clientTop;
    let hw = context.draw.width.value / 2;
    let hh = context.draw.height.value / 2;
    //Return parsed event
    return {
        //"x": x - context.draw.padding.value.left,
        //"y": y - context.draw.padding.value.top,
        "sceneX": x,
        "sceneY": y,
        "quarter": (x <= hw) ? ((y <= hh) ? "tl" : "bl") : ((y <= hh) ? "tr" : "br")
    };
}


