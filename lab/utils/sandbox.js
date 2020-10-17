import kofi from "kofi";
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
            "schema.json": createSandboxFile("schema.json", "")
        },
        "main": "schema.json",
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
                "schema.json": createSandboxFile("schema", sandbox["schema"] + "")
            },
            "main": "schema.json",
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

//Export a sandbox
export function exportSandbox (sandbox, options) {
    return new Promise(function (resolve, reject) {
        if (options.mode === "sandbox") {
            return resolve(sandbox); //Export sandbox
        }
        //Default --> export only the schema
        let schema = JSON.parse(sandbox.schema);
        //TODO: check for adding metadata
        return resolve(schema);
    });
}

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



