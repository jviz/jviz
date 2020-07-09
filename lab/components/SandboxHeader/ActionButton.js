import React from "react";
import {Icon} from "@siimple/neutrine";

import style from "./style.scss";

//Export action button component
export function ActionButton (props) {
    return (
        <div onClick={props.onClick} className={style.actionButton}>
            <Icon size="26px" icon={props.icon} />
        </div>
    );
}

