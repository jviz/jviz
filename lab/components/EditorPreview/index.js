import React from "react";
import {If} from "@siimple/neutrine";
import {Paragraph, Heading} from "@siimple/neutrine";

import {Splash} from "../Splash/index.js";
import style from "./style.scss";

//Export editor preview component
export class EditorPreview extends React.Component {
    constructor(props) {
        super(props);
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        //Viewer
        this.viewer = null;
    }
    //Mount the viewer
    componentDidMount() {
        if (this.props.content === null) {
            return null;
        }
        //Create the viewer
        this.viewer = jviz(this.props.content, {
            "parent": this.ref.parent.current
        });
        //Draw this plot
        this.viewer.render(function () {
            console.log("plot live");
        });
        //Hack to obtain the reference to the viewer element
        window.viewer = this.viewer;
    }
    //Component unmount
    componentWillUnmount() {
        delete this.viewer;
    }
    //Get current viewer
    getViewer() {
        return this.viewer;
    }
    //Render the sandbox preview
    render() {
        return (
            <React.Fragment>
                <If condition={this.props.content !== null}>
                    <div className={style.preview}>
                        <svg width="100%" height="100%" ref={this.ref.parent} />
                    </div>
                </If>
                <If condition={this.props.content === null}>
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
                </If>
            </React.Fragment>
        );
    }
}

