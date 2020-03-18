//Import data from the provided url
export function load (url, options) {
    return new Promise(function (resolve, reject) {
        let xhttp = new XMLHttpRequest();
        //let requestOptions = getDefaultRequestOptions();
        //TODO: parse and use options object
        //Check for no request url provided
        if (typeof url !== "string" || url.trim() === "") {
            return reject(Error("No url provided"));
        }
        //Register the ready state change listener
        xhttp.onreadystatechange = function () {
            if (this.readyState !== 4) {
                return null;
            }
            //Check the response code
            if (this.status < 300) {
                return resolve(this.responseText); //Resolve with the response text
            }
            //Other: reject the promise --> error processing request
            return reject(new Error(`Error code: ${this.status}`));
        };
        //Open the connection
        xhttp.open("GET", url.trim(), true);
        //Add the headers to the connection
        //if (requestOptions.headers !== null) {
        //    Object.keys(requestOptions.headers).forEach(function () {
        //        xhttp.setRequestHeader(key.toLowerCase(), requestOptions.headers[key]);
        //    });
        //}
        //Perform the request
        xhttp.send(null);
    });
}

//Load a text file
export function loadText (url, options) {
    return load(url, options);
}

//Load a JSON file
export function loadJson (url, options) {
    return load(url, options).then(function (content) {
        return JSON.parse(content);
    });
}

