import React from "react";
import {ForEach} from "neutrine/lib/components";
import {Panel, PanelHeader, PanelBody, PanelTab} from "neutrine/lib/components";
import {PanelTitle} from "neutrine/lib/components";
import {Media, MediaStart, MediaContent, MediaEnd} from "neutrine/lib/components";

import style from "../style.scss";

//Console wrapper
export function Console (props) {
    return (
        <Panel>
            <PanelHeader style={{"display": "flex"}}>
                <MediaStart>
                    <PanelTitle>{props.title}</PanelTitle>
                </MediaStart>
                <MediaContent style={{"display": "flex", "justifyContent": "flex-end"}}>
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
                </MediaContent>
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
    "title": "",
    "currentTab": "logs",
    "tabs": ["logs", "state", "schema"],
    "onChange": null
};

