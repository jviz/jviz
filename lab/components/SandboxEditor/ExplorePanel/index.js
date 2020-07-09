import React from "react";
import kofi from "kofi";

import {If, Renderer} from "@siimple/neutrine";

import {Preview} from "./Preview/index.js";
import {Console} from "./Console/index.js";
import {ConsoleLogsTab} from "./Console/LogsTab.js";
import {ConsoleStateTab} from "./Console/StateTab.js";
import {parseSandbox} from "../../../utils/sandbox.js";
import style from "./style.scss";

//Export explorer panel component
export class ExplorePanel extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "consoleTab": "logs",
            "deployed": false,
            "ready": false, //Plot is ready to interact
            "logs": []
        };
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        this.schema = null; //Deployed schema
        this.viewer = null; //jviz viewer instance
        //Bind methods
        this.run = this.run.bind(this);
        this.clear = this.clear.bind(this);
        this.log = this.log.bind(this);
        this.handleConsoleTabChange = this.handleConsoleTabChange.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
    }
    //Component will unmount
    componentWillUnmount() {
        return this.clear();
    }
    //Handle console tab change
    handleConsoleTabChange(newTab) {
        return this.setState({"consoleTab": newTab});
    }
    //Handle state variable change
    handleStateChange(name, value) {
        this.viewer.state(name, value);
        this.viewer.render(); //Render the plot
    }
    //Register a log message
    log(type, message) {
        let logs = this.state.logs;
        logs.push({
            "type": type, 
            "message": message,
            "date": Date.now()
        });
        //Update the state with the new logs
        return this.setState({"logs": logs});
    }
    //Run content
    run(sandbox) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.clear(); //Remove the current plot
            let newState = {
                "consoleTab": "logs", //Return to logs tab
                "deployed": true,
                "logs": [], //Clear logs
                "ready": false
            };
            //Update the new state
            return self.setState(newState, function () {
                return kofi.delay(self.props.delayTime).then(function () {
                    return parseSandbox(sandbox);
                }).then(function (schema) {
                    //console.log(schema); //Print schema
                    window.currentSchema = schema; //Save current schema
                    self.schema = schema; //Save current schema
                    //Create the viewer
                    self.viewer = jviz(schema, {
                        "parent": self.ref.parent.current
                    });
                    window.viewer = self.viewer; //Save the viewer instance in the window object
                    //console.log(self.viewer); //Print viewer instance
                    return self.viewer.render();
                }).then(function () {
                    //Update the state
                    return self.setState({"ready": true}, function () {
                        self.log("info", "Graphic ready"); //Display in logs
                        return resolve(); //Ready
                    });
                }).catch(function (error) {
                    console.error(error);
                    self.log("error", error.message); //Save the error in logs
                    //Reject the promise, but the error will be displayed in the explorer console
                    //instead of in js console
                    return reject(error);
                });
            });
        });
    }
    //Clear the preview
    clear() {
        if (typeof this.viewer !== "object" || this.viewer === null) {
            return null; //Nothing to do
        }
        this.viewer.destroy(); //Remove bounds
        delete this.viewer; //Remove reference
    }
    //Render preview panel
    render() {
        let self = this;
        return (
            <div className={style.root}>
                {/* Render the preview panel */}
                <div className={style.primaryItem}>
                    <Renderer render={function () {
                        return React.createElement(Preview, {
                            "ref": self.ref.parent,
                            "deployed": self.state.deployed
                        });
                    }} />
                </div>
                {/* Render the console panel */}
                <If condition={this.state.deployed} render={function () {
                    let ready = self.state.ready;
                    let tab = self.state.consoleTab; //Get current tab
                    let tabs = (self.state.ready) ? ["logs", "state", "data"] : ["logs"]; //Available tabs
                    let getCurrentSchema = function () {
                        return self.schema; //Return schema definition
                    };
                    let getCurrentViewer = function () {
                        return self.viewer; //Return viewer instance
                    };
                    //Return console panel
                    return (
                        <div className={style.secondaryItem}>
                            <Console currentTab={tab} tabs={tabs} onChange={self.handleConsoleTabChange}>
                                {/* Render logs tab */}
                                <If condition={tab === "logs"} render={function () {
                                    return React.createElement(ConsoleLogsTab, {
                                        "logs": self.state.logs
                                    });
                                }} />
                                {/* Render state tab */}
                                <If condition={tab ==="state" && ready} render={function () {
                                    return React.createElement(ConsoleStateTab, {
                                        "getCurrentSchema": getCurrentSchema,
                                        "getCurrentViewer": getCurrentViewer,
                                        "onChange": self.handleStateChange
                                    });
                                }} />
                            </Console>
                        </div>
                    );
                }} />
            </div>
        );
    }
}

//Explore default props
ExplorePanel.defaultProps = {
    "delayTime": 0
};

