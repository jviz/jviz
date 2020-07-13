import React from "react";
import kofi from "kofi";
import {If, Renderer} from "@siimple/neutrine";
import {Spinner} from "@siimple/neutrine";
import {Toolbar, ToolbarWrapper} from "@siimple/neutrine";
import {Field, FieldLabel, FieldHelper} from "@siimple/neutrine";
import {Input, Textarea} from "@siimple/neutrine";
import {Btn} from "@siimple/neutrine";
import {Rule} from "@siimple/neutrine";
import {Tip} from "@siimple/neutrine";

import {Export} from "../../components/Export/index.js";
import {Splash} from "../../components/Splash/index.js";
import {SandboxHeader} from "../../components/SandboxHeader/index.js";
import {SandboxEditor} from "../../components/SandboxEditor/index.js";
import {getLocalSandbox, updateLocalSandbox, deleteLocalSandbox} from "../../utils/sandbox.js";
import {getRemoteSandbox} from "../../utils/sandbox.js";
import {createSandbox, parseSandbox} from "../../utils/sandbox.js";
import {redirect, redirectToSandbox} from "../../utils/redirect.js";
import style from "./style.scss";

//Export sandbox editor component
export class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "loading": true, 
            "menuVisible": false,
            "exportVisible": false,
            "local": false,
            "sandbox": {}
        };
        //Referenced elements
        this.ref = {
            "editor": React.createRef(),
            "sandboxName": React.createRef(),
            "sandboxDescription": React.createRef()
        };
        //Bind sandbox management methods
        this.loadSandbox = this.loadSandbox.bind(this);
        this.saveSandbox = this.saveSandbox.bind(this);
        this.updateSandbox = this.updateSandbox.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleExportClose = this.handleExportClose.bind(this);
        this.handleMenuToggle = this.handleMenuToggle.bind(this);
        this.handleUpdateMetadataClick = this.handleUpdateMetadataClick.bind(this);
        this.handleSandboxUpdate = this.handleSandboxUpdate.bind(this);
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
    updateSandbox(newData) {
        let self = this;
        let sandbox = Object.assign(this.ref.editor.current.getSandbox(), newData);
        //Save new sandbox data
        return this.setState({"sandbox": sandbox}, function () {
            return self.saveSandbox(sandbox, false).then(function () {
                return window.toast.success({"message": "Sandbox saved"});
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
        let sandbox = this.ref.editor.current.getSandbox();
        return this.saveSandbox(sandbox, false).then(function () {
            return redirect("/");
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
        //Display a confirmation dialog
        return window.confirm.show({
            "title": "Delete sandbox",
            "content": "This will remove this sandbox from your computer. Continue?",
            "onConfirm": function () {
                return deleteLocalSandbox(sandbox.id).then(function () {
                    window.toast.success({"message": "Sandbox removed"}); //Display confirmation
                    return redirect("/"); //Redirect to home
                });
            },
            "confirmText": "Yes, delete",
            "cancelText": "Cancel"
        });
    }
    //Handle save
    handleSave() {
        let self = this;
        let sandbox = this.ref.editor.current.getSandbox();
        //Check for local sandbox ---> save it without asking
        if (this.state.local === true) {
            return this.saveSandbox(sandbox, false).then(function (newSandbox) {
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
    }
    //Handle export
    handleExport() {
        return this.setState({
            "sandbox": this.ref.editor.current.getSandbox(),
            "exportVisible": true
        });
    }
    //Handle export close
    handleExportClose() {
        return this.setState({
            "exportVisible": false
        });
    }
    //Handle menu toggle
    handleMenuToggle() {
        return this.setState({
            "menuVisible": !this.state.menuVisible
        });
    }
    //Handle sandbox metadata update
    handleUpdateMetadataClick() {
        if (this.state.local === false) {
            return null; //Not local sandbox --> disable metadata update
        }
        //Update the sandbox
        return this.updateSandbox({
            "name": this.ref.sandboxName.current.value.trim(),
            "description": this.ref.sandboxDescription.current.value.trim()
        });
    }
    //Handle sandbox update
    handleSandboxUpdate(newSandbox, callback) {
        return this.setState({"sandbox": newSandbox}, function () {
            return callback();
        });
    }
    //Render loading screen
    renderLoadingScreen() {
        return (
            <Splash icon={null}>
                <div align="center" className="siimple--mb-2">
                    <Spinner color="dark" />
                </div>
                <div className="siimple--mt-0">
                    <strong>Building your workspace...</strong>
                </div>
            </Splash>
        );
    }
    //Render sandbox menu
    renderMenu() {
        let self = this;
        let sandbox = this.state.sandbox;
        let local = this.state.local; //Get local sandbox
        return (
            <React.Fragment>
                {/* Sandbox metadata */}
                <div className="siimple--mb-4">
                    {/* Sandbox name */}
                    <Field style={{"fontSize":"14px"}} className="siimple--mb-2">
                        <FieldLabel>Sandbox name</FieldLabel>
                        <Input type="text" ref={this.ref.sandboxName} fluid defaultValue={sandbox.name} disabled={!local} />
                        <FieldHelper>Name or your sandbox</FieldHelper>
                    </Field>
                    {/* Sandbox description */}
                    <Field style={{"fontSize":"14px"}} className="siimple--mb-2">
                        <FieldLabel>Sandbox description</FieldLabel>
                        <Textarea ref={this.ref.sandboxDescription} fluid defaultValue={sandbox.description} disabled={!local} />
                        <FieldHelper>Description or your sandbox</FieldHelper>
                    </Field>
                    {/* Update sandbox data */}
                    <Field className="siimple--mb-0">
                        <Btn color="primary" small fluid onClick={this.handleUpdateMetadataClick} disabled={!local}>
                            <strong>Update metadata</strong>
                        </Btn>
                    </Field>
                </div>
                <Rule />
                {/* Delete this sandbox */}
                <div className="siimple--mt-4">
                    <Btn color="error" fluid small onClick={this.handleDelete} disabled={!local}>
                        <strong>Delete this sandbox</strong>
                    </Btn>
                    <FieldHelper>
                        This will remove this sandbox from your computer. This action <strong>can not be undone</strong>.
                    </FieldHelper>
                </div>
            </React.Fragment>
        );
    }
    //Render the editor
    render() {
        let self = this;
        //Check for loading --> display the loading animation
        if (this.state.loading === true) {
            return this.renderLoadingScreen();
        }
        console.log("---> update editor");
        //Render the editor panels
        return (
            <ToolbarWrapper collapsed={!this.state.menuVisible}>
                {/* Editor menu */}
                <Toolbar className="siimple--bg-gray0">
                    <If condition={this.state.menuVisible} render={function () {
                        return self.renderMenu();
                    }} />
                </Toolbar>
                <div className={style.root}>
                    {/* Sandbox header */}
                    <div className={style.header}>
                        <Renderer render={function () {
                            return React.createElement(SandboxHeader, {
                                "sandbox": self.state.sandbox,
                                "menuActive": self.state.menuVisible,
                                "onHomeClick": self.handleExit,
                                "onMenuClick": self.handleMenuToggle,
                                "onSaveClick": self.handleSave,
                                "onExportClick": self.handleExport
                            });
                        }} />
                    </div>
                    {/* Sandbox editor */}
                    <div className={style.editor}>
                        <Renderer render={function () {
                            return React.createElement(SandboxEditor, {
                                "ref": self.ref.editor,
                                "sandbox": self.state.sandbox,
                                "onSandboxUpdate": self.handleSandboxUpdate
                            });
                        }} />
                    </div>
                    {/* Export sandbox modal */}
                    <If condition={this.state.exportVisible} render={function () {
                        return React.createElement(Export, {
                            "sandbox": self.state.sandbox,
                            "onClose": self.handleExportClose
                        });
                    }} />
                </div>
            </ToolbarWrapper>
        );
    }
}

//Sandbox editor default props
EditorPage.defaultProps = {};

