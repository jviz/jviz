import React from "react";
import {ForEach, If} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {ModalWrapper, ModalBody, ModalFooter} from "neutrine/lib/components";
import {Field, FieldLabel, FieldHelper} from "neutrine/lib/components";
import {Input, Textarea, Select} from "neutrine/lib/components";

//Export sandbox config window
export class SandboxConfig extends React.Component {
    constructor(props) {
        super(props);
        //Referenced elements
        this.ref = {
            "name": React.createRef(),
            "description": React.createRef(),
            "main": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //Handle sandbox update
    handleSubmit() {
        return this.props.onSubmit({
            "name": this.ref.name.current.value,
            "description": this.ref.description.current.value,
            "main": this.ref.main.current.value
        });
    }
    //Render sandbox configuration menu
    render() {
        let sandbox = this.props.sandbox;
        let local = this.props.localSandbox;
        return (
            <ModalWrapper size="small" title="Configure sandbox" onClose={this.props.onClose}>
                <ModalBody className="siimple--bg-light1">
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
                </ModalBody>
                <ModalFooter align="right" className="siimple--bg-light1 siimple--pt-0">
                    {/* Update sandbox */}
                    <Btn color="success" fluid onClick={this.handleSubmit} disabled={!local}>
                        <strong>Update sandbox</strong>
                    </Btn>
                </ModalFooter>
            </ModalWrapper>
        );
    }
}

