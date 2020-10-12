import React from "react";

import {ForEach, Renderer, If} from "neutrine/lib/components";
import {SplitPanel, SplitPanelItem} from "neutrine/lib/components";

import {ExplorePanel} from "./ExplorePanel/index.js";
import {MainPanel} from "./MainPanel/index.js";
import {CodeTab} from "./MainPanel/CodeTab.js";
//import {createSandbox} from "../../utils/sandbox.js";

//Build state from props
let buildStateFromProps = function (props) {
    let newState = {
        "tab": "schema", //"readme",
        //"sandbox": createSandbox({"name": "Untitled"}),
        "running": false,
        "rendered": false //To store if sandbox has been rendered
    };
    //Check for initial sandbox data
    //if (typeof props.sandbox === "object" && props.sandbox !== null) {
    //    newState.sandbox = Object.assign(newState.sandbox, props.sandbox);
    //}
    //Return new state
    return newState;
};

//Export sandbox editor class
export class SandboxEditor extends React.Component {
    constructor(props) {
        super(props);
        //Initialize state
        this.state = buildStateFromProps(this.props);
        //Referenced elements
        this.ref = {
            "readme": React.createRef(),
            "schema": React.createRef(),
            "data": React.createRef(),
            "explore": React.createRef()
        };
        //Bind methods
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleRun = this.handleRun.bind(this);
        this.updateTabContent = this.updateTabContent.bind(this);
        //Bind sandbox methods
        this.getSandbox = this.getSandbox.bind(this);
        this.runSandbox = this.runSandbox.bind(this);
    }
    //Component dod mount --> set tab content
    componentDidMount() {
        return this.updateTabContent();
    }
    //Component did update --> update tab content
    componentDidUpdate() {
        //return this.updateTabContent();
    }
    //Handle tab change
    handleTabChange(key) {
        let self = this;
        if (key === this.state.tab) {
            return null; //Nothing to do
        }
        //Update the state with the current sandbox data and the new tab
        //let sandbox = this.getSandbox();
        return this.getSandbox().then(function (sandbox) {
            return self.props.onSandboxUpdate(sandbox, function () {
                return self.setState({"tab": key}, function () {
                    return self.updateTabContent();
                });
            });
        });
    }
    //Handle run click
    handleRun() {
        return this.runSandbox();
    }
    //Update tab content
    updateTabContent() {
        let sandbox = this.props.sandbox; //Get sandbox
        //Check for schema tab --> set schema value
        if (this.state.tab === "schema") {
            this.ref.schema.current.setValue(sandbox.schema);
        }
        //Check for readme tab --> set readme value
        else if (this.state.tab === "readme" && typeof sandbox.readme === "string") {
            this.ref.readme.current.setValue(sandbox.readme);
        }
    }
    //Run sandbox
    runSandbox(cb) {
        let self = this;
        let rendered = false;
        //let sandbox = this.getSandbox(); //Get current sandbox state
        //Update the state before running the sandbox
        return this.setState({"running": true}, function () {
            return self.getSandbox().then(function (sandbox) {
                return self.ref.explore.current.run(sandbox);
            }).then(function() {
                rendered = true; //Plot rendered
            }).catch(function (error) {
                //Something went wrong rendering the plot
                //console.error(error);
            }).finally(function () {
                //In both cases, running process has been finished
                return self.setState({
                    "running": false,
                    "rendered": rendered
                });
            });
        });
    }
    //Get the current state of the sandbox
    getSandbox() {
        let self = this;
        let sandbox = Object.assign({}, this.props.sandbox); //Get current sandbox
        //Check for schema tab --> save content into the schema field
        if (this.state.tab === "schema") {
            Object.assign(sandbox, {
                "schema": this.ref.schema.current.getValue()
            });
        }
        //Check for readme tab --> save content into the readme field
        else if (this.state.tab === "readme") {
            Object.assign(sandbox, {
                "readme": this.ref.readme.current.getValue()
            });
        }
        //Check if sandbox is not rendered --> do not update the thumbnail
        if (this.state.rendered === false) {
            return Promise.resolve(sandbox); //Return a promise with the sandbox
        }
        //Generate the thumbnail
        let viewer =  this.ref.explore.current.viewer;
        let width = viewer.context.draw.width.value; //Get plot width
        let thumbnailWidth = 200; //Expected thumbnail width
        let scale = (width < thumbnailWidth) ? 1 : thumbnailWidth / width; //Get scale factor
        return viewer.toImageUrl("png", scale).then(function (data) {
            //console.log(data); //Thumbnail in image-url format
            return Object.assign(sandbox, {
                "thumbnail": data
            });
        });
    }
    //Render the editor page
    render() {
        let self = this;
        let state = this.state;
        return (
            <div style={{"width":"100%","height":"100%"}}>
                <SplitPanel split="vertical" resizeStyle={{"backgroundColor":"transparent"}}>
                    <SplitPanelItem primary defaultSize="50%" minSize="400px">
                        <MainPanel tab={state.tab} running={state.running} onTabChange={this.handleTabChange} onRun={this.handleRun}>
                            {/* Readme tab --> render a editor for the readme */}
                            <If condition={this.state.tab === "readme"} render={function () {
                                return React.createElement(CodeTab, {
                                    "ref": self.ref.readme,
                                    "language": "json"
                                });
                            }} />
                            {/* Schema tab --> render schema editor */}
                            <If condition={this.state.tab === "schema"} render={function () {
                                return React.createElement(CodeTab, {
                                    "ref": self.ref.schema,
                                    "language": "json"
                                });
                            }} />
                        </MainPanel>
                    </SplitPanelItem>
                    <SplitPanelItem>
                        {/* Explore panel */}
                        <Renderer render={function () {
                            return React.createElement(ExplorePanel, {
                                "ref": self.ref.explore
                            });
                        }} />
                    </SplitPanelItem>
                </SplitPanel>
            </div>
        );
    }
}

//Editor default props
SandboxEditor.defaultProps = {
    "sandbox": {}
};

