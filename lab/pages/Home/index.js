import React from "react";
import kofi from "kofi";

import {If, ForEach} from "@siimple/neutrine";
import {Content} from "@siimple/neutrine";
import {Row, Column} from "@siimple/neutrine";
import {Btn} from "@siimple/neutrine";
import {Spinner} from "@siimple/neutrine";
import {Tabs, TabsItem} from "@siimple/neutrine";

import {ListSandboxes} from "../../components/ListSandboxes/index.js";
import {Splash} from "../../components/Splash/index.js";
import {loadLocalSandboxes, loadRemoteSandboxes} from "../../utils/sandbox.js";
import {redirect, redirectToSandbox} from "../../utils/redirect.js";
import style from "./style.scss";

//Available tabs items
let tabsList = {
    "local": {"mode": "local", "title": "Your sandboxes"},
    "examples": {"mode": "examples", "title": "Examples", "remote": "/examples.json"}
};

//Export home page
export class HomePage extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "loading": true,
            "mode": "local",
            "sandboxes": []
        };
        //Bind methods
        this.loadSandboxes = this.loadSandboxes.bind(this);
        this.handleModeChange = this.handleModeChange.bind(this);
        this.handleSandboxClick = this.handleSandboxClick.bind(this);
        this.handleNewClick = this.handleNewClick.bind(this);
    }
    //Component did mount --> import sandboxes
    componentDidMount() {
        return this.loadSandboxes();
    }
    //Load sandboxes
    loadSandboxes() {
        let self = this;
        let newState = {
            "loading": true,
            "sandboxes": []
        };
        //Update the state for displaying the loading splash
        return this.setState(newState, function () {
            return kofi.delay(500).then(function () {
                let mode = self.state.mode;
                //Check for remote sandboxes
                if (typeof tabsList[mode].remote === "string") {
                    return loadRemoteSandboxes(tabsList[mode].remote);
                }
                //No rmeote sandboxes --> load local sandboxes
                return loadLocalSandboxes();
            }).then(function (sandboxes) {
                return self.setState({
                    "loading": false,
                    "sandboxes": sandboxes
                });
            }).catch(function (error) {
                console.error(error);
            });
        });
    }
    //Handle mode change --> changed sandboxes displayed
    handleModeChange(newMode) {
        let self = this;
        if (this.state.mode === newMode || this.state.loading) {
            return null; //Pending action --> nothing to do
        }
        //Update the sandboxes mode
        return this.setState({"mode": newMode}, function () {
            return self.loadSandboxes();
        });
    }
    //Handle sandbox click ---> open this sandbox in the editor
    handleSandboxClick(item) {
        if (item.remote === true) {
            return redirectToSandbox("url", item.url);
        }
        //Open as local sandbox
        return redirectToSandbox("sandbox", item.id);
    }
    //Handle new sandbox click --> create a new sandbox
    handleNewClick() {
        return redirect("/new");
    }
    //Render home page
    render() {
        let self = this;
        let hasSandboxes = this.state.sandboxes.length > 0; // && this.state.loading === false;
        return (
            <Content size="xlarge">
                <Row className="siimple--mb-0">
                    {/* Left column --> presentation and links */}
                    <Column align="center">
                        <div className={style.title}>
                            <strong>jviz</strong>lab
                        </div>
                        {/* Create a new sandbox */}
                        <div className="siimple--mt-5" align="center">
                            <Btn color="light" onClick={this.handleNewClick}>
                                Create a new <strong>sandbox</strong>
                            </Btn>
                        </div>
                    </Column>
                    {/* Right column --> content */}
                    <Column>
                        {/* Display tabs */}
                        <Tabs className="siimple--mb-3">
                            <ForEach items={Object.keys(tabsList)} render={function (key, index) {
                                let item = tabsList[key];
                                return React.createElement(TabsItem, {
                                    "active": self.state.mode === key,
                                    "onClick": function () {
                                        return self.handleModeChange(key);
                                    },
                                    "key": index
                                }, item.title);
                            }} />
                        </Tabs>
                        {/* Loading sandboxes */}
                        <If condition={this.state.loading}>
                            <Splash icon={null}>
                                <Spinner className="siimple--mb-2" color="dark" />
                                <div className="siimple--text-bold" align="center">
                                    Loading sandboxes...
                                </div>
                            </Splash>
                        </If>
                        {/* List sandboxes */}
                        <If condition={!this.state.loading} render={function () {
                            return React.createElement(ListSandboxes, {
                                "sandboxes": self.state.sandboxes,
                                "onClick": self.handleSandboxClick
                            });
                        }} />
                    </Column>
                </Row>
            </Content>
        );
    }
}

