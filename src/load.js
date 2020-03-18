//Default request options
let getDefaultRequestOptions = function () {
    return {
        "url": null,
        "headers": null
    };
};
//Parse a list of headers
let parseHeaders = function (headersStr) {
    let headers = {};
    headersStr.split("\n").forEach(function (line) {
        let items = line.trim().split(": ");
        if (items.length === 2) {
            headers[items[0].toLowerCase().trim()] = items[1].trim();
        }
    });
    return headers;
};

//Import data from the provided url
export function load (options, callback) {
    let xhttp = new XMLHttpRequest();
    let requestOptions = getDefaultRequestOptions();
    //Check for only url string provided
    if (typeof options === "string") {
        requestOptions.url = options;
    }
    else if (typeof options === "object" && options !== null) {
        Object.assign(requestOptions, options);
    }
    //Check for no request url provided
    if (requestOptions.url === null) {
        throw new Error("No url provided");
    }
    //Register the ready state change listener
    xhttp.onreadystatechange = function () {
        if (this.readyState !== 4) {
            return null;
        }
        //Call the callback function with the parsed response object
        return callback({
            "ok": this.status < 300,
            "code": this.status,
            "content": this.responseText,
            "headers": parseHeaders(this.getAllResponseHeaders()),
            "raw": this
        });
    };
    //Open the connection
    xhttp.open("GET", requestOptions.url, true);
    //Add the headers to the connection
    if (requestOptions.headers !== null) {
        Object.keys(requestOptions.headers).forEach(function () {
            xhttp.setRequestHeader(key.toLowerCase(), requestOptions.headers[key]);
        });
    }
    //Perform the request
    xhttp.send(null);
    //Return the XMLHttpRequest instance
    return xhttp;
}

//Load a text file
export function text (options, callback) {
    return load(options, callback);
}

//Load a JSON file
export function json (options, callback) {
    return load(options, function (response) {
        //Check for a successful response to parse the response content
        if (response.ok === true) {
            response.content = JSON.parse(response.content);
        }
        return callback(response);
    });
}

