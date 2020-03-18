import React from "react";
import {If} from "@siimple/neutrine";
import {Icon} from "@siimple/neutrine";

import style from "./style.scss";

//Export header menu button
export const HeaderMenu = function (props) {
    return (
        <div className={style.menu} onClick={props.onClick}>
            <If condition={props.icon !== null}>
                <Icon icon={props.icon} className={style.menuIcon} />
            </If>
            <span className={style.menuText}>
                {props.children}
            </span>
        </div>
    );
};

//Header menu default props
HeaderMenu.defaultProps = {
    "onClick": null,
    "icon": null
};

