import React from "react";

//import {ForEach} from "@siimple/neutrine";
import {classNames} from "@siimple/neutrine";

//Logs colors
let colors = {
    "error": "siimple--text-error",
    "warning": "siimple--text-warning",
    "info": "siimple--text-primary"
};

//Export logs tab
export function ConsoleLogsTab (props) {
    return React.createElement("div", {}, props.logs.map(function (item, index) {
        return (
            <div className="siimple--mb-5" key={index}>
                <strong className={colors[item.type]}>[{item.type}] </strong> 
                <span> {item.message}</span>
            </div>
        );
    }));
}


