//Create a color gradient
export function createGradient (parent, name, orientation, colors) {
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

