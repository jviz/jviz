import React from "react";
import {If} from "@siimple/neutrine";
import {Icon} from "@siimple/neutrine";

import style from "./style.scss";

//Export header button
export const HeaderButton = function (props) {
    return (
        <div className={style.button} onClick={props.onClick}>
            <If condition={props.icon !== null}>
                <Icon icon={props.icon} className={style.buttonIcon} />
            </If>
            <span className={style.buttonText}>
                {props.children}
            </span>
        </div>
    );
};

//Button default props
HeaderButton.defaultProps = {
    "onClick": null,
    "icon": null
};

