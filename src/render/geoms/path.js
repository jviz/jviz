//Path default props
let defaultProps = {
    "path": ""
};

//Export path geom
export const pathGeom = {
    "tag": "path",
    "type": "path",
    "render": function (context, datum, props, element) {
        let path = context.value(props["path"], datum, defaultProps.path); //Get path value
        //Return the element with the path attribute
        return element.attr("d", path);
    },
    "props": defaultProps
};

