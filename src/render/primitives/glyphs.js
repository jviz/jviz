import {path} from "../path.js";

//Alpha values
let circleAlpha = 5 / 4;
let diamondAlpha = 4 / 3;

//Circle glyph
let circleGlyph = function (args) {
    let p = path();
    let radius = Math.sqrt(args.size) * circleAlpha; //Get circle radius
    //"m-10,0a10,10 0 1,0 20,0a 10,10 0 1,0 -20,0
    p.move(-radius, 0);
    p.arc(radius, radius, 0, 1, 0, 2*radius, 0);
    p.arc(radius, radius, 0, 1, 0, -2*radius, 0);
    //Return the circle path
    return p;
};

//Square glyph
let squareGlyph = function (args) {
    let p = path();
    let size = 2 * Math.sqrt(args.size);
    p.move(-size / 2, -size / 2);
    p.hLine(size);
    p.vLine(size);
    p.hLine(-size);
    p.close(); //Close the square path
    return p; //Return the square path
};

//Diamond glyph
//Example: m-7,0l7,-10l7,10l-7,10z
let diamondGlyph = function (args) {
    let p = path();
    let size = args.size / 2;
    let radius = parseInt(size * 0.9);
    p.move(-radius, 0);
    p.line(radius, -size);
    p.line(radius, size);
    p.line(-radius, size);
    p.close(); //Close the diamond path
    return p; //Return the diamond path
};

//Triangle glyph
let triangleGlyph = function (args) {
    let p = path();
    let size = args.size / 2;
    let x = size * Math.sqrt(3) / 2;
    let y = size / 2;
    p.move(0, -size);
    p.line(-x, 3*size/2);
    p.line(2*x, 0);
    p.close();
    return p; //Return the triangle path
};

//Cross glyph
//Example: m10,3.33h-6.66v6.66h-6.66v-6.66h-6.66v-6.66h6.66v-6.66h6.66v6.66h6.66z
let crossGlyph = function (args) {
    let s = 2 * Math.sqrt(args.size) * diamondAlpha;
    let x = s / 3;
    return path(`m${s/2},${x/2}h-${x}v${x}h-${x}v-${x}h-${x}v-${x}h${x}v-${x}h${x}v${x}h${x}z`);
};

//Export glyphs constructors
export const glyphs = {
    "circle": circleGlyph,
    "square": squareGlyph,
    "diamond": diamondGlyph,
    "triangle": triangleGlyph,
    "cross": crossGlyph
};

//Generate a glyph
export function getGlyph (type, args) {
    if (typeof glyphs[type] === "undefined") {
        return type; //Provided path instead of glyph name
    }
    //Generate the glyph
    return glyphs[type](args).toString().toLowerCase();
}

