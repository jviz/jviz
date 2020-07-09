import React from "react";
import {Icon} from "@siimple/neutrine";
import {classNames} from "@siimple/neutrine";

import style from "./style.scss";

//Export menu button
export function MenuButton (props) {
    let classList = classNames({
        [style.menuButton]: true,
        [style.menuButtonActive]: props.active === true
    });
    //Build the menu button
    return (
        <div onClick={props.onClick} className={classList}>
            <Icon size="30px" icon="menu" />
        </div>
    );
}

//Menu button default props
MenuButton.defaultProps = {
    "active": false,
    "onClick": null
};

