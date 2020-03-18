//Import javascript dependencies
let path = require("path");
let fs = require("fs");
let cleanup = require("rollup-plugin-cleanup");
//let resolve = require("rollup-plugin-node-resolve");
//let includePaths = require("rollup-plugin-includepaths");
let terser = require("rollup-plugin-terser").terser;

//Exported formats
let outputFormats = ["cjs", "umd", "esm"];

//Function to build the configuration object based on the env variables
let buildConfig = function (ext) {
    //Build the destination file ext
    //let output = (minified === true) ? "viz.min.js" : "viz.js";
    //Initialize the configuration object
    return {
        //"input": path.join("./packages", "jviz-core", "index.js"),
        "input": "src/index.js",
        "output": outputFormats.map(function (format) {
            return {
                //"file": path.join("./packages", "jviz-core", "dist", `jviz.${format}.${ext}`),
                "file": path.join("dist", `jviz.${format}.${ext}`),
                "format": format,
                "name": "jviz",
                "extend": true
            };
        }),
        "external": [],
        "plugins": [
            cleanup(),
            terser({
                "include": [/^.+\.min\.js$/]
            })
        ]
    };
    //Check if the output should be minified
    //if (minified === true) {
    //    config.plugins.push(terser());
    //}
    //Return the built configuration
    //return config;
};

//Build the configuration object
//module.exports = Object.values({
//    "default": buildConfig(process.env, false),
//    "minified": buildConfig(process.env, true)
//});
module.exports = [
    buildConfig("js"), 
    buildConfig("min.js")
];

