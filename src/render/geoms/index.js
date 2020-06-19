//Import geoms
import {textGeom} from "./text.js";
import {lineGeom} from "./line.js";
import {rectangleGeom} from "./rectangle.js";
import {circleGeom} from "./circle.js";
import {arcGeom} from "./arc.js";
import {curveGeom} from "./curve.js";
import {areaGeom} from "./area.js";
//import {polylineGeom} from "./polyline.js";
import {pathGeom} from "./path.js";

//Geoms types
const geomsTypes = {
    "text": textGeom,
    "line": lineGeom,
    "rectangle": rectangleGeom,
    "circle": circleGeom,
    "arc": arcGeom,
    "segment": segmentGeom,
    "area": areaGeom,
    "polyline": polylineGeom,
    "path": pathGeom
};

//Get a geom object
export function getGeom (name) {
    return geomsTypes[name];
}

