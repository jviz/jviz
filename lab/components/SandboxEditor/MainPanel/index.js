import React from "react";

import {ForEach, If} from "@siimple/neutrine";
import {Btn} from "@siimple/neutrine";
import {Spinner} from "@siimple/neutrine";
import {Panel, PanelHeader, PanelBody, PanelFooter} from "@siimple/lib/widgets/mocha-panel/index.js";
import {PanelTab} from "@siimple/lib/widgets/mocha-panel/index.js";

//Available tabs
let availableTabs = {
    "readme": "Readme",
    "schema": "Schema",
    "data": "Data"
};

//Export main panel component
export function MainPanel (props) {
    return (
        <Panel>
            {/* Panel header -->  tabs and run button */}
            <PanelHeader>
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
                {/* Run sandbox */}
                <div style={{"marginLeft":"auto"}}>
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
                </div>
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
    "tabsList": ["readme", "schema"]
};



