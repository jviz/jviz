import React from "react";
import kofi from "kofi";

import {ForEach, Renderer} from "neutrine/lib/components";
import {Row, Column} from "neutrine/lib/components";
import {Label} from "neutrine/lib/components";
import {Range} from "neutrine/lib/components";
import {Select} from "neutrine/lib/components";

//Build initial state from props
let buildInitialStateFromProps = function (props) {
    let newState = {
        "names": []
    };
    let schema = props.getCurrentSchema(); //Get current schema
    let viewer = props.getCurrentViewer(); //Get current viewer
    if (schema === null || typeof schema["state"] === "undefined") {
        return newState; //No state variables
    }
    //Build each state variable
    schema["state"].forEach(function (item) {
        if (typeof item.bind !== "object" || item.bind === null) {
            return null; //Skip this variable
        }
        //Add this variable name
        newState.names.push(item.name);
        newState[item.name] = Object.assign({}, item.bind, {
            "defaultValue": viewer.state(item.name),
            "currentValue": viewer.state(item.name)
        });
    });
    //Return the initial state
    return newState;
};

//State bind renderer
let stateBindRender = {
    "range": function (ref, options, onChange) {
        return (
            <Row className="siimple--mb-0">
                <Column size="9" className="siimple--py-0">
                    <Renderer render={function () {
                        return React.createElement(Range, {
                            "ref": ref,
                            "style": {
                                "backgroundColor": "var(--siimple-light)",
                                "marginTop": "9px",
                                "marginBottom": "9px"
                            },
                            "min": options.min,
                            "max": options.max,
                            "step": options.step,
                            "defaultValue": options.defaultValue,
                            "onChange": onChange,
                            "fluid": true
                        });
                    }} />
                </Column>
                <Column size="3" align="right" className="siimple--py-0">
                    <Label>{options.currentValue}</Label>
                </Column>
            </Row>
        );
    },
    "select": function (ref, options, onChange) {
        return (
            <Select fluid ref={ref} onChange={onChange} defaultValue={options.defaultValue}>
                <ForEach items={options.values} render={function (item, index) {
                    return <option key={index} value={item}>{item}</option>;
                }} />
            </Select>
        );
    }
};

//State bind parser
let stateBindParse = {
    "range": function (ref, options) {
        return Number(ref.value);
    },
    "select": function (ref, options) {
        return ref.value;
    }
};

//Export state tab
export class ConsoleStateTab extends React.Component {
    constructor(props) {
        super(props);
        let self = this; //Save reference
        this.state = buildInitialStateFromProps(props); //Build state
        this.ref = {}; //Initialize referenced elements
        this.state.names.forEach(function (name) {
            self.ref[name] = React.createRef(); //Add reference
        });
        //Other references
        this.timmer = null;
        //Bind methods
        this.handleStateChange = this.handleStateChange.bind(this);
    }
    //Handle state change
    handleStateChange(name) {
        let self = this;
        //clearTimeout(this.timmer); //Clear the current timeout (if any)
        let options = this.state[name]; //Get state variable options
        let value = stateBindParse[options.type](this.ref[name].current, options); //Get value
        //console.log(`${name} ---> ${value}`);
        //Register the timeout method
        //this.timmer = kofi.delay(this.props.changeDelay, function () {
        //    return self.props.onChange(name, value); //Call the change method
        //});
        //Call the on-change event
        this.props.onChange(name, value);
        //Terrible hack to update the current value in range element
        if (options.type === "range") {
            this.state[name].currentValue = value;
            this.forceUpdate(); //Force update to display the value
        }
    }
    //Render
    render() {
        let self = this;
        //Check for empty state names --> no state variables to manage
        if (this.state.names.length === 0) {
            return "No state variables";
        }
        //Return the state viewer
        return (
            <ForEach items={this.state.names} render={function (name, index) {
                let options = self.state[name]; //Get options
                let ref = self.ref[name]; //Get referende
                //Render element
                let element = stateBindRender[options.type](ref, options, function () {
                    return self.handleStateChange(name);
                });
                return (
                    <Row key={index} className="siimple--mb-0 siimple--mr-0">
                        <Column size="4">
                            <Label>{name}</Label>
                        </Column>
                        <Column size="8">
                            {element}
                        </Column>
                    </Row>
                );
            }} />
        );
    }
}

//Default props
ConsoleStateTab.defaultProps = {
    "changeDelay": 1000
};


