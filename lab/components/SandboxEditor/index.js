import React from "react";
import {ForEach, Renderer, If} from "neutrine/lib/components";
import {SplitPanel, SplitPanelItem} from "neutrine/lib/components";

import {ExplorePanel} from "./ExplorePanel/index.js";
import {EditorPanel} from "./EditorPanel/index.js";
import {FilesPanel} from "./FilesPanel/index.js";
import {CreateFile} from "./actions/CreateFile.js";
import {createSandboxFile} from "../../utils/sandbox.js";
import {encodeSandboxFile, decodeSandboxFile} from "../../utils/sandbox.js";

//Generate a dialog to delete a file
let deleteFileDialog = function (name, cb) {
    //Display a confirmation dialog
    return window.confirm.show({
        "title": "Delete file",
        "content": `This will remove the file '${name}' from this sandbox. This action can not be undone. Continue?`,
        "onConfirm": cb,
        "confirmText": "Yes, delete",
        "cancelText": "Cancel"
    });
};

//Build state from props
let buildStateFromProps = function (props) {
    let newState = {
        //"tab": "schema", //"readme",
        "currentFile": props.sandbox.main,
        "showCreateDialog": false,
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
            "editor": React.createRef(),
            "explore": React.createRef()
        };
        //Bind methods
        this.handleRun = this.handleRun.bind(this);
        //Bind sandbox methods
        this.getSandbox = this.getSandbox.bind(this);
        this.runSandbox = this.runSandbox.bind(this);
        this.getThumbnail = this.getThumbnail.bind(this);
        //Bind dialogs methods
        this.handleCreateToggle = this.handleCreateToggle.bind(this);
        //Bind files methods
        this.handleFileCreate = this.handleFileCreate.bind(this);
        this.handleFileDelete = this.handleFileDelete.bind(this);
        this.handleFileOpen = this.handleFileOpen.bind(this);
        this.updateContent = this.updateContent.bind(this);
        //this.forceFileChange = this.forceFileChange.bind(this);
    }
    //Component dod mount --> set tab content
    componentDidMount() {
        return this.updateContent();
    }
    //Component did update --> update tab content
    componentDidUpdate() {
        //return this.updateContent();
    }
    //Handle run click
    handleRun() {
        return this.runSandbox();
    }
    //Handle file create dialog toggle
    handleCreateToggle() {
        return this.setState({
            "showCreateDialog": !this.state.showCreateDialog
        });
    }
    //Handle file create submit --> create the new file
    handleFileCreate(file) {
        let self = this;
        //Get the current sandbox data and add the new file
        return this.getSandbox().then(function (sandbox) {
            sandbox.files[file.name] = createSandboxFile(file.type, "");
            //Update the sandbox and open the new file
            return self.props.onChange(sandbox, function () {
                let newState = {
                    "showCreateDialog": false,
                    "currentFile": file.name
                };
                return self.setState(newState, function () {
                    return self.updateContent();
                });
            });
        });
    }
    //Handle file delete --> show dialog to delete the file
    handleFileDelete(file) {
        let self = this;
        return deleteFileDialog(file, function () {
            return self.getSandbox().then(function (sandbox) {
                //Delete the file from this sandbox
                delete sandbox.files[file];
                //Update the sandbox and open the new file
                return self.props.onChange(sandbox, function () {
                    //Check if the current file is not the removed file
                    if (file !== self.state.currentFile) {
                        return null; //Nothing to do
                    }
                    //Change the current file --> display the first one instead
                    //let newFile = Object.keys(sandbox.files)[0];
                    return self.setState({"currentFile": sandbox.main}, function () {
                        return self.updateContent();
                    });
                });
            });
        });
    }
    //Handle file open --> save content and open this file
    handleFileOpen(newFile) {
        let self = this;
        //Check if we are trying to open the current file
        if (this.state.currentFile === newFile) {
            return null;
        }
        //Update the sandbox before opening the file
        return this.getSandbox().then(function (sandbox) {
            return self.props.onChange(sandbox, function () {
                return self.setState({"currentFile": newFile}, function () {
                    return self.updateContent();
                });
            });
        });
    }
    //Update content
    updateContent() {
        let name = this.state.currentFile; //Get current file name
        let sandbox = this.props.sandbox; //Get sandbox
        //Check for schema tab --> set schema value
        //if (this.state.tab === "schema") {
        //    this.ref.editor.current.setValue(sandbox.schema);
        //}
        ////Check for readme tab --> set readme value
        //else if (this.state.tab === "readme" && typeof sandbox.readme === "string") {
        //    this.ref.readme.current.setValue(sandbox.readme);
        //}
        //Update file content
        let content = sandbox.files[name].content; //Get current content
        this.ref.editor.current.setValue(decodeSandboxFile(content));
    }
    //Run sandbox
    runSandbox(cb) {
        let self = this;
        let rendered = false;
        //let sandbox = this.getSandbox(); //Get current sandbox state
        //Update the state before running the sandbox
        return this.setState({"running": true}, function () {
            return self.getSandbox().then(function (sandbox) {
                return self.ref.explore.current.run(sandbox, self.state.currentFile);
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
        let currentFile = this.state.currentFile; //Get current file
        let sandbox = Object.assign({}, this.props.sandbox); //Get current sandbox
        //Save the current file content
        sandbox.files[currentFile].content = encodeSandboxFile(this.ref.editor.current.getValue());
        //Check if sandbox is not rendered --> do not update the thumbnail
        if (this.state.rendered === false) {
            return Promise.resolve(sandbox); //Return a promise with the sandbox
        }
        //Generate the thumbnail
        return this.getThumbnail(200).then(function (data) {
            //console.log(data); //Thumbnail in image-url format
            return Object.assign(sandbox, {
                "thumbnail": data
            });
        });
    }
    //Generate a sandbox thumbnail
    getThumbnail(maxWidth) {
        let self = this;
        //Get the list of displayed viewers
        let viewers = Object.keys(this.ref.explore.current.viewer).map(function (key) {
            return self.ref.explore.current.viewer[key];
        });
        //TODO: at this momment we are only to generate the thumbnail of the first viewer
        let width = viewers[0].context.draw.width.value; //Get plot width
        let scale = (width < maxWidth) ? 1 : maxWidth / width; //Get scale factor
        return viewers[0].toImageUrl("png", scale);
    }
    //Render the editor page
    render() {
        let self = this;
        let state = this.state;
        let sandbox = this.props.sandbox; //Get current sandbox state
        return (
            <div className="siimple--flex" style={{"width":"100%","height":"100%"}}>
                <Renderer render={function () {
                    return React.createElement(FilesPanel, {
                        "sandbox": self.props.sandbox,
                        "visible": self.props.showFilesPanel,
                        "currentFile": self.state.currentFile,
                        "onFileClick": self.handleFileOpen,
                        "onFileDelete": self.handleFileDelete,
                        "onCreate": self.handleCreateToggle
                    });
                }} />
                <SplitPanel split="vertical" resizeStyle={{"backgroundColor":"transparent"}}>
                    <SplitPanelItem primary defaultSize="50%" minSize="400px">
                        <Renderer render={function () {
                            let filename = self.state.currentFile;
                            let filetype = (typeof sandbox.files[filename] !== "undefined") ? sandbox.files[filename].type : "";
                            return React.createElement(EditorPanel, {
                                "ref": self.ref.editor,
                                "filename": filename,
                                "filetype": filetype,
                                "running": self.state.running,
                                "onRun": self.handleRun
                            });
                        }} />
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
                {/* Create a new file dialog */}
                <If condition={this.state.showCreateDialog} render={function () {
                    return React.createElement(CreateFile, {
                        "onClose": self.handleCreateToggle,
                        "onSubmit": self.handleFileCreate,
                        "sandbox": self.props.sandbox
                    });
                }} />
            </div>
        );
    }
}

//Editor default props
SandboxEditor.defaultProps = {
    "sandbox": {},
    "showFilesPanel": true
};

