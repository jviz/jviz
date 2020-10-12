import React from "react";
import {Renderer} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Media, MediaContent, MediaStart, MediaEnd} from "neutrine/lib/components";

import style from "./style.scss";

//Button component wrapper
let Button = function (props) {
    return (
        <div onClick={props.onClick} className={style.button}>
            <Icon size="26px" icon={props.icon} />
        </div>
    );
};

//Export sandbox header editor component
export const SandboxHeader = function (props) {
    let sandboxName = (typeof props.sandbox.name === "string") ? props.sandbox.name : "Untitled";
    return (
        <Media className={style.root}>
                {/* Left side --> editor logo */}
            <MediaStart className="siimple--flex siimple--flex-row">
                <div className={style.logo} onClick={props.onLogoClick}>
                    <strong>jviz</strong>lab
                </div>
            </MediaStart>
            {/* Center side --> display sandbox name and status */}
            <MediaContent align="center">
                <div className={style.title}>
                    <strong>{sandboxName}</strong>
                </div>
            </MediaContent>
            {/* Right side --> sandbox actions */}
            <MediaEnd className="siimple--flex siimple--flex-row">
                <Button icon="save" onClick={props.onSaveClick} />
                <Button icon="download" onClick={props.onExportClick} />
                <Button icon="gear" onClick={props.onConfigClick} />
                <div className={style.divider} />
                <Button icon="trash" onClick={props.onDeleteClick} />
            </MediaEnd>
        </Media>
    );
};

//Editor header default props
SandboxHeader.defaultProps = {
    "sandbox": {},
    "onLogoClick": null,
    "onSaveClick": null,
    "onExportClick": null,
    "onConfigClick": null,
    "onDeleteClick": null
};

