import React from "react";
import kofi from "kofi";
import {If, Renderer} from "neutrine/lib/components";

import {Splash} from "../../components/Splash/index.js";
import {SandboxConfig} from "../../components/SandboxConfig/index.js";
import {SandboxExport} from "../../components/SandboxExport/index.js";
import {SandboxHeader} from "../../components/SandboxHeader/index.js";
import {SandboxEditor} from "../../components/SandboxEditor/index.js";
import {getLocalSandbox, updateLocalSandbox, deleteLocalSandbox} from "../../utils/sandbox.js";
import {getRemoteSandbox} from "../../utils/sandbox.js";
import {createSandbox, parseSandbox} from "../../utils/sandbox.js";
import {redirect, redirectToSandbox} from "../../utils/redirect.js";
import style from "./style.scss";

//Generate a dialog to delete the sandbox
let deleteSandboxDialog = function (cb) {
    //Display a confirmation dialog
    return window.confirm.show({
        "title": "Delete sandbox",
        "content": "This will remove this sandbox from your computer. This action can not be undone. Continue?",
        "onConfirm": cb,
        "confirmText": "Yes, delete",
        "cancelText": "Cancel"
    });
};

//Export sandbox editor component
export class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "loading": true, 
            "configVisible": false,
            "exportVisible": false,
            "local": false,
            "sandbox": {}
        };
        //Referenced elements
        this.ref = {
            "editor": React.createRef()
        };
        //Bind sandbox management methods
        this.loadSandbox = this.loadSandbox.bind(this);
        this.saveSandbox = this.saveSandbox.bind(this);
        this.updateSandbox = this.updateSandbox.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        //this.handleExport = this.handleExport.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleConfigToggle = this.handleConfigToggle.bind(this);
        this.handleExportOpen = this.handleExportOpen.bind(this);
        this.handleExportClose = this.handleExportClose.bind(this);
    }
    //Component did mount
    componentDidMount() {
        return this.loadSandbox();
    }
    //Save a sandbox
    saveSandbox(sandbox, forceSave) {
        if (this.state.local === false && forceSave !== true) {
            return Promise.resolve(sandbox); //Do not save the sandbox
        }
        //Update the sandbox
        return updateLocalSandbox(sandbox);
    }
    //Update sandbox with new data
    updateSandbox(newData, callback) {
        let self = this;
        //let sandbox = null; //Object.assign(this.ref.editor.current.getSandbox(), newData);
        return this.ref.editor.current.getSandbox().then(function (sandbox) {
            sandbox = Object.assign(sandbox, newData); //Update sandbox data
            //Save new sandbox data
            return self.setState({"sandbox": sandbox}, function () {
                return self.saveSandbox(sandbox, false).then(function () {
                    window.toast.success({"message": "Sandbox saved"}); //Display confirmation
                    if (typeof callback === "function") {
                        return callback();
                    }
                });
            });
        });
    }
    //Load a sandbox
    loadSandbox() {
        let self = this;
        let isLocalSandbox = false; //To save if this sandbox is stored in local
        let params = this.props.request.query;
        //Update the state before start loading the sandbox
        return this.setState({"loading": true}, function () {
            return kofi.delay(1000).then(function () {
                //Check for url sandbox
                if (typeof params.url === "string") {
                    return getRemoteSandbox(decodeURIComponent(params.url));
                }
                //Check for sandbox id
                else if (typeof params.sandbox === "string") {
                    isLocalSandbox = true; //Local sandbox
                    return getLocalSandbox(decodeURIComponent(params.sandbox));
                }
                //Other --> unknown sandbox source
                return Promise.reject(new Error("Unknown sandbox source"));
            }).then(function (newSandbox) {
                console.log(newSandbox); //Only for debugging
                if (newSandbox === null || typeof newSandbox === "undefined") {
                    return Promise.reject(new Error("Sandbox not found"));
                }
                //Save the sandbox
                return self.setState({
                    "loading": false, 
                    "local": isLocalSandbox,
                    "sandbox": createSandbox(newSandbox)
                });
            }).catch(function (error) {
                console.error(error);
                //TODO: threat error
                return null;
            });
        });
    }
    //Handle editor exit
    handleExit() {
        let self = this;
        //let sandbox = this.ref.editor.current.getSandbox();
        this.ref.editor.current.getSandbox().then(function (sandbox) {
            return self.saveSandbox(sandbox, false).then(function () {
                return redirect("/");
            });
        });
    }
    //Handle delete sandbox
    handleDelete() {
        let self = this;
        let sandbox = this.state.sandbox; //Get sandbox
        //Check for no local sandbox --> do not remove it
        if (this.state.local === false) {
            return; //You can not delete a non-local sandbox
        }
        //Didsplay the delete dialog
        return deleteSandboxDialog(function () {
            return deleteLocalSandbox(sandbox.id).then(function () {
                window.toast.success({"message": "Sandbox removed"}); //Display confirmation
                return redirect("/"); //Redirect to home
            });
        });
    }
    //Handle save
    handleSave() {
        let self = this;
        //let sandbox = this.ref.editor.current.getSandbox();
        this.ref.editor.current.getSandbox().then(function (sandbox) {
            //Check for local sandbox ---> save it without asking
            if (self.state.local === true) {
                return self.saveSandbox(sandbox, false).then(function (newSandbox) {
                    window.toast.success({"message": "Sandbox saved"});
                    return self.setState({"sandbox": newSandbox});
                });
            }
            //No local sandbox --> ask for saving as a new local sandbox
            return window.confirm.show({
                "title": "Clone and save sandbox",
                "content": "You can not save a remote sandbox. Do you want to create a local clone of this sandbox?",
                "onConfirm": function () {
                    let newSandbox = Object.assign(createSandbox(sandbox), {
                        "readonly": false, //Disable readonly
                        "created_at": Date.now() //Update the sandbox creation date
                    });
                    return self.saveSandbox(sandbox, true).then(function () {
                        window.toast.success({"message": "Sandbox cloned"}); //Show confirmation toast
                        let newState = {
                            "sandbox": newSandbox,
                            "local": true
                        };
                        return self.setState(newState, function () {
                            return redirectToSandbox("sandbox", newSandbox.id);
                        });
                    });
                },
                "confirmText": "Yes, create a clone"
            });
        });
    }
    //Handle export view open
    handleExportOpen() {
        let self = this;
        return this.ref.editor.current.getSandbox().then(function (sandbox) {
            return self.setState({
                "sandbox": sandbox,
                "exportVisible": true
            });
        });
    }
    //Handle export close
    handleExportClose() {
        return this.setState({"exportVisible": false});
    }
    //Handle config modal toggle
    handleConfigToggle() {
        return this.setState({
            "configVisible": !this.state.configVisible
        });
    }
    //Handle sandbox metadata update
    handleUpdate(newData) {
        let self = this;
        if (this.state.local === false) {
            return null; //Not local sandbox --> disable metadata update
        }
        //Update the sandbox and hide config modal
        return this.updateSandbox(newData, function () {
            return self.setState({"configVisible": false});
        });
    }
    //Handle sandbox change
    handleChange(newSandbox, callback) {
        let self = this;
        //return this.setState({"sandbox": newSandbox}, function () {
        //    return callback();
        //});
        return this.saveSandbox(newSandbox, false).then(function () {
            return self.setState({"sandbox": newSandbox}, function () {
                return callback();
            });
        });
    }
    //Render the editor
    render() {
        let self = this;
        //Check for loading --> display the loading animation
        if (this.state.loading === true) {
            return React.createElement(Splash, {});
        }
        console.log("---> update editor");
        //Render the editor panels
        return (
            <div className={style.root}>
                {/* Sandbox header */}
                <div className={style.header}>
                    <Renderer render={function () {
                        return React.createElement(SandboxHeader, {
                            "sandbox": self.state.sandbox,
                            //"menuActive": self.state.menuVisible,
                            "onLogoClick": self.handleExit,
                            "onSaveClick": self.handleSave,
                            "onExportClick": self.handleExportOpen,
                            "onConfigClick": self.handleConfigToggle,
                            "onDeleteClick": self.handleDelete
                        });
                    }} />
                </div>
                {/* Sandbox editor */}
                <div className={style.editor}>
                    <Renderer render={function () {
                        return React.createElement(SandboxEditor, {
                            "ref": self.ref.editor,
                            "sandbox": self.state.sandbox,
                            "onChange": self.handleChange
                        });
                    }} />
                </div>
                {/* Config sandbox modal */}
                <If condition={this.state.configVisible} render={function () {
                    return React.createElement(SandboxConfig, {
                        "onClose": self.handleConfigToggle,
                        "onSubmit": self.handleUpdate,
                        "sandbox": self.state.sandbox,
                        "localSandbox": self.state.local
                    });
                }} />
                {/* Export sandbox modal */}
                <If condition={this.state.exportVisible} render={function () {
                    return React.createElement(SandboxExport, {
                        "sandbox": self.state.sandbox,
                        "onClose": self.handleExportClose
                    });
                }} />
            </div>
        );
    }
}

//Sandbox editor default props
EditorPage.defaultProps = {};

