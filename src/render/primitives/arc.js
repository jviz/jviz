import {path} from "../path.js";
import {polarToCartesian} from "../../math.js";

//Build an arc shape
export function arc (args) {
    //Calculate the four points of the arc in cartesian coordinates
    let innerStart = polarToCartesian(args.innerRadius, args.startAngle - Math.PI / 2, args.centerX, args.centerY);
    let innerEnd = polarToCartesian(args.innerRadius, args.endAngle - Math.PI / 2, args.centerX, args.centerY);
    let outerStart = polarToCartesian(args.outerRadius, args.startAngle - Math.PI / 2, args.centerX, args.centerY);
    let outerEnd = polarToCartesian(args.outerRadius, args.endAngle - Math.PI / 2, args.centerX, args.centerY);
    //Calculate the arc flag value
    let arcFlag = args.endAngle - args.startAngle <= Math.PI ? "0" : "1";
    //Build the path
    let arcPath = path();
    arcPath.move(innerStart.x, innerStart.y);
    arcPath.arc(args.innerRadius, args.innerRadius, 0, arcFlag, 1, innerEnd.x, innerEnd.y);
    arcPath.line(outerEnd.x, outerEnd.y);
    arcPath.arc(args.outerRadius, args.outerRadius, 0, arcFlag, 0, outerStart.x, outerStart.y);
    arcPath.close();
    //Return the string path
    return arcPath.getPath();
};


