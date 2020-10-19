import React from "react";
import {Pre} from "neutrine/lib/components";
//import {classNames} from "neutrine/lib/utils";

//Logs colors
let colors = {
    "error": "siimple--text-error",
    "warning": "siimple--text-warning",
    "info": "siimple--text-primary"
};

//Export schema tab
export function ConsoleSchemaTab (props) {
    return React.createElement(Pre, {}, props.schema);
}


