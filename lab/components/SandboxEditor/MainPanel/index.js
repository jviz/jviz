import React from "react";
import {ForEach, If} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";
import {Panel, PanelHeader, PanelBody, PanelTab} from "neutrine/lib/components";
import {Media, MediaContent, MediaEnd} from "neutrine/lib/components";

//Available tabs
let availableTabs = {
    "readme": "Readme",
    "schema": "schema.json",
    "data": "Data"
};

//Export main panel component
export function MainPanel (props) {
    return (
        <Panel>
            {/* Panel header -->  tabs and run button */}
            <PanelHeader>
                <Media className="siimple--mb-0 siimple--width-100">
                    <MediaContent className="siimple--flex">
                        <ForEach items={props.tabsList} render={function (key, index) {
                            let tabName = availableTabs[key];
                            //Return the tab element
                            return React.createElement(PanelTab, {
                                "active": props.tab === key,
                                "onClick": function () {
                                    return props.onTabChange(key);
                                },
                                "text": tabName,
                                "key": index
                            });
                        }} />
                    </MediaContent>
                    {/* Run sandbox */}
                    <MediaEnd>
                        {/* Not running --> display run button */}
                        <If condition={props.running === false}>
                            <Btn color="secondary" small onClick={props.onRun}>
                                <strong>Run sandbox</strong>
                            </Btn>
                        </If>
                        {/* Running --> display spinner */}
                        <If condition={props.running === true}>
                            <Spinner color="secondary" style={{"margin":"2px"}} />
                        </If>
                    </MediaEnd>
                </Media>
            </PanelHeader>
            {/* Panel body --> Render tab */}
            <PanelBody>
                {props.children}
            </PanelBody>
        </Panel>
    );
}

//Main panel default props
MainPanel.defaultProps = {
    "tab": "schema",
    "tabsList": ["schema"]
};



