import React from "react";

import {Editor as CodeEditor} from "@siimple/lib/widgets/editor/index.js";

//Export code tab component
export const CodeTab = React.forwardRef(function (props, ref) {
    return React.createElement(CodeEditor, {
        "ref": ref,
        "options": {
            "language": props.language,
            "theme": props.theme
        },
        "value": ""
    });
});

//Code tab default props
CodeTab.defaultProps = {
    "language": "json",
    "theme": "light"
};

