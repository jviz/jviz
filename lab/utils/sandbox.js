import kofi from "kofi";
import {createDatabase} from "./database.js";

//Sandbox database
let sandboxDB = createDatabase("jviz-sandbox");

//Initialize sandbox database
export function initSandboxStorage () {
    return sandboxDB.open(1, function (db) {
        db.createObjectStore("sandbox", {"keyPath": "id"});
    });
}

//Create a new sandbox
export function createSandbox (initSandbox) {
    let newSandbox = {
        "$type": "jviz/sandbox",
        "id": kofi.tempid(),
        "name": "Untitled",
        "description": "",
        "author": "",
        "readme": "",
        "schema": "",
        "schemaType": "json",
        "thumbnail": null,
        "created_at": Date.now(),
        "updated_at": null,
        "readonly": false
    };
    //Return sandbox merged with initial values
    return Object.assign(newSandbox, initSandbox);
}

//Parse a sandbox ---> get schema in json format
export function parseSandbox (sandbox) {
    return new Promise(function (resolve, reject) {
        return resolve(JSON.parse(sandbox.schema));
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
        return sandbox;
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
        return request.result;
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



