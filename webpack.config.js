//Import dependencies
let path = require("path");

//Import webpack plugins
let MiniCssExtract = require("mini-css-extract-plugin");

let modulesPath = path.join(process.cwd(), "node_modules");
let sourcesPath = path.join(process.cwd(), "lab");

//Common loaders configuration
let loaders = {
    // Extract CSS styles to a separaate .css file
    "cssExtract": {
        "loader": MiniCssExtract.loader,
        "options": {
            "publicPath": "./"
        }
    },
    // sass loader
    "sass": {
        "loader": "sass-loader",
        "options": {
            "sassOptions": {
                "includePaths": [modulesPath],
            },
            "implementation": require("sass")
        }
    },
    // Common CSS loader for parsing .css and compiled .scss files
    "css": {
        "loader": "css-loader"
    }
};

//Export the webpack configuration
module.exports = function (env) {
    //Export webpack configuration
    return {
        "entry": path.join(sourcesPath, "index.js"),
        "mode": "development",
        "target": "web",
        "output": {
            "path": path.join(process.cwd(), "www"),
            "filename": "app.js"
        },
        "resolve": {
            "modules": [
                modulesPath
            ],
        },
        "module": {
            "rules": Object.values({
                //Local scss files: use CSS modules
                "localScssLoader": {
                    "test": /\.scss$/,
                    "include": sourcesPath, 
                    "use": Object.values({
                        "cssExtractLoader": loaders.cssExtract,
                        "cssLoader": {
                            "loader": "css-loader",
                            "options": {
                                "modules": {
                                    "mode": "local",
                                    "localIdentName": "lab__[hash:base64:8]"
                                }
                            }
                        },
                        "sassLoader": loaders.sass
                    })
                },
                //Other scss files
                "scssLoader": {
                    "test": /\.scss$/,
                    "exclude": sourcesPath,
                    "use": Object.values({
                        "cssExtractLoader": loaders.cssExtract,
                        "cssLoader": loaders.css,
                        "sassLoader": loaders.sass
                    })
                },
                "cssLoader": {
                    "test": /\.css$/,
                    "use": Object.values({
                        "cssExtractLoader": loaders.cssExtract,
                        "cssLoader": loaders.css
                    })
                },
                "imageLoader": {
                    "test": /\.(png|jpg|gif|svg)$/,
                    "use": {
                        "loader": "file-loader",
                        "options": {
                            "name": "[hash].[ext]",
                            "outputPath": "img/"
                        }
                    }
                },
                "fontLoader": {
                    "test": /\.(ttf|woff|woff2)$/,
                    "use": {
                        "loader": "file-loader",
                        "options": {
                            "name": "[hash].[ext]",
                            "outputPath": "font/"
                        }
                    }
                },
                "jsxLoader": {
                    "test": /\.js$/,
                    "include": [
                        sourcesPath
                    ],
                    "loader": "babel-loader"
                }
            })
        },
        "plugins": [
            new MiniCssExtract({
                "filename": "app.css"
            })
        ]
    };
};

