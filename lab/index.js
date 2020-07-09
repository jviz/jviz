import React from "react";
import ReactDOM from "react-dom";
import * as Router from "rouct";
import kofi from "kofi";

import {createToaster} from "@siimple/neutrine";
import {createConfirmer} from "@siimple/neutrine";

import {HomePage} from "./pages/Home/index.js";
import {NewPage} from "./pages/New/index.js";
import {EditorPage} from "./pages/Editor/index.js";
import {initSandboxStorage} from "./utils/sandbox.js";
import "./style.scss";

//Main app component
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    //Render the app component
    render() {
        return (
            <Router.BrowserRouter>
                <Router.Switch>
                    <Router.Route path="/editor" exact component={EditorPage} />
                    <Router.Route path="/new" exact component={NewPage} />
                    <Router.Route path="/" exact component={HomePage} />
                </Router.Switch>
            </Router.BrowserRouter>
        );
    }
}

//Mount the app component
kofi.ready(function () {
    //Create the toaster
    window["toast"] = createToaster({
        "width": "400px",
        "align": "right",
        "time": 1500
    });
    window["confirm"] = createConfirmer({});
    //Initialize sandbox storage
    return initSandboxStorage().then(function () {
        ReactDOM.render(<App />, document.getElementById("root")); //Mount app
    });
});

