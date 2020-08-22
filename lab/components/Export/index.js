import React from "react";

import {ForEach, If} from "@siimple/neutrine";
import {Btn} from "@siimple/neutrine";
import {Icon} from "@siimple/neutrine";
import {Modal, ModalHeader, ModalBody} from "@siimple/neutrine";
import {Placeholder, PlaceholderGroup} from "@siimple/neutrine";
import {Field, FieldLabel, FieldHelper} from "@siimple/neutrine";
import {Input} from "@siimple/neutrine";

import {exportSandbox} from "../../utils/sandbox.js";

//Export types
let exportTypes = {
    "schema": {"title": "Export as JSON Schema"},
    "sandbox": {"title": "Export as JSON Sandbox"}
};

//Generate the filename
let buildFilename = function (sandbox) {
    return sandbox.name.toLowerCase().replace(/\s/g, "-") + ".json";
};

//Download a file
let downloadFile = function (exportObj, exportName){
    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", data);
    downloadAnchorNode.setAttribute("download", exportName); // + ".json");
    document.body.appendChild(downloadAnchorNode); //Required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove(); //Remove element
};

//Export modal component
export class Export extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "type": "schema",
            "defaultFilename": buildFilename(props.sandbox)
        };
        //Referenced elements
        this.ref = {
            "filename": React.createRef()
        };
        //Bind methods
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getFilename = this.getFilename.bind(this);
    }
    //Get the filename
    getFilename() {
        return this.state.defaultFilename;
    }
    //Handle type change
    handleTypeChange(key) {
        return this.setState({"type": key});
    }
    //Handle submit
    handleSubmit() {
        let self = this;
        //Build export options
        let exportOptions = {
            "mode": this.state.type,
            "filename": this.getFilename()
        };
        //Handle export
        return exportSandbox(this.props.sandbox, exportOptions).then(function (content) {
            downloadFile(content, exportOptions.filename); //Download file
            return self.props.onClose();
        });
    }
    //Render the export component
    render() {
        let self = this;
        let typesList = Object.keys(exportTypes);
        return (
            <Modal width="500px">
                <ModalHeader title="Export as..." onClose={this.props.onClose} />
                <ModalBody style={{"backgroundColor":"#ffffff"}}>
                    {/* Export type */}
                    <PlaceholderGroup className="siimple--flex siimple--flex-row">
                        <ForEach items={typesList} render={function (key, index) {
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
                    {/* Filename */}
                    <Field>
                        <FieldLabel>File name</FieldLabel>
                        <Input type="text" ref={this.ref.filename} fluid placeholder={this.state.defaultFilename} />
                        <FieldHelper>Type the name of the exported file</FieldHelper>
                    </Field>
                    {/* Submit button */}
                    <Btn color="secondary" fluid onClick={this.handleSubmit}>
                        <strong>Export</strong>
                    </Btn>
                </ModalBody>
            </Modal>
        );
    }
}

