import React from "react";
import {If, Renderer, ForEach} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Panel, PanelHeader, PanelBody} from "neutrine/lib/components";
import {PanelTitle} from "neutrine/lib/components";
import {Media, MediaStart, MediaContent, MediaEnd} from "neutrine/lib/components";
import {classNames} from "neutrine/lib/utils";

import {sandboxFileTypes} from "../../../utils/sandbox.js";
import style from "./style.scss";

//Export file panel component
export function FilesPanel (props) {
    //Check if this panel is not visible
    if (props.visible === false) {
        return null;
    }
    let files = Object.keys(props.sandbox.files).sort();
    return (
        <div style={{"width": props.width,"paddingRight":"5px"}}>
            <Panel>
                {/* Panel header --> Title and create new file button */}
                <PanelHeader>
                    <Media className="siimple--mb-0 siimple--width-100">
                        <MediaContent className="siimple--flex">
                            <PanelTitle>{props.title}</PanelTitle>
                        </MediaContent>
                        <MediaEnd>
                            <Btn className="siimple--px-2" color="" small onClick={props.onCreate}>
                                <Icon icon="plus" size="21px" />
                            </Btn>
                        </MediaEnd>
                    </Media>
                </PanelHeader>
                {/* Panel body --> Render files*/}
                <PanelBody>
                    <ForEach items={files} render={function (filename, index) {
                        let file = props.sandbox.files[filename]; //Get file reference
                        let primary = filename === props.sandbox.main; //Is primary file?
                        let fileClass = classNames({
                            [style.item]: true,
                            [style.itemActive]: filename === props.currentFile
                        });
                        let fileIcon = sandboxFileTypes[file.type].icon;
                        let handleFileClick = function () {
                            if (filename === props.currentFile) {
                                return null; //Nothing to do --> file is open
                            }
                            return props.onFileClick(filename);
                        };
                        let handleFileDelete = function (event) {
                            event.stopPropagation(); //Prevent fileClick fire
                            return props.onFileDelete(filename);
                        };
                        //Return the file item
                        return (
                            <Media key={index} title={filename} className={fileClass} onClick={handleFileClick}>
                                <MediaStart style={{"marginRight":"10px"}}>
                                    <Icon icon={fileIcon} size="17px" style={{"paddingTop":"2px"}} />
                                </MediaStart>
                                <MediaContent className={style.itemName}>{filename}</MediaContent>
                                <MediaEnd style={{"marginLeft": "5px"}}>
                                    <If condition={!primary} render={function () {
                                        return React.createElement(Icon, {
                                            "className": style.itemDelete,
                                            "icon": "cross",
                                            "size": "15px",
                                            "onClick": handleFileDelete
                                        });
                                    }} />
                                </MediaEnd>
                            </Media>
                        );
                    }} />
                </PanelBody>
            </Panel>
        </div>
    );
}

//Files panel props
FilesPanel.defaultProps = {
    "sandbox": {},
    "currentFile": "schema.json",
    "visible": true,
    "width": "200px",
    "title": "Files",
    "onFileClick": null,
    "onFileDelete": null,
    "onCreate": null
};


