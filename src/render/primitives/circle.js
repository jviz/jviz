import {path} from "../path.js";

//Export circle shape
export function circle (args) {
    //Build the circle path
    let circlePath = path();
    circlePath.move(args.x - args.radius, args.y);
    circlePath.arc(args.radius, args.radius, 0, 1, 1, args.x + args.radius, args.y);
    circlePath.arc(args.radius, args.radius, 0, 1, 1, args.x - args.radius, args.y);
    circlePath.close();
    //Return the circle path in string format
    return circlePath.toString();
}

