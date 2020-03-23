let jviz = require("./jviz.cjs.js");

//Stringify the chema
let schemaStringify = function (schema) {
    return JSON.stringify(schema).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
};

//Export jviz schema loader
module.exports = function (source) {
    //Build schema
    let schema = jviz.parseSync(source);
    //Return parsed schema
    return `export default ${schemaStringify(schema)}`
};

