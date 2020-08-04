//Svg metadata attributes
export const metadata = {
    "version": "1.1",
    "xmlns": "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink"
};

//Generate a rotate transform
export function rotate (angle) {
    return `rotate(${angle})`;
}

//Generate a translate transform
export function translate (x, y) {
    return `translate(${x},${y})`;
}

//Generate a scale transform
export function scale (x, y) {
    return `scale(${x},${y})`;
}

//Generate a transform
export function transform (args) {
    return [
        (typeof args.x !== "undefined" && typeof args.y !== "undefined") ? translate(args.x, args.y) : "",
        (typeof args.angle !== "undefined") ? rotate(args.angle) : "",
        (typeof args.scaleX !== "undefined" && typeof args.scaleY !== "undefined") ? scale(args.scaleX, args.scaleY) : ""
    ].join(" ");
}

//Create a color gradient
export function gradient (parent, name, orientation, colors) {
    let gradient = parent.selectAll(`linearGradient#${name}`);
    if (gradient.length === 0) {
        gradient = parent.append("linearGradient").attr("id", name); //Create the gradient element
    }
    gradient.empty(); //Remove all children elements
    let gradientStep = 100 / (colors.length - 1); //Gradient step
    colors.forEach(function (color, index) {
        gradient.append("stop").attr("offset", `${index * gradientStep}%`).attr("stop-color", color);
    });
    gradient.attr("x2", (orientation === "vertical") ? "0" : "1");
    gradient.attr("y2", (orientation === "vertical") ? "1" : "0");
    //Return the gradient element
    return gradient;
}

