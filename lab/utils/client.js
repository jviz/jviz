import kofi from "kofi";

//Fetch url
let fetchUrl = function (url, callback) {
    //Build the request options
    let options = {
        "url": url,
        "method": "get",
        "json": false
    };
    return kofi.request(options, function (error, response, body) {
        return callback(error, body);
    });
};

//Default options object
let defaultOptions = {
    "host": "http://localhost:4000/api"
};

//Export client class
export class Client {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
    }
    //Create an empty sandbox
    createSandbox() {
        return {
            "id": kofi.helpers.tempid(),
            "metadata": {
                "name": "Untitled sandbox",
                "description": ""
            },
            "editable": true,
            "source": "new_sandbox",
            "content": {},
            "thumbnail": null
        };
    }
    //Load sandbox
    loadSandbox(params, callback) {
        let self = this;
        //Check for sandbox id: import from api
        if (typeof params.id === "string") {
            let url = kofi.url.join(this.options.host, params.id);
            return fetchUrl(url, function (error, content) {
                if (error) {
                    return callback(error, null);
                }
                //Parse sandbox
                return callback(null, JSON.parse(content));
            });
        }
        //Check for url argument: import sandbox from url
        else if (typeof params.url === "string") {
            return fetchUrl(params.url, function (error, content) {
                if (error) {
                    return callback(error, null);
                }
                //Build a new sanbox from the provided url
                return callback(null, Object.assign(self.createSandbox(), {
                    "source": "url:" + params.url,
                    "content": JSON.parse(content)
                }));
            });
        }
        //Other: create an empty sandbox
        else {
            return callback(null, this.createSandbox());
        }
    }
    //Save a sandbox
    saveSandbox(sandbox, callback) {
        let options = {
            "url": kofi.url.join(this.options.host, sandbox.id),
            "method": "post",
            "json": true,
            "body": sandbox
        };
        return kofi.request(options, function (error, response, body) {
            return callback(error, body);
        });
    }
}

