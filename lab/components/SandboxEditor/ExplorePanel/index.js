import React from "react";
import kofi from "kofi";
import {If, Renderer, ForEach} from "neutrine/lib/components";

import {Preview} from "./Preview/index.js";
import {PreviewCell, CellElement} from "./Preview/Cell.js";
import {Console} from "./Console/index.js";
import {ConsoleLogsTab} from "./Console/LogsTab.js";
import {ConsoleStateTab} from "./Console/StateTab.js";
import {ConsoleSchemaTab} from "./Console/SchemaTab.js";
import {runSandbox} from "../../../utils/sandbox.js";
import style from "./style.scss";

//Export explorer panel component
export class ExplorePanel extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "currentTab": "logs",
            "currentCell": -1,
            "totalCells": 0
        };
        //Cells elements
        this.cells = [];
        //Bind methods
        this.run = this.run.bind(this);
        //this.getViewer = this.getViewer.bind(this);
        this.addCell = this.addCell.bind(this);
        this.getCell = this.getCell.bind(this);
        this.getCurrentCell = this.getCurrentCell.bind(this);
        this.setCurrentCell = this.setCurrentCell.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
    }
    //Component will unmount
    componentWillUnmount() {
        //return this.handleClear();
    }
    //Handle console tab change
    handleTabChange(newTab) {
        return this.setState({"currentTab": newTab});
    }
    //Handle state variable change
    handleStateChange(name, value) {
        let currentCell = this.getCurrentCell(); //Get current cell
        currentCell.viewer.state(name, value);
        currentCell.viewer.render(); //Render the plot
    }
    //Clear the preview
    handleClear() {
        //Destroy all cells and clear the list of available cells
        this.cells = this.cells.filter(function (cell) {
            if (cell.viewer !== null) {
                cell.viewer.destroy();
            }
            return false;
        });
        //Remove the index of the current viewer and reset cells
        return this.setState({
            "totalCells": 0,
            "currentCell": -1
        });
    }
    //Get a cell element
    getCell(index) {
        return this.cells[index];
    }
    //Get the current cell
    getCurrentCell() {
        return this.cells[this.state.currentCell];
    }
    //Set a new current cell
    setCurrentCell(index, callback) {
        //Update the state with the current cell
        let newState = {
            "currentCell": index,
            "currentTab": "logs"
        };
        return this.setState(newState, callback);
    }
    //Add a new cell element
    addCell(file, callback) {
        let self = this;
        //Create a new cell object
        this.cells.push(new CellElement(file));
        let newState = {
            "totalCells": this.state.totalCells + 1,
            "currentCell": this.state.totalCells,
            "currentTab": "logs"
        };
        //Update the state and call the provided callback
        return this.setState(newState, function () {
            return callback();
        });
    }
    //Run content
    run(sandbox, currentFile) {
        let self = this;
        let cell = null;
        return new Promise(function (resolve, reject) {
            //Set the current cell to the new cell
            return self.addCell(currentFile, function () {
                cell = self.getCurrentCell(); //Get the current cell
                cell.log("info", "Run started");
                cell.log("info", `Running '${currentFile}'`);
                return runSandbox(sandbox, currentFile).then(function (schema) {
                    //window.currentSchema = schema; //Save current schema
                    //self.schema = schema; //Save current schema
                    //Create the viewer
                    cell.schema = schema; //Set cell schema
                    cell.viewer = jviz(schema, {
                        "parent": cell.parent.current
                    });
                    //console.log(self.viewer); //Print viewer instance
                    return cell.viewer.render();
                }).then(function () {
                    //window.viewer = self.viewer; //Save the viewer instance in the window object
                    //Update the state
                    //let currentIndex  = Math.max(0, self.state.currentViewerIndex);
                    //return self.setState({"currentViewerIndex": currentIndex}, function () {
                    cell.log("info", "Run finished"); //Display in logs
                    return resolve(); //Ready
                }).catch(function (error) {
                    console.error(error);
                    cell.log("error", error.message); //Save the error in logs
                    cell.error = error.message; //Set error message
                    cell.viewer = null; //Delete cell viewer
                    //TODO: display error in cell
                    //Reject the promise, but the error will be displayed in the explorer console
                    //instead of in js console
                    return reject(error);
                });
            });
        });
    }
    //Render preview panel
    render() {
        let self = this;
        let currentCell = self.state.currentCell; //Get current index
        return (
            <div className={style.root}>
                {/* Render the preview panel */}
                <div className={style.primaryItem}>
                    <Preview onClear={this.handleClear}>
                        <ForEach items={this.cells} render={function (cell, index) {
                            return React.createElement(PreviewCell, {
                                "key": index,
                                "ref": cell.parent,
                                "active": index === currentCell,
                                "index": index,
                                "error": cell.error,
                                "onClick": self.setCurrentCell
                            });
                        }} />
                    </Preview>
                </div>
                {/* Render the console panel */}
                <If condition={currentCell > -1} render={function () {
                    let tab = self.state.currentTab; //Get current tab
                    //let tabs = (self.state.ready) ? ["logs", "state", "data"] : ["logs"]; //Available tabs
                    let tabs = ["logs", "state", "schema"]; //At this moment only logs tab is enabled
                    let title = `[${currentCell}] ${self.getCurrentCell().file}`; //Get console title
                    //Return console panel
                    return (
                        <div className={style.secondaryItem}>
                            <Console currentTab={tab} tabs={tabs} onChange={self.handleTabChange} title={title}>
                                {/* Render logs tab */}
                                <If condition={tab === "logs"} render={function () {
                                    return React.createElement(ConsoleLogsTab, {
                                        "logs": self.getCurrentCell().logs
                                    });
                                }} />
                                {/* Render state tab */}
                                <If condition={tab ==="state"} render={function () {
                                    return React.createElement(ConsoleStateTab, {
                                        "getCurrentViewer": function () {
                                            return self.getCurrentCell().viewer;
                                        },
                                        "onChange": self.handleStateChange
                                    });
                                }} />
                                {/* Render schema tab */}
                                <If condition={tab === "schema"} render={function () {
                                    let schema = self.getCurrentCell().schema;
                                    return React.createElement(ConsoleSchemaTab, {
                                        "schema": JSON.stringify(schema, null, "    ")
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

