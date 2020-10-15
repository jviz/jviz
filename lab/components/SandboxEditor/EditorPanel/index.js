import React from "react";
import {ForEach, If, Renderer} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";
import {Panel, PanelHeader, PanelBody, PanelTab} from "neutrine/lib/components";
import {Media, MediaContent, MediaEnd} from "neutrine/lib/components";
import {EditorComponent} from "neutrine/lib/editor";

//Export editor panel component
export const EditorPanel = React.forwardRef(function (props, ref) {
    return (
        <Panel>
            {/* Panel header -->  tabs and run button */}
            <PanelHeader>
                <Media className="siimple--mb-0 siimple--width-100">
                    <MediaContent className="siimple--flex">
                        <PanelTab active text={props.filename} />
                    </MediaContent>
                    {/* Run sandbox */}
                    <MediaEnd>
                        {/* Not running --> display run button */}
                        <If condition={props.running === false}>
                            <Btn color="secondary" small onClick={props.onRun}>
                                <strong>Run sandbox</strong>
                            </Btn>
                        </If>
                        {/* Running --> display spinner */}
                        <If condition={props.running === true}>
                            <Spinner color="secondary" style={{"margin":"2px"}} />
                        </If>
                    </MediaEnd>
                </Media>
            </PanelHeader>
            {/* Panel body --> Render tab */}
            <PanelBody>
                <Renderer render={function () {
                    return React.createElement(EditorComponent, {
                        "ref": ref,
                        "language": props.language,
                        "theme": props.theme,
                        "value": ""
                    });
                }} />
            </PanelBody>
        </Panel>
    );
});

//Editor panel default props
EditorPanel.defaultProps = {
    "filename": "schema.json",
    "theme": "light",
    "language": "json"
};



