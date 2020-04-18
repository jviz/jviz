import {path} from "../path.js";
import {polarToCartesian} from "../../math.js";
import {pi, tau, epsilon} from "../../math.js";

//Build an arc shape
export function arc (args) {
    let angle = Math.abs(args.endAngle - args.startAngle);
    //Calculate the four points of the arc in cartesian coordinates
    let innerStart = polarToCartesian(args.innerRadius, args.startAngle - Math.PI / 2, args.centerX, args.centerY);
    let innerEnd = polarToCartesian(args.innerRadius, args.endAngle - Math.PI / 2, args.centerX, args.centerY);
    let outerStart = polarToCartesian(args.outerRadius, args.startAngle - Math.PI / 2, args.centerX, args.centerY);
    let outerEnd = polarToCartesian(args.outerRadius, args.endAngle - Math.PI / 2, args.centerX, args.centerY);
    //Calculate the arc flag value
    let arcFlag = args.endAngle - args.startAngle <= pi ? "0" : "1";
    //Build the path
    let arcPath = path();
    //arcPath.move(innerStart.x, innerStart.y);
    //arcPath.arc(args.innerRadius, args.innerRadius, 0, arcFlag, 1, innerEnd.x, innerEnd.y);
    //arcPath.line(outerEnd.x, outerEnd.y);
    //arcPath.arc(args.outerRadius, args.outerRadius, 0, arcFlag, 0, outerStart.x, outerStart.y);
    arcPath.move(outerStart.x, outerStart.y);
    if (angle >= tau - epsilon) {
        let centerAngle = ((args.endAngle + args.startAngle) / 2) - pi / 2;
        let outerCenter = polarToCartesian(args.outerRadius, centerAngle, args.centerX, args.centerY);
        arcPath.arc(args.outerRadius, args.outerRadius, 0, arcFlag, 1, outerCenter.x, outerCenter.y);
        arcPath.arc(args.outerRadius, args.outerRadius, 0, arcFlag, 1, outerEnd.x, outerEnd.y);
        if (args.innerRadius > epsilon) {
            let innerCenter = polarToCartesian(args.innerRadius, centerAngle, args.centerX, args.centerY);
            arcPath.move(innerEnd.x, innerEnd.y);
            arcPath.arc(args.innerRadius, args.innerRadius, 0, arcFlag, 0, innerCenter.x, innerCenter.y);
            arcPath.arc(args.innerRadius, args.innerRadius, 0, arcFlag, 0, innerStart.x, innerStart.y);
        }
    }
    //If not, draw the arc
    else {
        arcPath.arc(args.outerRadius, args.outerRadius, 0, arcFlag, 1, outerEnd.x, outerEnd.y);
        arcPath.line(innerEnd.x, innerEnd.y);
        arcPath.arc(args.innerRadius, args.innerRadius, 0, arcFlag, 0, innerStart.x, innerStart.y);
    }
    arcPath.close();
    //Return the string path
    return arcPath.getPath();
};


