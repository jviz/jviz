import {createHashMap} from "../hashmap.js";
import {colors} from "../color.js";
import {clamp, divisors, nthParse, nthCheck, range} from "../math.js";
import {toArray, isArray, isObject, isValid, values as objectValues} from "../util.js";

//Default panels props
let defaultProps = {
    "background": "transparent",
    "border": false,
    "borderColor": colors.black,
    "borderWidth": "1px"
};

//Default panels layout
let defaultPanelsLayout = {"rows": 1, "cols": 1, "spacing": 0, "panels": [], "length": 1};

//Parse layout matrix
let parseMatrixLayout = function (context, matrix) {
    let numRows = matrix.length; //Get number of rows
    let numCols = matrix[0].length; //Get number of columns
    //TODO: check if all rows have the same number of columns
    let panels = {};
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            let index = matrix[i][j];
            if (typeof index !== "number" || isNaN(index) || index < 1) {
                continue; //Gap
            }
            //Check if this panel does not exists
            if (typeof panels[index] !== "undefined") {
                let panel = panels[index]; //Get current panel
                if (i <= panel["endRow"] && j <= panel["endCol"]) {
                    continue; //This panel has been processed
                }
                //If not --> wrong layout
                return context.error(`Invalid matrix layout provided: wrong panel at position [${i},${j}]`);
            }
            //Initialize the new panel
            let panel = {"index": index, "startRow": i, "endRow": i, "startCol": j, "endCol": j};
            //Process next values of the panel
            for (let ii = i + 1; ii < numRows; ii++) {
                if (matrix[ii][j] !== index) {
                    break; //End of panel row
                }
                panel["endRow"] = ii; //Update end row index
            }
            for (let jj = j + 1; jj < numCols; jj++) {
                if (matrix[i][jj] !== index) {
                    break; //End of panel column
                }
                panel["endCol"] = jj; //Update end col index
            }
            //Check if all cells have the same index
            for (let ii = panel.startRow; ii <= panel.endRow; ii++) {
                for (let jj = panel.startCol; jj <= panel.endCol; jj++) {
                    if (matrix[ii][jj] !== index) {
                        return context.error(`Invalid matrix layout provided: expected index '${index}' at position [${ii},${jj}]`);
                    }
                }
            }
            //Save this panel and continue
            panels[index] = panel;
        }
    }
    //All panels have been processed
    return {"rows": numRows, "cols": numCols, "panels": objectValues(panels)};
};

//Calculate panels layout from value
// For example, if a value of 20 is provided, we calculate all divisors and calculate a score
// We will get the divisors pair with the lowest score. If there are more than one with the same score,
// we will get the one with the lowest first divisor (rows).
// 2, 10 ---> score = 12
// 4, 5  ---> score = 9  <<<< this is the best layout
// 5, 4  ---> score = 9
// 10, 2 ---> score = 12
// Result >>> rows=4, cols=5
let parseValueLayout = function (context, value) {
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

//Build panels layout
let buildPanelsLayout = function (context, props) {
    let newLayout = Object.assign({}, defaultPanelsLayout); //Initialize layout
    //Check for object ---> merge with default props
    if (isObject(props) === true) {
        //Check for matrix value
        if (isArray(props.matrix)) {
            newLayout = parseMatrixLayout(context, props.matrix);
            newLayout.length = newLayout.panels.length; //Save the number of panels
        }
        //Check for row and column values
        else if (isValid(props.rows) && isValid(props.cols)) {
            Object.assign(newLayout, {
                "rows": context.value(props.rows, 1, 1),
                "cols": context.value(props.cols, 1, 1)
            });
            newLayout.length = newLayout.rows * newLayout.cols; //Update layout length
        }
        //Check for size value --> calculate from 
        else if (isValid(props.size)) {
            Object.assign(newLayout, parseValueLayout(context, context.value(props.size, 1, 1)));
        }
        //Other option --> invalid panels config
        else {
            return context.error("No valid panels configuration provided");
        }
        //Check for spacing value (TODO)
        //if (isValid(props.spacing)) {
        //    Object.assign(newLayout, {"spacing": context.value(props.spacing, 0, 0)});
        //}
    }
    //Check for number --> calculate the number of rows and columns
    else if (typeof props === "number") {
        Object.assign(newLayout, parseValueLayout(context, props)); //Build the layout
    }
    //Check for no panels list 
    if (newLayout.panels === null || newLayout.panels.length === 0) {
        newLayout.panels = range(0, newLayout.length).map(function (index) {
            let row = Math.floor(index / newLayout.cols); //Get panel row index
            let col = index % newLayout.cols; //Get panel column index
            return {"index": index + 1, "startRow": row, "endRow": row, "startCol": col, "endCol": col};
        });
    }
    //Return the layout
    return newLayout;
};

//Get panels layout and elements
export function getPanelsLayout (context, props) {
    let layout = context.panels.value;
    let elements = context.panels.elements;
    let panels = []; //Output panels indexes
    if (typeof props === "undefined" || props === null || props == "") {
        panels = [0]; //Use only the first panel
    }
    else if (typeof props === "string" && props === "*") {
        panels = elements.map(function (el, index) {
            return index; //Generate a list with all panels indexes
        });
    }
    else {
        //let panels = context.panels;
        //Generate a list with all wanted panels indexes
        let indexes = {};
        toArray(props).forEach(function (value) {
            //Check for number --> as a single index
            if (typeof value === "number") {
                let index = clamp(value - 1, 0, layout.length - 1);
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
                    let row = (value.row < 0) ? layout.rows + value.row : value.row - 1;
                    for (let i = 0; i < layout.cols; i++) {
                        let index = i + row * layout.cols;
                        if (0 <= index && index < layout.length) {
                            indexes[index] = 1; //Save this item
                        }
                    }
                }
                //Check for only column value provided
                else {
                    let col = (value.col < 0) ? layout.cols + value.col : value.col - 1; //Get column
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
                //console.log(nthExpression);
                for (let i = 0; i < context.panels.value.length; i++) {
                    //console.log("check " + (i+1));
                    if (nthCheck(i + 1, nthExpression) === true) {
                        //console.log(`${i+1} ---> true`);
                        indexes[i] = 1; //Save this index
                    }
                }
            }
            //Ignore other value types
        });
        //Get the indexes of all panels
        panels = Object.keys(indexes);
        //return Object.keys(indexes).map(function (index) {
        //    return context.panels.elements[index];
        //});
    }
    //Execute the provided callback function with each panel and element
    return panels.map(function (index) {
        return {"panel": layout.panels[index], "element": elements[index], "index": index};
    });
}

//Create a panels node
export function createPanelsNode (context, props) {
    let node = context.addNode({
        "id": "panels",
        "type": "panels",
        //"draw": {"width": 0, "height": 0}, //Drawing area for panels
        "value": {"length": 0, "rows": 0, "cols": 0, "panels": []}, 
        "currentPanel": null, //Terrible hack to store the current panel
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
    let layout = buildPanelsLayout(context, node.props); //Build layout
    //layout.length = layout.rows * layout.cols; //Get layout total size
    //Check if we need to rebuild all panels groups
    if (node.value.rows !== layout.rows || node.value.cols !== layout.cols || node.value.length !== layout.length) {
        context.target.selectAll("g[data-type='panel']").remove(); //Remove all panels
        node.elements = []; //Reset nodes list
        layout.panels.forEach(function (panel, index) {
            //let row = Math.floor(i / layout.cols); //Get row index
            //let col = i % layout.cols; //Get column index
            let element = context.target.append("g");
            element.attr("data-type", "panel"); //Set the group type ---> panel
            element.attr("data-index", index + ""); //Get the panel index
            //element.attr("data-row", row + ""); //Set the panel row
            //element.attr("data-col", col + ""); //Set the panel col
            //Create a rectangle for displaying panel background
            let bg = element.append("rect");
            bg.attr("id", "panel-background").attr("x", "0").attr("y", "0").attr("fill", "none");
            //Save the panel group element
            node.elements.push(element);
        });
    }
    //Get the new sizes
    let margin = context.draw.margin.value;
    let outerMargin = context.draw.outerMargin.value;
    //Update the drawing sizes (this is only useful if there are only one panel)
    //node.draw.width = context.draw.width.value - outerMargin.left - outerMargin.right - margin.left - margin.right;
    //node.draw.height = context.draw.height.value - outerMargin.top - outerMargin.bottom - margin.top - margin.bottom;
    //Build the layout step width and height
    layout.stepWidth = (context.draw.width.value - outerMargin.left - outerMargin.right) / layout.cols;
    layout.stepHeight = (context.draw.height.value - outerMargin.top - outerMargin.bottom) / layout.rows;
    //Update the groups positions
    node.elements.forEach(function (element, index) {
        let panel = layout.panels[index]; //Get the panel configuration
        //let row = parseInt(element.attr("data-row")); //Get row index
        //let col = parseInt(element.attr("data-col")); //Get column index
        panel.rows = panel.endRow - panel.startRow + 1; //Get number of rows of this panel
        panel.cols = panel.endCol - panel.startCol + 1; //Get number of columns of this panel
        panel.width = (panel.cols * layout.stepWidth) - margin.left - margin.right; //Calculate panel.width
        panel.height = (panel.rows * layout.stepHeight) - margin.top - margin.bottom; //Calculate panel height
        panel.left = (panel.startCol * layout.stepWidth) + margin.left; //Calculate the left translation
        panel.top = (panel.startRow * layout.stepHeight) + margin.top; //Calculate the top translation
        element.attr("transform", `translate(${panel.left},${panel.top})`); //Translate the panel group
        //Update the panel background
        let bg = element.selectAll("#panel-background");
        bg.attr("width", panel.width).attr("height", panel.height); //Set background size
        bg.attr("fill", context.value(props.background, null, context.theme.panelBackground));
    });
    //Save the layout config
    node.value = layout;
}


