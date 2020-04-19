//Measure text
export function measureText (text, style) {
    let element = document.createElement("div");
    element.textContent = text; //Insert text content
    //Set element size
    element.style.fontSize = style.fontSize;
    element.style.fontFamily = style.fontFamily;
    element.style.lineHeight = "1em"; //Set line height as normal
    element.style.position = "absolute";
    element.style.top = "-9999px";
    element.style.left = "-9999px";
    document.body.appendChild(element);
    //Return element size
    let elementSize = {
        "width": element.offsetWidth,
        "height": element.offsetHeight
    };
    document.body.removeChild(element);
    return elementSize;
}
