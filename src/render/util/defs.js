//Create a color gradient
export function createGradient (parent, name, colors) {
    let gradient = parent.selectAll(`linearGradient#${name}`);
    if (gradient.length === 0) {
        gradient = parent.append("linearGradient").attr("id", name); //Create the gradient element
    }
    gradient.empty(); //Remove all children elements
    let gradientStep = 100 / (colors.length - 1); //Gradient step
    colors.forEach(function (color, index) {
        gradient.append("stop").attr("offset", `${index * gradientStep}%`).attr("stop-color", color);
    });
    //Return the gradient element
    return gradient;
}

