//import {propTypes} from "../props.js";
import {color as colorScale} from "./color.js";
import {discrete as discreteScale} from "./discrete.js";
import {point as pointScale} from "./discrete.js";
import {interval as intervalScale} from "./discrete.js";
import {linear as linearScale} from "./linear.js";

//Export constants
export const CONTINUOUS_SCALE = 0;
export const DISCRETE_SCALE = 1;

//Build scale types
export const scaleTypes = {
    "linear": {
        "category": CONTINUOUS_SCALE,
        "scale": linearScale,
        "props": linearScale.defaultProps
    },
    "color": {
        "category": CONTINUOUS_SCALE,
        "scale": colorScale,
        "props": {}
    },
    "interval": {
        "category": DISCRETE_SCALE,
        "scale": intervalScale,
        "props": {
            "margin": 0,
            "spacing": 0,
        }
    },
    "point": {
        "category": DISCRETE_SCALE,
        "scale": pointScale,
        "props": {
            "margin": 0
        }
    },
    "discrete": {
        "category": DISCRETE_SCALE,
        "scale": discreteScale,
        "props": {}
    }
};

//Get a scale
export function getScale (name) {
    return scaleTypes[name];
}

//Check if the provided scale is a discrete scale
export function isDiscreteScale (scale) {
    return getScale(scale.type).category === DISCRETE_SCALE;
}

//Check if the provided scale is a continuous scale
export function isContinuousScale (scale) {
    return getScale(scale.type).category === CONTINUOUS_SCALE;
}

