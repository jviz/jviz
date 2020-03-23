import React from "react";
import {Choose, ChooseIf, If} from "@siimple/neutrine";
import {Paragraph, Heading} from "@siimple/neutrine";

import {Splash} from "../Splash/index.js";
import style from "./style.scss";

//Export editor preview component
export class EditorPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "content": null,
            "error": null
        };
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        //Viewer
        this.viewer = null;
        //Bind methods
        this.run = this.run.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    //Component unmount
    componentWillUnmount() {
        return this.destroy();
    }
    //Mount the viewer
    run(content) {
        let self = this;
        this.destroy(); //Remove the current plot
        let newState = {
            "content": content,
            "error": null //Reset error
        };
        return this.setState(newState, function () {
            //Compile the provided schema and mount the viewer
            return jviz.parse(content).then(function (schema) {
                console.log(schema); //Print schema
                //Create the viewer
                return jviz(schema, {
                    "parent": self.ref.parent.current
                });
            }).then(function (viewer) {
                self.viewer = viewer; //Save viewer instance
                //Hack to obtain the reference to the viewer element
                window.viewer = self.viewer;
                //console.log(self.viewer); //Print viewer instance
                return self.viewer.render();
            }).then(function () {
                console.log("plot live");
            }).catch(function (error) {
                console.error(error); //Display error and abort
                return self.setState({
                    "error": error
                });
            });
        });
    }
    //Remove the current plot (if exists)
    destroy() {
        if (typeof this.viewer === "object" && this.viewer !== null) {
            this.viewer.destroy(); //Remove bounds
            delete this.viewer; //Remove reference
        }
    }
    //Get current viewer
    getViewer() {
        return this.viewer;
    }
    //Render the sandbox preview
    render() {
        let self = this;
        let hasContent = this.state.content !== null && this.state.content !== "";
        let hasError = this.state.error !== null;
        return (
            <Choose>
                {/* No content to display */}
                <ChooseIf condition={hasContent === false}>
                    <Splash icon="chart-bar">
                        <div className="">
                            <Heading type="h5" className="siimple--mb-1">
                                Preview not available
                            </Heading>
                            <Paragraph className="siimple--mb-0">
                                You should first click on <strong>Run sandbox</strong> to preview the plot.
                            </Paragraph>
                        </div>
                    </Splash>
                </ChooseIf>
                {/* Error running viewer --> display error */}
                <ChooseIf condition={hasError === true} render={function () {
                    //console.log(self.state.error);
                    return React.createElement("div", {}, self.state.error.message);
                }} />
                {/* Content without errors --> render plot wrapper */}
                <ChooseIf condition={true} render={function () {
                    return React.createElement("div", {
                        "className": style.preview,
                        "ref": self.ref.parent
                    });
                }} />
            </Choose>
        );
    }
}

