class SVGPath {
    constructor(currentPath) {
        //if (typeof options !== "object" || options === null) {
        //    options = {};
        //}
        //Save the full path
        this.fullPath = (typeof currentPath === "string") ? currentPath : "";
        this.reversedPath = false; //(typeof options.reversed === "boolean") ? options.reversed : false;
    }
    //Reverse the path
    reverse() {
        this.reversedPath = !this.reversedPath;
    }
    // Append a new path command to the current path
    append(cmd) {
        this.fullPath = this.reversedPath ? cmd + this.fullPath : this.fullPath + cmd;
        return this;
    }
    // Move the current point to the coordinate x,y
    move(x, y) {
        return this.append(`M${x},${y}`);
    }
    // Draw a line from the current point to the end point specified by x,y
    line(x, y) {
        return this.append(`L${x},${y}`);
    }
    // Draw a horizontal line from the current point to the end point
    hLine(x) {
        return this.append(`H${x}`);
    }
    // Draw a vertical line from the current point to the end point
    vLine(y) {
        return this.append(`V${y}`);
    }
    // Draw an arc from the current point to the specified point
    // rx and ry are the two radius of the ellipse
    // angle represents a rotation (in degree) of the ellipse relative to the x-axis
    // laf (large-arc-flag) allows to chose one of the large arc (1) or small arc (0)
    // sf (sweep-flag) allows to chose one of the clockwise turning arc (1) or anticlockwise turning arc (0)
    // x and y become the new current point for the next command
    // Documentation: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Elliptical_Arc_Curve 
    arc(rx, ry, angle, laf, sf, x, y) {
        return this.append(`A${rx},${ry},${angle},${laf},${sf},${x},${y}`);
    }
    // Draw a quadratic Bézier curve from the current point to the end point specified by x,y
    // The control point is specified by x1,y1 
    // Documentation: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Quadratic_B%C3%A9zier_Curve 
    quadraticCurve(x1, y1, x, y) {
        return this.append(`Q${x1},${y1},${x},${y}`);
    }
    // Draw a cubic Bézier curve from the current point to the end point specified by x,y
    // The start control point is specified by x1,y1
    // The end control point is specified by x2,y2
    // Documentation: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Cubic_B%C3%A9zier_Curve
    bezierCurve(x1, y1, x2, y2, x, y) {
        return this.append(`C${x1},${y1},${x2},${y2},${x},${y}`);
    }
    //Close the current path
    close() {
        return this.append("Z");
    }
    //Clear the full path
    clear() {
        this.fullPath = "";
        return this;
    }
    //Get the full path
    getPath() {
        return this.fullPath;
    }
    //Get path alias
    toString() {
        return this.fullPath;
    }
}

//Path generator
export function path (currentPath) {
    return new SVGPath(currentPath);
}

