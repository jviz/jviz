import React from "react";
import ReactDOM from "react-dom";
import * as Router from "rouct";
import kofi from "kofi";

import {EditorPage} from "./pages/Editor/index.js";

//Main app component
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    //Render the app component
    render() {
        return (
            <Router.HashbangRouter>
                <Router.Switch>
                    <Router.Route path="/editor" exact component={EditorPage} />
                </Router.Switch>
            </Router.HashbangRouter>
        );
    }
}

//Mount the app component
kofi.ready(function () {
    //Mount app
    ReactDOM.render(<App />, document.getElementById("root"));
});

