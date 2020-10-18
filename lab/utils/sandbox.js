import kofi from "kofi";
//import jviz from "jviz";
import lzString from "lz-string";
import {createDatabase} from "./database.js";

//Sandbox database
let sandboxDB = createDatabase("jviz-sandbox");

//Initialize sandbox database
export function initSandboxStorage () {
    return sandboxDB.open(1, function (db) {
        db.createObjectStore("sandbox", {"keyPath": "id"});
    });
}

//Export available sandbox files
export const sandboxFileTypes = {
    "schema": {"name": "Jviz schema", "icon": "code"},
    "json": {"name": "JSON", "icon": "file"}
};

//Encode sandbox file
export function encodeSandboxFile (content) {
    return lzString.compressToBase64(content);
}

//Decode sandbox file
export function decodeSandboxFile (content) {
    return lzString.decompressFromBase64(content);
}

//Create a new sandbox file
export function createSandboxFile (type, content) {
    return {"type": type, "content": encodeSandboxFile(content)};
}

//Create a new sandbox
export function createSandbox (initSandbox) {
    let newSandbox = {
        "version": "2",
        "id": kofi.tempid(),
        "name": "Untitled",
        "description": "",
        "author": "",
        "files": {
            "schema.jviz": createSandboxFile("schema", "")
        },
        "main": "schema.jviz",
        "runConfig": null,
        "thumbnail": null,
        "created_at": Date.now(),
        "updated_at": Date.now()
    };
    //Return sandbox merged with initial values
    return Object.assign(newSandbox, initSandbox);
}

//Validate a sandbox --> validate fields and convert to the latest version
export function validateSandbox (sandbox) {
    //If there is no sandbox version --> add the "v1" version
    if (typeof sandbox["version"] === "undefined") {
        sandbox["version"] = "1";
    }
    //Check for upgrading to v2 schema
    if (sandbox["version"] === "1") {
        //Update sandbox to v2
        Object.assign(sandbox, {
            "version": "2",
            "files": {
                "schema.jviz": createSandboxFile("schema", sandbox["schema"] + "")
            },
            "main": "schema.jviz",
            "runConfig": null
        });
        //Remove some fields
        delete sandbox["schema"];
        delete sandbox["schemaType"];
        delete sandbox["readme"];
        delete sandbox["readonly"];
    }
    //Return validated sandbox
    return sandbox;
}

//Parse a sandbox ---> get schema in json format
export function parseSandbox (sandbox, currentFile) {
    return new Promise(function (resolve, reject) {
        return resolve(JSON.parse(decodeSandboxFile(sandbox.files[currentFile].content)));
    });
}

//Export a sandbox file --> get the content of the file
export function exportSandboxFile (sandbox, file) {
    return Promise.resolve(decodeSandboxFile(sandbox.files[file].content));
}

//Export a sandbox schema --> export as json with the data injected
export function exportSandboxSchema (sandbox, file) {
    return new Promise(function (resolve, reject) {
        //TODO: check if this file is a schema
        let schema = JSON.parse(decodeSandboxFile(sandbox.files[file].content));
        //Iterate in data field --> find imports of other sandbox files
        if (typeof schema.data === "object" && Array.isArray(schema.data)) {
            for (let i = 0; i < schema.data.length; i++) {
                //Check if data is not using a sandbox file
                if (typeof schema.data[i].url !== "string" || !schema.data[i].url.startsWith("sandbox://")) {
                    continue; //Nothing to import here
                }
                //Get the file to import
                let dataFile = schema.data[i].url.replace("sandbox://", "");
                if (typeof sandbox.files[dataFile] === "undefined") {
                    return reject(new Error(`Error in '${file}': sandbox file '${dataFile}' not found`));
                }
                //else if (sandbox.files[dataFile].type !== "data") {
                //    return reject(new Error(`Error in '${file}': loading a non-data file '${dataFile}'.`));
                //}
                //Get data content
                let data = JSON.parse(decodeSandboxFile(sandbox.files[dataFile].content));
                if (typeof schema.data[i].format === "object" && typeof schema.data[i].format.field === "string") {
                    data = jviz.util.nest(data, schema.data[i].format.field);
                }
                //Replace in data object
                schema.data[i].value = data;
                delete schema.data[i].url; //Remove old url field
                delete schema.data[i].format; //Remove format field
            }
        }
        //Done --> return schema in json with the data injected
        return resolve(schema);
    });
}

//Get a list of schema files to run
let getSchemaFilesForRunning = function (sandbox, currentFile) {
    //Check for custom run configuration
    if (Array.isArray(sandbox.runConfig) && sandbox.runConfig !== null) {
        return sandbox.runConfig;
    }
    //Default --> return only the current file
    return [currentFile];
};

//Run sandbox
export function runSandbox (sandbox, currentFile, callback) {
    return new Promise(function (resolve, reject) {
        //Get the list of schema files to execute
        let files = getSchemaFilesForRunning(sandbox, currentFile);
        if (files.length === 0) {
            return reject(new Error("No schema files to run"));
        }
        //Method to execute each file
        let runSandboxSchema = function (index) {
            if (index >= files.length) {
                return resolve(null); //Run finished
            }
            //Export this file
            exportSandboxSchema(sandbox, files[index]).then(function (schema) {
                return callback(files[index], schema, index);
            }).then(function () {
                return runSandboxSchema(index + 1);
            }).catch(function (error) {
                return reject(error);
            });
        };
        //Start parsing all schemas
        return runSandboxSchema(0);
    });
};

//Load user sandboxes
export function loadLocalSandboxes () {
    let request = null;
    return sandboxDB.tx(["sandbox"], "readonly", function (tx) {
        request = tx.objectStore("sandbox").getAll();
        //return store.getAll().addEventListener("success", function (event) {
        //    list = event.target.result; //Save sandbox list
        //});
    }).then(function () {
        return request.result.map(function (item) {
            return Object.assign({
                "id": item.id, 
                "name": item.name, 
                "description": item.description,
                "remote": false, 
                "thumbnail": item.thumbnail,
                "updated_at": item["updated_at"]
            });
        });
    }).then(function (list) {
        return list.sort(function (a, b) {
            return b["updated_at"] - a["updated_at"];
        });
    });
}

//Load remote sandboxes
export function loadRemoteSandboxes (source) {
    return kofi.request({"url": source, "json": true}).then(function (response) {
        if (Array.isArray(response.body) === false || response.body === null) {
            return []; //Return an empty array
        }
        return response.body.map(function (item) {
            return Object.assign(item, {"remote": true});
        });
    });
}

//Get a remote sandbox
export function getRemoteSandbox (source) {
    return kofi.request({"url": source, "json": true}).then(function (response) {
        let sandbox = response.body; //Get sandbox content
        delete sandbox["id"]; //Remove sandbox ID
        return validateSandbox(sandbox);
    });
}

//Save a new sandbox
export function saveLocalSandbox (data) {
    let newSandbox = Object.assign(data, {
        "updated_at": Date.now()
    });
    //Write the new sandbox data
    return sandboxDB.tx(["sandbox"], "readwrite", function (tx) {
        tx.objectStore("sandbox").add(newSandbox);
    }).then(function () {
        return newSandbox; //Return new sandbox data
    });
}

//Get a single sandbox by id
export function getLocalSandbox (id) {
    //return new Promise(function (resolve, reject) {
    //    sandboxDB.tx(["sandbox"], "readonly", function (tx) {
    //        let request = tx.objectStore("sandbox").get(id);
    //        request.addEventListener("success", function (event) {
    //            return resolve(event.target.result);
    //        });
    //        request.addEventListener("error", function (event) {
    //            return reject(event);
    //        });
    //    });
    //});
    let request = null;
    return sandboxDB.tx(["sandbox"], "readonly", function (tx) {
        request = tx.objectStore("sandbox").get(id);
    }).then(function () {
        return validateSandbox(request.result);
    });
}

//Update a sandbox
export function updateLocalSandbox (data) {
    let newSandbox = Object.assign(data, {
        "updated_at": Date.now()
    });
    //Update the sandbox
    return sandboxDB.tx(["sandbox"], "readwrite", function (tx) {
        tx.objectStore("sandbox").put(newSandbox);
    }).then(function () {
        return newSandbox; //Return the sandbox
    });
}

//Delete a single sandbox
export function deleteLocalSandbox (id) {
    return sandboxDB.tx(["sandbox"], "readwrite", function (tx) {
        return tx.objectStore("sandbox").delete(id);
    });
}



