import React from "react";
import kofi from "kofi";
import {Choose, ChooseIf} from "@siimple/neutrine";
import {Renderer} from "@siimple/neutrine";
import {SplitPanel, SplitPanelItem} from "@siimple/neutrine";
import {Spinner} from "@siimple/neutrine";

import {Splash} from "../../components/Splash/index.js";

import {EditorHeader} from "./Header/index.js";
import {EditorCode} from "./Code/index.js";
import {EditorPreview} from "./Preview/index.js";
import style from "./style.scss";

//Fetch url
let fetchUrl = function (url, callback) {
    let options = {
        "url": url,
        "method": "get",
        "json": false
    };
    return kofi.request(options, function (error, response, body) {
        return callback(error, body);
    });
};

//Export sandbox editor component
export class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "ready": false,
            "content": "",
            "deployContent": null,
            "deployDate": null
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
        return kofi.delay(1000, function () {
            return self.handleLoad();
        });
    }
    //Handle sandbox load
    handleLoad() {
        let self = this;
        let params = this.props.request.query;
        //Check for url provided
        if (typeof params.url === "string") {
            return fetchUrl(params.url, function (error, content) {
                //TODO: check for error
                return self.setState({
                    "ready": true,
                    "content": content
                });
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
        //let self = this;
        let content = this.getContent();
        return this.setState({
            "content": content,
            "deployContent": JSON.parse(content),
            "deployDate": Date.now()
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
                                    "content": self.state.deployContent,
                                    "key": self.state.deployDate,
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

