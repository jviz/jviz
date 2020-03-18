import {path} from "../path.js";

//Draw a polyline
export function polyline (args) {
    if (args.points.length === 0) {
        return "";
    }
    //Build the polyline path
    let polylinePath = path();
    //Move to the first point of the polyline
    polylinePath.move(args.points[0][0], args.points[0][1]);
    //Add the other points of the polyline
    for (let i = 1; i < args.points.length; i++) {
        polylinePath.line(args.points[i][0], args.points[i][1]);
    }
    //Check for closing the path
    if (args.closed === true) {
        polylinePath.close();
    }
    //Return the path
    return polylinePath.toString();
}

