import React from "react";
import kofi from "kofi";

import {Spinner} from "@siimple/neutrine";

import {Splash} from "../../components/Splash/index.js";
import {createSandbox, saveLocalSandbox} from "../../utils/sandbox.js";
import {redirect, redirectToSandbox} from "../../utils/redirect.js";

//Export new sandbox creator page
export class NewPage extends React.Component {
    constructor(props) {
        super(props);
    }
    //Component did mount ---> create the new sandbox
    componentDidMount() {
        let self = this;
        //let newSandbox = createSandbox({}); //Create a new sandbox
        return kofi.delay(1000).then(function () {
            return saveLocalSandbox(createSandbox({}));
        }).then(function (newSandbox) {
            //console.log("sandbox created");
            return redirectToSandbox("sandbox", newSandbox.id);
        });
    }
    //Render the new sandbox page
    render() {
        return (
            <Splash icon={null}>
                <div className="siimple--mb-2">
                    <Spinner color="dark" />
                </div>
                <div className="siimple--mt-0">
                    <strong>Creating a new sandbox...</strong>
                </div>
            </Splash>
        );
    }
}

