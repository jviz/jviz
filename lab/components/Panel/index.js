import React from "react";
import {If, classNames} from "@siimple/neutrine";
import style from "./style.scss";

//Export panel component
export const Panel = function (props) {
    return (
        <div className={style.panel} style={props.style}>
            {props.children}
        </div>
    );
};

//Export panel header component
export const PanelHead = function (props) {
    return (
        <div className={style.panelHead} style={props.style}>
            <If condition={props.title !== null}>
                <div className={panelHeadTitle}>
                    {props.title}
                </div>
            </If>
            {props.children}
        </div>
    );
};

//Panel head default props
PanelHead.defaultProps = {
    "title": null
};

//Export panel body component
export const PanelBody = function (props) {
    return (
        <div className={style.panelBody} style={props.style}>
            {props.children}
        </div>
    );
};

//Panel tab component
export const PanelTab = function (props) {
    let classList = classNames({
        [style.panelTab]: true,
        [style.panelTabActive]: props.active
    });
    //Return the tab component
    return (
        <div className={classList} onClick={props.onClick}>
            {props.text}
        </div>
    );
};

//Tab default props
PanelTab.defaultProps = {
    "onClick": null,
    "active": false,
    "text": null
};

