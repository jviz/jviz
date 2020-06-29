import React from "react";
import {If} from "@siimple/neutrine";
import {Icon} from "@siimple/neutrine";

import style from "./style.scss";

//Splash screen component
export function Splash (props) {
    return (
        <div className={style.splash}>
            <div className={style.splashContent} align="center">
                {/* Show icon */}
                <If condition={typeof props.icon === "string"} render={function () {
                    return (
                        <div align="center">
                            <Icon icon={props.icon} className={style.splashIcon} />
                        </div>
                    );
                }} />
                {/* Show custom content */}
                <div align="center">
                    {props.children}
                </div>
            </div>
        </div>
    );
}

//Splash default props
Splash.defaultProps = {
    "icon": null
};


