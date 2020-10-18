import React from "react";
import {ForEach, If} from "neutrine/lib/components";
import {Alert} from "neutrine/lib/components";
import {Rule} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {ModalWrapper, ModalBody, ModalFooter} from "neutrine/lib/components";
import {Field, FieldLabel, FieldHelper} from "neutrine/lib/components";
import {Input, Textarea, Select} from "neutrine/lib/components";
//import {FakeSwitch, Label} from "neutrine/lib/components";

//Parse the list of run schemas
let parseRunSchemas = function (value) {
    let items = {}; //Available files
    value.trim().split(",").forEach(function (name) {
        name = name.trim();
        if (name.length > 0) {
            items[name] = true;
        }
    });
    //Return unique files
    return Object.keys(items);
};

//Export sandbox config window
export class SandboxConfig extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "error": ""
        };
        //Referenced elements
        this.ref = {
            "name": React.createRef(),
            "description": React.createRef(),
            "main": React.createRef(),
            "run": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //Handle sandbox update
    handleSubmit() {
        let sandbox = this.props.sandbox;
        let runConfig = parseRunSchemas(this.ref.run.current.value);
        if (runConfig.length > 0) {
            for (let i = 0; i < runConfig.length; i++) {
                let name = runConfig[i]; //Get file
                //Check for not found file --> display error
                if (typeof sandbox.files[name] === "undefined") {
                    return this.setState({
                        "error": `Error in run config: unknown file '${name}'.`
                    });
                }
                //Check for not schema file --> display error
                if (sandbox.files[name].type !== "schema") {
                    return this.setState({
                        "error": `Error in run config: the file '${name}' is not a valid schema file.`
                    });
                }
            }
        }
        //Submit the new sandbox configuration
        return this.props.onSubmit({
            "name": this.ref.name.current.value,
            "description": this.ref.description.current.value,
            "main": this.ref.main.current.value,
            "runConfig": runConfig.length > 0 ? runConfig : null
        });
    }
    //Render sandbox configuration menu
    render() {
        let sandbox = this.props.sandbox;
        let local = this.props.localSandbox;
        let initialRun = Array.isArray(sandbox.runConfig) ? sandbox.runConfig.join(", ") : "";
        return (
            <ModalWrapper size="small" title="Configure sandbox" onClose={this.props.onClose}>
                <ModalBody className="siimple--bg-light1 siimple--pb-0">
                    {/* display error */}
                    <If condition={this.state.error.length > 0}>
                        <Alert color="error" align="center">
                            <strong>{this.state.error}</strong>
                        </Alert>
                    </If>
                    {/* Sandbox name */}
                    <Field className="siimple--mb-2">
                        <FieldLabel>Sandbox name</FieldLabel>
                        <Input type="text" ref={this.ref.name} fluid defaultValue={sandbox.name} disabled={!local} />
                        <FieldHelper>Name or your sandbox</FieldHelper>
                    </Field>
                    {/* Sandbox description */}
                    <Field className="siimple--mb-2">
                        <FieldLabel>Sandbox description</FieldLabel>
                        <Textarea ref={this.ref.description} fluid defaultValue={sandbox.description} disabled={!local} />
                        <FieldHelper>Description or your sandbox</FieldHelper>
                    </Field>
                    {/* Sandbox main file */}
                    <Field className="siimple--mb-2">
                        <FieldLabel>Main sandbox file</FieldLabel>
                        <Select ref={this.ref.main} fluid disabled={!local} defaultValue={sandbox.main}>
                            <ForEach items={Object.keys(sandbox.files)} render={function (file) {
                                return <option key={file} value={file}>{file}</option>;
                            }} />
                        </Select>
                        <FieldHelper>
                            The <strong>main file</strong> is considered the entrypoint file of your sandbox.
                            You can not delete the main file.
                        </FieldHelper>
                    </Field>
                    {/* Run configuration */}
                    <Field>
                        <FieldLabel>Customize run</FieldLabel>
                        <Input type="text" ref={this.ref.run} fluid defaultValue={initialRun} disabled={!local} />
                        <FieldHelper>
                            Provide a list of <strong>comma separated schemas</strong> to render when you click the run button.
                            If you keep this list empty, only the opened schema will be used for rendering.
                        </FieldHelper>
                    </Field>
                </ModalBody>
                <ModalFooter align="right" className="siimple--bg-light1">
                    {/* Update sandbox */}
                    <Btn color="secondary" fluid onClick={this.handleSubmit} disabled={!local}>
                        <strong>Update sandbox</strong>
                    </Btn>
                </ModalFooter>
            </ModalWrapper>
        );
    }
}

