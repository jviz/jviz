import React from "react";
import {Renderer} from "@siimple/neutrine";

//import {Panel, PanelHead, PanelBody} from "../../components/panel/index.js";
//import {PanelButton} from "../../components/panel/index.js";
import {TextEditor} from "../../utils/text.js";
import style from "./style.scss";

//Export editor input component
export class EditorCode extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "lines": 0
        };
        //Referenced elements
        this.ref = {
            "content": React.createRef()
        };
        this.editor = null; //Editor reference
    }
    componentDidMount() {
        let self = this;
        this.editor = new TextEditor({
            "target": this.ref.content.current,
            "content": this.props.content
        });
        //Update the lines count
        this.updateLinesCount();
    }
    //Component will unmount
    componentWillUnmount() {
        this.editor.destroy(); //Remove all event listeners
    }
    //Update the lines count
    updateLinesCount() {
        let lines = this.editor.getLines();
        let count = lines.length;
        if (lines[lines.length - 1].trim() === "") {
            count = count - 1;
        }
        if (this.state.lines !== count && count >= 1) {
            return this.setState({
                "lines": count
            });
        }
    }
    //Get the current code content
    getContent() {
        return this.editor.getText();
    }
    //Render the editor code input
    render() {
        let self = this;
        //Renturn the input code panel
        return (
            <React.Fragment>
                <div className={style.code}>
                    {/* Lines count */}
                    <div className={style.codeLines} align="right">
                        <Renderer render={function () {
                            return Array.apply(null, Array(self.state.lines)).map(function (x, index) {
                                return <div key={index}>{index + 1}</div>;
                            });
                        }} />
                    </div>
                    {/* Render editor content */}
                    <Renderer render={function () {
                        return React.createElement("pre", {
                            "contentEditable": "true",
                            "spellCheck": "false",
                            "className": style.codeContent,
                            "ref": self.ref.content
                        });
                    }} />
                </div>
                {/* Statusbar */}
                <div className={style.codeStatusBar}>
                    Status bar
                </div>
            </React.Fragment>
        );
    }
}

//Default props
EditorCode.defaultProps = {
    "title": "Untitled",
    "content": ""
};

