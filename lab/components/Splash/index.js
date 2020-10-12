import React from "react";
import {If} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";

import style from "./style.scss";

//Splash screen component
export function Splash (props) {
    return (
        <div className={style.root}>
            <div className={style.content} align="center">
                <div className={style.title} align="center">
                    <strong>jviz</strong>lab
                </div>
                {/* Show spinner and text */}
                <Spinner color="dark" />
            </div>
        </div>
    );
}

