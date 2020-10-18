import React from "react";
import kofi from "kofi";
import {If, Renderer} from "neutrine/lib/components";

import {Preview} from "./Preview/index.js";
import {Console} from "./Console/index.js";
import {ConsoleLogsTab} from "./Console/LogsTab.js";
import {ConsoleStateTab} from "./Console/StateTab.js";
import {runSandbox} from "../../../utils/sandbox.js";
import style from "./style.scss";

//Export explorer panel component
export class ExplorePanel extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "consoleTab": "logs",
            "deployed": false,
            "ready": false //Plot is ready to interact
        };
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        this.schema = null; //Deployed schema
        this.viewer = {}; //jviz viewers instance
        this.logs = [];
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
    handleStateChange(file, name, value) {
        this.viewer[file].state(name, value);
        this.viewer[file].render(); //Render the plot
    }
    //Register a log message
    log(type, message) {
        this.logs.push({
            "type": type, 
            "message": message,
            "date": Date.now()
        });
    }
    //Run content
    run(sandbox, currentFile) {
        let self = this;
        this.logs = []; //Clear logs messages
        return new Promise(function (resolve, reject) {
            self.clear(); //Remove the current plot
            self.log("info", "Run started");
            let newState = {
                "consoleTab": "logs", //Return to logs tab
                "deployed": true,
                "ready": false
            };
            //Update the new state
            return self.setState(newState, function () {
                return runSandbox(sandbox, currentFile, function (name, schema, index) {
                    self.log("info", `Running '${name}'`);
                    //console.log(schema); //Print schema
                    //window.currentSchema = schema; //Save current schema
                    //self.schema = schema; //Save current schema
                    //Create the viewer
                    self.viewer[name] = jviz(schema, {
                        "parent": self.ref.parent.current
                    });
                    //console.log(self.viewer); //Print viewer instance
                    return self.viewer[name].render();
                }).then(function () {
                    window.viewer = self.viewer; //Save the viewer instance in the window object
                    //Update the state
                    return self.setState({"ready": true}, function () {
                        self.log("info", "Run finished"); //Display in logs
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
        let self = this;
        Object.keys(this.viewer).forEach(function (file) {
            return self.viewer[file].destroy(); //Remove bounds and elements
        });
        //Remove all references to the old viewers
        this.viewer = {};
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
                    //let tabs = (self.state.ready) ? ["logs", "state", "data"] : ["logs"]; //Available tabs
                    let tabs = ["logs", "state"]; //At this momento only logs tab is enabled
                    //Return console panel
                    return (
                        <div className={style.secondaryItem}>
                            <Console currentTab={tab} tabs={tabs} onChange={self.handleConsoleTabChange}>
                                {/* Render logs tab */}
                                <If condition={tab === "logs"} render={function () {
                                    return React.createElement(ConsoleLogsTab, {
                                        "logs": self.logs
                                    });
                                }} />
                                {/* Render state tab */}
                                <If condition={tab ==="state" && ready} render={function () {
                                    return React.createElement(ConsoleStateTab, {
                                        "files": Object.keys(self.viewer),
                                        "getViewer": function (name) {
                                            return self.viewer[name];
                                        },
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

