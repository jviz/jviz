import React from "react";
import {ForEach, If} from "neutrine/lib/components";
import {Alert} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {ModalWrapper, ModalBody, ModalFooter} from "neutrine/lib/components";
import {Media, MediaStart, MediaContent, MediaEnd} from "neutrine/lib/components";
import {Field, FieldLabel, FieldHelper} from "neutrine/lib/components";
import {Input, Label} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Placeholder, PlaceholderGroup} from "neutrine/lib/components";

//Available file types
let fileTypes = {
    "schema": {"name": "Jviz Schema", "icon": "code"},
    "data": {"name": "JSON Data", "icon": "file"}
};

//Create a new file
export class CreateFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "error": "",
            "currentType": this.props.fileTypes[0]
        };
        //Referenced elements
        this.ref = {
            "name": React.createRef(),
            "description": React.createRef()
        };
        //Bind methods
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //Handle type change
    handleTypeChange(newType) {
        return this.setState({"currentType": newType});
    }
    //Handle sandbox update
    handleSubmit() {
        //Check for no filename provided
        if (this.ref.name.current.value.trim() === "") {
            return this.setState({"error": "You should provide a valid name for your file."});
        }
        let name = this.ref.name.current.value.trim() + ".json";
        if (typeof this.props.sandbox.files[name] !== "undefined") {
            return this.setState({
                "error": `There is a file with the name '${name}' in your sandbox.`
            });
        }
        //Create the file
        return this.props.onSubmit({
            "type": this.state.currentType,
            "name": name
        });
    }
    //Render sandbox configuration menu
    render() {
        let self = this;
        let sandbox = this.props.sandbox;
        return (
            <ModalWrapper size="small" title="Create file" onClose={this.props.onClose}>
                <ModalBody className="siimple--bg-light1">
                    {/* Error creating the file */}
                    <If condition={this.state.error.length > 0}>
                        <Alert color="error" align="center">
                            <strong>{this.state.error}</strong>
                        </Alert>
                    </If>
                    {/* File type */}
                    <PlaceholderGroup className="siimple--flex">
                        <ForEach items={this.props.fileTypes} render={function (type) {
                            let item = fileTypes[type]; //Get file type info
                            let active = self.state.currentType === type; //Type active
                            let onClick = function () {
                                return self.handleTypeChange(type);
                            };
                            return (
                                <Placeholder key={type} onClick={onClick} active={active} align="center" border="solid">
                                    <Icon icon={item.icon} size="30px" className="siimple--mb-1" />
                                    <div className="siimple--text-bold">{item.name}</div>
                                </Placeholder>
                            );
                        }} />
                    </PlaceholderGroup>
                    {/* File name */}
                    <Field>
                        <FieldLabel>File name</FieldLabel>
                        <Media className="siimple--mb-0">
                            <MediaContent>
                                <Input type="text" ref={this.ref.name} fluid placeholder="new-file" />
                            </MediaContent>
                            <MediaEnd>
                                <Label>.json</Label>
                            </MediaEnd>
                        </Media>
                        <FieldHelper>
                            Type the name or your new file. 
                            The file extension will be added for you, so please do not add the <strong>.json</strong> extension.
                        </FieldHelper>
                    </Field>
                </ModalBody>
                <ModalFooter className="siimple--bg-light1 siimple--pt-0">
                    <Btn color="success" fluid onClick={this.handleSubmit}>
                        <strong>Create file</strong>
                    </Btn>
                </ModalFooter>
            </ModalWrapper>
        );
    }
}

//Create file default props
CreateFile.defaultProps = {
    "fileTypes": ["schema", "data"]
};

