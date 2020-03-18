import React from "react";
import {HeaderButton} from "./Button/index.js";
import {HeaderMenu} from "./Menu/index.js";

import style from "./style.scss";

//Export header editor component
export const EditorHeader = function (props) {
    return (
        <div className={style.header}>
            <HeaderMenu icon="plus" onClick={props.onCreateClick}>
                Create <strong>new</strong>
            </HeaderMenu>
            <div className="siimple--pl-4" style={{"display": "inline-block"}}>
                <HeaderButton onClick={props.onRunClick}>
                    <strong>Run</strong>
                </HeaderButton>
            </div>
        </div>
    );
};

//Editor header default props
EditorHeader.defaultProps = {
    "onCreateClick": null,
    "onRunClick": null
};

