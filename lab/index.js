import React from "react";
import ReactDOM from "react-dom";
import * as Router from "rouct";
import kofi from "kofi";
import {createToaster} from "neutrine/lib/widgets";
import {createConfirmer} from "neutrine/lib/widgets";
import {whenReady} from "neutrine/lib/utils";

//Import global styles
import "siimple/dist/siimple.css";
import "siimple-experiments/dist/siimple-experiments.css";
import "siimple-icons/dist/siimple-icons.css";
import "neutrine/lib/components.css";
import "neutrine/lib/editor.css";
import "neutrine/lib/widgets.css";

import {HomePage} from "./pages/Home/index.js";
import {NewPage} from "./pages/New/index.js";
import {EditorPage} from "./pages/Editor/index.js";
import {initSandboxStorage} from "./utils/sandbox.js";
import {Splash} from "./components/Splash/index.js";
import "./style.scss";

//Main app component
class App extends React.Component {
    constructor(props) {
        super(props);
        //Initial lab state
        this.state = {
            "loading": true
        };
    }
    //Component did mount --> init sandbox storage
    componentDidMount() {
        let self = this;
        return initSandboxStorage().then(function () {
            return kofi.delay(1000);
        }).then(function () {
            return self.setState({"loading": false});
        });
    }
    //Render the app component
    render() {
        //Check for loading app state --> display loading splash
        if (this.state.loading === true) {
            return React.createElement(Splash, {});
        }
        //Render the lab router
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
whenReady(function () {
    //Create the toaster
    window["toast"] = createToaster({
        "width": "400px",
        "align": "right",
        "time": 1500
    });
    window["confirm"] = createConfirmer({});
    ReactDOM.render(<App />, document.getElementById("root")); //Mount app
});

