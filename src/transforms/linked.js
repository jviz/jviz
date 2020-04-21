//Linked transform default props
let defaultProps = {
    "sx": "sx",
    "sy": "sy",
    "tx": "tx",
    "ty": "ty",
    "spahe": "line", // line | arc | curveX | curveY
    "as": "path"
};

//Shapes
let linkShapes = {
    //Line path: draw a simple line from source to target
    "line": function (sx, sy, tx, ty) {
        return `M${sx},${sy}L${tx},${ty}`;
    },
    "arc": function (sx, sy, tx, ty) {
        let deltax = tx - sx;
        let deltay = ty - sy;
        let r = Math.sqrt(deltax * deltax + deltay * deltay) / 2; //Radius
        let a = 180 * Math.atan2(deltay, deltax) / Math.PI; //Angle
        //Return the arc path
        return `M${sx},${sy}A${r},${r} ${a} 0 1 ${tx},${ty}`;
    },
    //Bezier curve horizontal
    "curveX": function (sx, sy, tx, ty) {
        let cx = (sx + tx) / 2; //Calculate center point
        return `M${sx},${sy}C${cx},${sy} ${cx},${ty} ${tx},${ty}`;
    },
    //Bezier curve vertical
    "curveY": function (sx, sy, tx, ty) {
        let cy = (sy + ty) / 2; //Calculate center point
        return `M${sx},${sy}C${sx},${cy} ${tx},${cy} ${tx},${ty}`;
    }
};

//Linked transform
export const linkedTransform = {
    "transform": function (context, data, props) {
        let as = (typeof props.as === "string") ? props.as : defaultProps.as;
        let shapeName = (typeof props.shape === "string") ? props.shape : defaultProps.shape;
        let shape = linkShapes[shapeName]; //Get shape generator
        return data.map(function (datum) {
            //Update datum
            return Object.assign(datum, {
                [as]: shape(datum[props.sx], datum[props.sy], datum[props.tx], datum[props.ty])
            });
        });
    },
    "props": defaultProps
};
