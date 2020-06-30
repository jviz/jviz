//Tooltip event names
export const tooltipShowEvent = "mouseenter";
export const tooltipMoveEvent = "mousemove";
export const tooltipHideEvent = "mouseleave";

//Parse event
export function parseEvent (context, event) {
    let scene = context.scene.element; //get scene
    //let client = context.scene.client(); //Get scene client
    let size = scene.size(); //Get scene size
    //console.log(`${event.clientX} - ${event.clientY}`);
    //console.log(`${scene.nodes[0].clientLeft} - ${scene.nodes[0].clientTop}`);
    let x = event.clientX - scene.nodes[0].clientLeft- size.left;
    let y = event.clientY - scene.nodes[0].clientTop- size.top;
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


