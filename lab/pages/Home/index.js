import React from "react";
import kofi from "kofi";

import {If, ForEach, Renderer} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
//import {Row, Column} from "neutrine/lib/components";
import {Btn, Rule} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";
import {Nav, NavItem, NavGroup} from "neutrine/lib/components";
import {Navside} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Media, MediaContent, MediaEnd} from "neutrine/lib/components";
import {Input} from "neutrine/lib/components";

import {ListSandboxes} from "../../components/ListSandboxes/index.js";
//import {Splash} from "../../components/Splash/index.js";
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
        let title = tabsList[this.state.mode].title; //Get title
        return (
            <div className={style.root}>
                {/* Left column --> presentation and links */}
                <Navside>
                    {/* Editor title */}
                    <div className="siimple--mb-5" align="center">
                        <span className={style.title}>
                            <strong>jviz</strong>lab
                        </span>
                    </div>
                    {/* Display tabs sources links */}
                    <Nav vertical className="siimple--mb-3">
                        <NavGroup>Sandboxes</NavGroup>
                        <ForEach items={Object.keys(tabsList)} render={function (key, index) {
                            let item = tabsList[key];
                            return React.createElement(NavItem, {
                                ///"className": "siimple--pl-0 siimple--pr-0",
                                "active": self.state.mode === key,
                                "onClick": function () {
                                    return self.handleModeChange(key);
                                },
                                "key": index
                            }, item.title);
                        }} />
                    </Nav>
                    <Rule />
                    {/* Create a new sandbox */}
                    <Btn color="secondary" fluid onClick={this.handleNewClick}>
                        <strong>Create new</strong>
                    </Btn>
                </Navside>
                {/* Right column --> content */}
                <div style={{"flexGrow":"1"}}>
                    <Content size="medium">
                        {/* Title and filter */}
                        <Media className="siimple--mb-3">
                            <MediaContent>
                                <Heading type="h4" className="siimple--mb-0">{title}</Heading>
                            </MediaContent>
                            <MediaEnd>
                                <Input type="text" placeholder="Filter..." />
                            </MediaEnd>
                        </Media>
                        {/* Loading sandboxes */}
                        <If condition={this.state.loading}>
                            <div align="center" className="siimple--mt-8">
                                <Spinner className="siimple--mb-2" color="secondary" />
                                <div className="siimple--text-bold" align="center">
                                    Loading sandboxes...
                                </div>
                            </div>
                        </If>
                        {/* List sandboxes */}
                        <If condition={!this.state.loading} render={function () {
                            return React.createElement(ListSandboxes, {
                                "sandboxes": self.state.sandboxes,
                                "onClick": self.handleSandboxClick
                            });
                        }} />
                    </Content>
                </div>
            </div>
        );
    }
}

