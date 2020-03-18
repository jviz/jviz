let fs = require("fs");
let path = require("path");

process.nextTick(function () {
    let inputFile = path.join(process.cwd(), "package.json");
    let outputFile = path.join(process.cwd(), "dist", "package.json");
    //Read the input file
    let input = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    let output = {
        "name": input.name,
        "description": input.description,
        "version": input.version,
        "repository": input.repository,
        "bugs": input.bugs,
        "main": input.main,
        "module": input.module,
        "browser": input.browser,
        "unpkg": input.unpkg,
        "keywords": input.keywords,
        "dependencies": {},
        "license": input.license
    };
    //Write the new package.json file
    fs.writeFileSync(outputFile, JSON.stringify(output, null, "    "), "utf8");
});

