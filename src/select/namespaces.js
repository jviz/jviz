//Initialize the object with the available namespaces
let namespaces = {
    "svg": "http://www.w3.org/2000/svg",
    "xhtml": "http://www.w3.org/1999/xhtml",
    "xlink": "http://www.w3.org/1999/xlink",
    "xml": "http://www.w3.org/XML/1998/namespace",
    "xmlns": "http://www.w3.org/2000/xmlns/"
};

//Get a single namespace
export function getNamespace (name) {
    return (typeof namespaces[name] === "string") ? namespaces[name] : null;
}

//Extract the namespace from a node tag
// svg:g => {"space": "http://www.w3.org/2000/svg", "tag": "g"}
// svg   => {"space": "http://www.w3.org/2000/svg", "tag": "svg"}
// div   => {"space": null, "tag": "div"} (no namespace needed)
export function extractNamespace (tag) {
    let index = tag.indexOf(":");
    let prefix = tag;
    //Check if the tag has the format space:tag
    if (index > 0 && tag.slice(0, index) !== "xmlns") {
        prefix = tag.slice(0, index);
    }
    //Check if the namespace exists
    let prefixNamespace = getNamespace(prefix);
    if (prefixNamespace !== null) {
        return {
            "space": prefixNamespace,
            "tag": tag.slice(index + 1)
        };
    }
    //Namespace not necessary for the provided tag
    return {
        "space": null,
        "tag": tag
    };
}

