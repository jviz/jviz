import React from "react";

import {EditorComponent} from "neutrine/lib/editor";

//Export code tab component
export const CodeTab = React.forwardRef(function (props, ref) {
    return React.createElement(EditorComponent, {
        "ref": ref,
        "language": props.language,
        "theme": props.theme,
        "value": ""
    });
});

//Code tab default props
CodeTab.defaultProps = {
    "language": "json",
    "theme": "light"
};

