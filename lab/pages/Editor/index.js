import React from "react";
import kofi from "kofi";
import {If, Choose, ChooseIf} from "@siimple/neutrine";
import {Renderer} from "@siimple/neutrine";
import {SplitPanel, SplitPanelItem} from "@siimple/neutrine";
import {Spinner} from "@siimple/neutrine";

import {Splash} from "../../components/Splash/index.js";
import {EditorHeader} from "../../components/EditorHeader/index.js";
import {EditorCode} from "../../components/EditorCode/index.js";
import {EditorPreview} from "../../components/EditorPreview/index.js";
import style from "./style.scss";

//Export sandbox editor component
export class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "ready": false,
            "content": ""
        };
        //Referenced elements
        this.ref = {
            "code": React.createRef(),
            "preview": React.createRef()
        };
        //Bind sandbox management methods
        this.handleRun = this.handleRun.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleExport = this.handleExport.bind(this);
    }
    //Component did mount
    componentDidMount() {
        let self = this;
        return kofi.delay(1000).then(function () {
            return self.handleLoad();
        });
    }
    //Handle sandbox load
    handleLoad() {
        let self = this;
        let params = this.props.request.query;
        //Check for url provided
        if (typeof params.url === "string") {
            return kofi.request({
                "url": params.url,
                "method": "get"
            }).then(function (response) {
                return self.setState({
                    "ready": true,
                    "content": response.body
                });
            }).catch(function (response) {
                console.error(response.error);
            });
        }
        //Create a new sandbox
        return self.setState({
            "ready": true,
            "content": ""
        });
    }
    //Handle export
    handleExport() {
        //TODO
    }
    //Handle run
    handleRun() {
        let self = this;
        let newState = {
            "content": this.getContent()
        };
        //Update the state with the current editor content and run in preview
        return this.setState(newState, function () {
            self.ref.preview.current.run(newState.content);
        });
    }
    //Get current content
    getContent() {
        return this.ref.code.current.getContent();
    }
    //Render the editor
    render() {
        let self = this;
        //Check if editor is ready
        if (this.state.ready === false) {
            return (
                <Splash icon="chart-bar">
                    <div className="siimple--mt-3">
                        <Spinner color="dark" />
                    </div>
                </Splash>
            );
        }
        let mode = this.state.mode;
        //Render the editor panels
        return (
            <div className={style.editor}>
                {/* Editor header */}
                <Renderer render={function () {
                    return React.createElement(EditorHeader, {
                        "onRunClick": self.handleRun
                    });
                }} />
                <div className={style.editorContent}>
                    {/* Editor content */}
                    <SplitPanel split="vertical" resizeClassName={style.editorResize}>
                        <SplitPanelItem primary={true} defaultSize={500} minSize={200}>
                            <Renderer render={function () {
                                return React.createElement(EditorCode, {
                                    "ref": self.ref.code,
                                    "content": self.state.content
                                });
                            }} />
                        </SplitPanelItem>
                        <SplitPanelItem>
                            <Renderer render={function () {
                                return React.createElement(EditorPreview, {
                                    "ref": self.ref.preview
                                });
                            }} />
                        </SplitPanelItem>
                    </SplitPanel>
                </div>
            </div>
        );
    }
}

//Sandbox editor default props
EditorPage.defaultProps = {};

