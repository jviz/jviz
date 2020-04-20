//Import shapes
import {textShape} from "./text.js";
import {lineShape} from "./line.js";
import {rectangleShape} from "./rectangle.js";
import {circleShape} from "./circle.js";
import {arcShape} from "./arc.js";
import {segmentShape} from "./segment.js";
import {areaShape} from "./area.js";
import {polylineShape} from "./polyline.js";
import {pathShape} from "./path.js";

//Shape types
const shapeTypes = {
    "text": textShape,
    "line": lineShape,
    "rectangle": rectangleShape,
    "circle": circleShape,
    "arc": arcShape,
    "segment": segmentShape,
    "area": areaShape,
    "polyline": polylineShape,
    "path": pathShape
};

//Get a shape object
export function getShape (name) {
    return shapeTypes[name];
}

