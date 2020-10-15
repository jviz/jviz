import React from "react";
import kofi from "kofi";

import {If} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";
import {Input} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Field, FieldLabel, FieldHelper} from "neutrine/lib/components";

import {createSandbox, saveLocalSandbox} from "../../utils/sandbox.js";
import {redirect, redirectToSandbox} from "../../utils/redirect.js";

//Export new sandbox creator page
export class NewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        //Referenced elements
        this.ref = {
            "name": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //Handle submit --> create the new sandbox
    handleSubmit() {
        let self = this;
        return this.setState({"loading": true}, function () {
            //let newSandbox = createSandbox({}); //Create a new sandbox
            return kofi.delay(1000).then(function () {
                return saveLocalSandbox(createSandbox({
                    "name": self.ref.name.current.value.trim()
                }));
            }).then(function (newSandbox) {
                //console.log("sandbox created");
                return redirectToSandbox("sandbox", newSandbox.id);
            });
        });
    }
    //Render the new sandbox page
    render() {
        return (
            <Content size="small">
                {/* New sandbox name */}
                <Field>
                    <FieldLabel>Sandbox name</FieldLabel>
                    <Input type="text" fluid ref={this.ref.name} defaultValue="New sandbox" />
                    <FieldHelper>Name of your new sandbox</FieldHelper>
                </Field>
                {/* Create the sandbox */}
                <div align="center">
                    <If condition={this.state.loading} render={function () {
                        return React.createElement(Spinner, {"color": "primary"});
                    }} />
                    <If condition={!this.state.loading}>
                        <Btn fluid color="success" onClick={this.handleSubmit}>
                            <strong>Create sandbox</strong>
                        </Btn>
                    </If>
                </div>
            </Content>
        );
    }
}

