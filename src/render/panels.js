import {createHashMap} from "../hashmap.js";
import {colors} from "../color.js";
import {clamp, divisors, nthParse, nthCheck} from "../math.js";
import {toArray, isObject, isValid} from "../util.js";

//Default panels props
let defaultProps = {
    "background": "transparent",
    "border": false,
    "borderColor": colors.black,
    "borderWidth": "1px"
};

//Default panels layout
let defaultPanelsLayout = {"rows": 1, "cols": 1, "spacing": 0, "length": 1};

//Calculate panels layout from value
// For example, if a value of 20 is provided, we calculate all divisors and calculate a score
// We will get the divisors pair with the lowest score. If there are more than one with the same score,
// we will get the one with the lowest first divisor (rows).
// 2, 10 ---> score = 12
// 4, 5  ---> score = 9  <<<< this is the best layout
// 5, 4  ---> score = 9
// 10, 2 ---> score = 12
// Result >>> rows=4, cols=5
let buildPanelsLayout = function (value) {
    //Check for negative, 0 or 1 values
    if (value < 2) {
        return {"rows": 1, "cols": 1, "length": 1}; //Return at least one panel
    }
    else if (value === 2 || value === 3) {
        return {"rows": 1, "cols": value, "length": value}; //Return only one row
    }
    let allDivisors = divisors(value); //Get all divisors of the provided value
    //Check if the value is a primer number (only one divisor)
    if (allDivisors.length === 1) {
        allDivisors = divisors(value + 1); //Convert to even number
    }
    //Calculate a score of each divisor
    let scores = allDivisors.map(function (d) {
        return d[0] + d[1];
    });
    let bestScore = Math.min.apply(null, scores); //Get the best score
    let filteredDivisors = allDivisors.filter(function (d, index) {
        return bestScore === scores[index]; //Get only the divisors of the best score
    });
    //Get the best divisor --> the one with the lowest first divisor
    let bestDivisor = filteredDivisors[0]; //Get the first divisor
    //The divisors list are sorted, so the first one has the lowest row value
    //for (let i = 1; i < filteredDivisors.length; i++) {
    //    if (bestDivisor[0] > filteredDivisors[i][0]) {
    //        bestDivisor = filteredDivisors[i]; //Update the best divisor
    //    }
    //}
    //Return the best panels layout
    return {"rows": bestDivisor[0], "cols": bestDivisor[1], "length": value};
};

//Get panels layout
let getPanelsLayout = function (context, props) {
    let newLayout = Object.assign({}, defaultPanelsLayout); //Initialize layout
    //Check for object ---> merge with default props
    if (isObject(props) === true) {
        //Check for row and column values
        if (isValid(props.rows) && isValid(props.cols)) {
            Object.assign(newLayout, {
                "rows": context.value(props.rows, 1, 1),
                "cols": context.value(props.cols, 1, 1)
            });
        }
        //Check for size value --> calculate from 
        else if (isValid(props.size)) {
            Object.assign(newLayout, buildPanelsLayout(context.value(props.size, 1, 1)));
        }
        //Check for spacing value
        if (isValid(props.spacing)) {
            Object.assign(newLayout, {"spacing": context.value(props.spacing, 0, 0)});
        }
    }
    //Check for number --> calculate the number of rows and columns
    else if (typeof props === "number") {
        Object.assign(newLayout, buildPanelsLayout(props)); //Build the layout
    }
    //Return the layout
    return newLayout;
};

//Get panels elements
export function getPanelsElements (context, props) {
    let layout = context.panels.value;
    if (typeof props === "undefined" || props === null || props == "") {
        return [context.panels.elements[0]]; //Return a single panel element
    }
    else if (typeof props === "string" && props === "*") {
        return context.panels.elements; //Return all panels
    }
    //let panels = context.panels;
    //Generate a list with all wanted panels indexes
    let indexes = {};
    toArray(props).forEach(function (value) {
        //Check for number --> as a single index
        if (typeof value === "number") {
            let index = clamp(value - 1, 0, context.panels.elements.length - 1);
            indexes[index] = 1; //Save this index
        }
        //Check for object --> TODO
        else if (isObject(value) && (typeof value.row === "number" || typeof value.col === "number")) {
            //Check for row and column provided
            if (typeof value.row === "number" && typeof value.col === "number") {
                let index = (value.col - 1) + (value.row - 1) * layout.cols;
                if (0 <= index && index < layout.length) {
                    indexes[index] = 1; //Save this single item
                }
            }
            //Check for only row value provided
            else if (typeof value.row === "number") {
                let row = value.row - 1;
                for (let i = 0; i < layout.cols; i++) {
                    let index = i + row * layout.cols;
                    if (0 <= index && index < layout.length) {
                        indexes[index] = 1; //Save this item
                    }
                }
            }
            //Check for only column value provided
            else {
                let col = value.col - 1; //Get column
                for (let i = 0; i < layout.rows; i++) {
                    let index = col + i * layout.cols;
                    if (0 <= index && index < layout.length) {
                        indexes[index] = 1; //Save this item
                    }
                }
            }
        }
        //Check for string ---> parse as a nth expression
        else if (typeof value === "string") {
            let nthExpression = nthParse(value); //Parse as an nth expression
            for (let i = 0; i < context.panels.value.length; i++) {
                if (nthCheck(i + 1, nthExpression) === true) {
                    indexes[i] = 1; //Save this index
                }
            }
        }
        //Ignore other value types
    });
    //Return an array with all panels
    return Object.keys(indexes).map(function (index) {
        return context.panels.elements[index];
    });
}

//Create a panels node
export function createPanelsNode (context, props) {
    let node = context.addNode({
        "id": "panels",
        "type": "panels",
        "value": {"width": 0, "height": 0, "length": 0, "rows": 0, "cols": 0}, 
        "targets": createHashMap(),
        "elements": [],
        "props": props //parsePanelsProps(props)
    });
    //Add this node as a dependency of draw nodes
    context.draw.width.targets.add(node.id, node);
    context.draw.height.targets.add(node.id, node);
    context.draw.margin.targets.add(node.id, node);
    context.draw.outerMargin.targets.add(node.id, node);
    //Save the reference to the panels node
    context.panels = node;
}

//Update a panels node
export function updatePanelsNode (context, node) {
    let props = (isObject(node.props)) ? node.props : {};
    let layout = getPanelsLayout(context, node.props); //Build layout
    //layout.length = layout.rows * layout.cols; //Get layout total size
    //Check if we need to rebuild all panels groups
    if (node.value.rows !== layout.rows || node.value.cols !== layout.cols) {
        context.target.selectAll("g[data-type='panel']").remove(); //Remove all panels
        node.elements = []; //Reset nodes list
        for (let i = 0; i < layout.length; i++) {
            let row = Math.floor(i / layout.cols); //Get row index
            let col = i % layout.cols; //Get column index
            let element = context.target.append("g");
            element.attr("data-type", "panel"); //Set the group type ---> panel
            element.attr("data-row", row + ""); //Set the panel row
            element.attr("data-col", col + ""); //Set the panel col
            //Create a rectangle for displaying panel background
            let bg = element.append("rect");
            bg.attr("id", "panel-background").attr("x", "0").attr("y", "0").attr("fill", "none");
            //Save the panel group element
            node.elements.push(element);
        }
    }
    //Get the new sizes
    let margin = context.draw.margin.value;
    let outerMargin = context.draw.outerMargin.value;
    layout.width = ((context.draw.width.value - outerMargin.left - outerMargin.right) / layout.cols) - margin.left - margin.right;
    layout.height = ((context.draw.height.value - outerMargin.top - outerMargin.bottom) / layout.rows) - margin.top - margin.bottom;
    //Update the groups positions
    node.elements.forEach(function (element) {
        let row = parseInt(element.attr("data-row")); //Get row index
        let col = parseInt(element.attr("data-col")); //Get column index
        let left = (col * layout.width) + (col + 1) * margin.left + col * margin.right; //Calculate the left translation
        let top = (row * layout.height) + (row + 1) * margin.top + row * margin.bottom; //Calculate the top translation
        element.attr("transform", `translate(${left},${top})`); //Translate the panel group
        //Update the panel background
        let bg = element.selectAll("#panel-background");
        bg.attr("width", layout.width).attr("height", layout.height); //Set background size
        bg.attr("fill", context.value(props.background, null, context.theme.panelBackground));
    });
    //Update the layout config
    node.value = layout;
}


