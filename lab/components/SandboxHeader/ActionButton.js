import React from "react";
import {Icon} from "neutrine/lib/components";

import style from "./style.scss";

//Export action button component
export function ActionButton (props) {
    return (
        <div onClick={props.onClick} className={style.actionButton}>
            <Icon size="26px" icon={props.icon} />
        </div>
    );
}

