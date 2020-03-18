import {linearCurve} from "./linear.js";
import {stepCurve, stepAfterCurve, stepBeforeCurve} from "./step.js";
import {catmullRomCurve} from "./catmull-rom.js";

//Curves types
export const curveTypes = {
    "linear": linearCurve,
    "step": stepCurve,
    "step-after": stepAfterCurve,
    "step-before": stepBeforeCurve,
    "catmull-rom": catmullRomCurve
};

//Export curve generator
export function getCurve (name) {
    //Check for curve not found
    if (typeof curveTypes[name] === "undefined") {
        return curveTypes["linear"]; // -->default: return the linear curve
    }
    return curveTypes[name];
}

