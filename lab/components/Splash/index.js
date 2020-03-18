import React from "react";
import {Icon} from "@siimple/neutrine";

import style from "./style.scss";

//Splash screen component
export function Splash (props) {
    return (
        <div className={style.splash}>
            <div className={style.splashContent}>
                <div align="center">
                    <Icon icon={props.icon} className={style.splashIcon} />
                </div>
                <div align="center">
                    {props.children}
                </div>
            </div>
        </div>
    );
}


