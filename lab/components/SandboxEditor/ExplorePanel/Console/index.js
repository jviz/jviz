import React from "react";

import {ForEach} from "@siimple/neutrine";
import {Panel, PanelHeader, PanelBody} from "@siimple/lib/widgets/mocha-panel/index.js";
import {PanelTab} from "@siimple/lib/widgets/mocha-panel/index.js";

import style from "../style.scss";

//Console wrapper
export function Console (props) {
    return (
        <Panel>
            <PanelHeader>
                <ForEach items={props.tabs} render={function (key, index) {
                    return React.createElement(PanelTab, {
                        "onClick": function () {
                            return props.onChange(key);
                        },
                        "active": props.currentTab === key,
                        "text": key,
                        "key": index
                    });
                }} />
            </PanelHeader>
            <PanelBody>
                <div className={style.content}>
                    {props.children}
                </div>
            </PanelBody>
        </Panel>
    );
}

//Console default props
Console.defaultProps = {
    "currentTab": "logs",
    "tabs": ["logs", "state", "data"],
    "onChange": null
};

