import {path} from "../path.js";
import {polyline} from "./polyline.js";

//Draw a rectangle
export function rectangle (args) {
    //Check for no rounded rectangle
    if (typeof args.radius !== "number" || args.width < 2 * args.radius || args.height < 2 * args.radius) {
        return polyline({
            "points": [
                [args.x, args.y],
                [args.x + args.width, args.y],
                [args.x + args.width, args.y + args.height],
                [args.x, args.y + args.height]
            ],
            "closed": true
        });
    }
    //Initialize the rectangle path
    let rect = path();
    rect.move(args.x + args.radius, args.y);
    rect.hLine(args.x + args.width - args.radius);
    rect.arc(args.radius, args.radius, 0, 0, 1, args.x + args.width, args.y + args.radius);
    rect.vLine(args.y + args.height - args.radius);
    rect.arc(args.radius, args.radius, 0, 0, 1, args.x + args.width - args.radius, args.y + args.height);
    rect.hLine(args.x + args.radius);
    rect.arc(args.radius, args.radius, 0, 0, 1, args.x, args.y + args.height - args.radius);
    rect.vLine(args.y + args.radius);
    rect.arc(args.radius, args.radius, 0, 0, 1, args.x + args.radius, args.y);
    //Check for mask rectangle
    if (args.mask === true) {
        rect.line(args.x, args.y);
        rect.line(args.x, args.y + args.height);
        rect.line(args.x + args.width, args.y + args.height);
        rect.line(args.x + args.width, args.y);
    }
    //Close the rectangle path
    rect.close();
    //Return the rectangle path
    return rect.toString();
}


