let express = require("express");
let morgan = require("morgan");
let fs = require("fs");
let path = require("path");

//Global configuration
let server = {
    "port": 4000
};

process.nextTick(function () {
    let app = express();
    //Enable logging
    //http://expressjs.com/en/resources/middleware/morgan.html
    app.use(morgan("dev"));
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
    app.listen(server.port, function () {
        console.log(`[DEBUG] jviz-lab service listening on port '${server.port}'`);
    });
});

