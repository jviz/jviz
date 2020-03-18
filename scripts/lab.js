let express = require("express");
let fs = require("fs");
let path = require("path");

process.nextTick(function () {
    let app = express();
    //Mout examples folder
    app.use("/examples", express.static(path.join(process.cwd(), "examples")));
    app.use("/data", express.static(path.join(process.cwd(), "examples", "data")));
    //Mount app files
    app.use("/", express.static(path.join(process.cwd(), "www")));
    //Index file
    app.get("/", function (req, res) {
        let indexFile = path.join(process.cwd(), "www", "index.html");
        return fs.readFile(indexFile, "utf8", function (error, content) {
            //TODO: check for error loading the file
            return res.type("html").send(content);
        });
    });
    //Run webservice
    app.listen(4000);
});

