import {createNode} from "./util/nodes.js";
import {exportScene} from "./scene.js";
import {isNumber} from "../util.js";

//Export types
let imageTypes = {
    "svg": "image/svg+xml",
    "png": "image/png",
    "jpeg": "image/jpeg"
};

//Blob to dataurl converter
let blobToDataUrl = function (blob) {
    return new Promise(function (resolve, reject) {
        let filereader = new FileReader();
        filereader.addEventListener("load", function (event) {
            return resolve(event.target.result);
        });
        return filereader.readAsDataURL(blob);
    });
};

//Parse size
let parseSize = function (size, factor) {
    return parseInt(size.replace("px", "")) * factor;
};

//Export the current scene as a SVG image
export function exportSVG (context, options) {
    return Promise.resolve(exportScene(context));
}

//Export current scene as a blob
export function exportBlob (context, options) {
    return new Promise(function (resolve, reject) {
        if (typeof options.type !== "string" || typeof imageTypes[options.type] === "undefined") {
            return reject(new Error("Unknown blob type provided")); //Unknown blob type
        }
        //Generate the svg blob
        let svgContent = exportScene(context); //Get svg content
        let svgBlob = new Blob([svgContent], {
            "type":`${imageTypes.svg};charset=utf-8`
        });
        //Check for svg blob --> return the blob
        if (options.type === "svg") {
            return resolve(svgBlob); //Return as svg blob
        }
        //Generate a new image to load the blob
        let canvas = createNode("canvas", null); //Canvas to convert the image
        let url = window.URL.createObjectURL(svgBlob);
        let image = createNode("img", null); //Image to load the svg blob
        let saveBlob = function (imageBlob) {
            window.URL.revokeObjectURL(url); //No longer need to read the blob so it's revoked
            return resolve(imageBlob); //Resolve with the image blob
        };
        //Register the image on load event
        image.addEventListener("load", function () {
            let factor = isNumber(options.scaleFactor) ? options.scaleFactor : 1;
            let width = parseSize(context.scene.element.attr("width"), factor); //Get parsed width
            let height = parseSize(context.scene.element.attr("height"), factor); //Get parsed height
            //Initialize canvas size
            canvas.width = width + "";
            canvas.height = height + "";
            let ctx = canvas.getContext("2d"); //Get canvas context
            ctx.drawImage(image, 0, 0, width, height); //Render the image in the canvas
            //Conver the canvas to blob image
            return canvas.toBlob(saveBlob, imageTypes[options.type]);
        });
        //Set the image source
        image.src = url;
    });
}

//Export as image URL
export function exportImageUrl (context, options) {
    return exportBlob(context, options).then(function (blob) {
        return blobToDataUrl(blob);
    });
}

