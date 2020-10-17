import React from "react";
import {ForEach, If} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {ModalWrapper, ModalBody, ModalFooter} from "neutrine/lib/components";
import {Placeholder, PlaceholderGroup} from "neutrine/lib/components";
import {Field, FieldLabel, FieldHelper} from "neutrine/lib/components";
import {Input, Select, Switch, Label} from "neutrine/lib/components";

import {getSandboxFile} from "../../utils/sandbox.js";

//Export types
let exportTypes = {
    "sandbox": {"title": "Export full sandbox"},
    "schema": {"title": "Export schema"}
};

//Generate the filename
let buildFilename = function (sandbox) {
    return sandbox.name.toLowerCase().replace(/\s/g, "-") + ".json";
};

//Download a file
let downloadFile = function (content, name){
    let data = "data:text/json;charset=utf-8," + encodeURIComponent(content);
    let downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", data);
    downloadAnchorNode.setAttribute("download", name); // + ".json");
    document.body.appendChild(downloadAnchorNode); //Required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove(); //Remove element
};

//Export modal component
export class SandboxExport extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "type": "sandbox"
        };
        //Referenced elements
        this.ref = {
            "sandboxName": React.createRef(),
            "schemaFile": React.createRef(),
            "schemaJoinData": React.createRef()
        };
        //Bind methods
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //Handle type change
    handleTypeChange(key) {
        return this.setState({"type": key});
    }
    //Handle submit
    handleSubmit() {
        let self = this;
        let sandbox = this.props.sandbox;
        let exportPromise = null; //Promise to get data to export
        //Check for exporting full sandbox
        if (this.state.type === "sandbox") {
            exportPromise = Promise.resolve({
                "content": JSON.stringify(sandbox),
                "name": this.ref.sandboxName.current.value
            });
        }
        //Check for exporting individual schema
        else if (this.state.type === "schema") {
            let file = this.ref.schemaFile.current.value; //File to export
            exportPromise = Promise.resolve({
                "content": getSandboxFile(sandbox, file),
                "name": file
            });
        }
        //Handle export
        return exportPromise.then(function (options) {
            downloadFile(options.content, options.name);
            return self.props.onClose(); //Close export dialog
        });
    }
    //Render sandbox export options
    renderSandboxExport() {
        let self = this;
        let defaultName = buildFilename(this.props.sandbox);
        return (
            <React.Fragment>
                {/* Sandbox output name */}
                <Field>
                    <FieldLabel>File name</FieldLabel>
                    <Input type="text" ref={this.ref.sandboxName} fluid defaultValue={defaultName} />
                    <FieldHelper>Type the name of the exported file</FieldHelper>
                </Field>
            </React.Fragment>
        );
    }
    //Render schema export options
    renderSchemaExport() {
        let self = this;
        let files = Object.keys(this.props.sandbox.files).filter(function (file) {
            return self.props.sandbox.files[file].type === "schema";
        });
        return (
            <React.Fragment>
                {/* Schema to export */}
                <Field>
                    <FieldLabel>Schema to export</FieldLabel>
                    <Select fluid ref={this.ref.schemaFile} defaultValue={files[0]}>
                        <ForEach items={files} render={function (file) {
                            return <option value={file} key={file}>{file}</option>;
                        }} />
                    </Select>
                    <FieldHelper>Select a schema from your sandbox to export</FieldHelper>
                </Field>
            </React.Fragment>
        );
    }
    //Render the export component
    render() {
        let self = this;
        let types = Object.keys(exportTypes);
        return (
            <ModalWrapper size="small" title="Export sandbox" onClose={this.props.onClose}>
                <ModalBody className="siimple--bg-light1">
                    {/* Export type */}
                    <PlaceholderGroup className="siimple--flex siimple--flex-row">
                        <ForEach items={types} render={function (key, index) {
                            let type = exportTypes[key];
                            let onClick = function () {
                                return self.handleTypeChange(key);
                            };
                            let isActive = key === self.state.type; //Type is active
                            let border = (isActive) ? "solid" : "dashed";
                            return (
                                <Placeholder key={index} onClick={onClick} hover active={isActive} border={border}>
                                    <div className="siimple--text-bold">{type.title}</div>
                                </Placeholder>
                            );
                        }} />
                    </PlaceholderGroup>
                    {/* Render sandbox export options */}
                    <If condition={this.state.type === "sandbox"} render={function () {
                        return self.renderSandboxExport();
                    }} />
                    {/* Render schema export options */}
                    <If condition={this.state.type === "schema"} render={function () {
                        return self.renderSchemaExport();
                    }} />
                </ModalBody>
                {/* Submit export */}
                <ModalFooter className="siimple--pt-0 siimple--bg-light1">
                    <Btn color="secondary" fluid onClick={this.handleSubmit}>
                        <strong>Export</strong>
                    </Btn>
                </ModalFooter>
            </ModalWrapper>
        );
    }
}

