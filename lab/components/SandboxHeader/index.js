import React from "react";
import {Renderer} from "@siimple/neutrine";
import {Media, MediaContent, MediaStart, MediaEnd} from "@siimple/neutrine";

import {ActionButton} from "./ActionButton.js";
import {MenuButton} from "./MenuButton.js";
import style from "./style.scss";

//Export sandbox header editor component
export const SandboxHeader = function (props) {
    let sandboxName = (typeof props.sandbox.name === "string") ? props.sandbox.name : "Untitled";
    return (
        <Media className={style.root}>
            {/* Editor menu button */}
            <MediaStart className="siimple--flex siimple--flex-row">
                <MenuButton onClick={props.onMenuClick} active={props.menuActive} />
                <div className={style.title} onClick={props.onHomeClick}>
                    <strong>jviz</strong>lab
                </div>
            </MediaStart>
            {/* Center side --> display sandbox nameand status */}
            <MediaContent align="center">
                <div className={style.sandboxName}>
                    <strong>{sandboxName}</strong>
                </div>
            </MediaContent>
            {/* Right side --> sandbox actions */}
            <MediaEnd className="siimple--flex siimple--flex-row">
                <ActionButton icon="save" onClick={props.onSaveClick} />
                <ActionButton icon="download" onClick={props.onExportClick} />
                <ActionButton icon="gear" onClick={props.onSettingsClick} />
            </MediaEnd>
        </Media>
    );
};

//Editor header default props
SandboxHeader.defaultProps = {
    "sandbox": {},
    "menuActive": false,
    "onHomeClick": null,
    "onMenuClick": null,
    "onSaveClick": null,
    "onExportClick": null,
    "onSettingsClick": null
};

