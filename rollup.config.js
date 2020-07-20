//Import javascript dependencies
let path = require("path");
let fs = require("fs");
let cleanup = require("rollup-plugin-cleanup");
//let resolve = require("rollup-plugin-node-resolve");
//let includePaths = require("rollup-plugin-includepaths");
let terser = require("rollup-plugin-terser").terser;

//Exported formats
let outputFormats = ["cjs", "cjs.min", "umd", "umd.min", "esm", "esm.min"];

//Function to build the configuration object based on the env variables
let buildConfig = function () {
    //Build the destination file ext
    //let output = (minified === true) ? "viz.min.js" : "viz.js";
    //Initialize the configuration object
    return {
        //"input": path.join("./packages", "jviz-core", "index.js"),
        "input": "src/index.js",
        "output": outputFormats.map(function (key) {
            let output = {
                //"file": path.join("./packages", "jviz-core", "dist", `jviz.${format}.${ext}`),
                "file": path.join("dist", `jviz.${key}.js`),
                "format": key.replace(".min", "")
            };
            //Check for und export --> add library name and extend
            if (key.startsWith("umd")) {
                Object.assign(output, {"name": "jviz", "extend": true});
            }
            //Check for min distribution --> add terser plugin
            if (key.endsWith(".min")) {
                output["plugins"] = [terser()];
            }
            //Return the output file format
            return output;
        }),
        "external": [],
        "plugins": [
            cleanup()
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
module.exports = buildConfig();

