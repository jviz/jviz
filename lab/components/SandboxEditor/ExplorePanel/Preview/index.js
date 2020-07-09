import React from "react";

import {If} from "@siimple/neutrine";
import {Heading} from "@siimple/neutrine";
import {Panel, PanelHeader, PanelBody} from "@siimple/lib/widgets/mocha-panel/index.js";
import {PanelTitle} from "@siimple/lib/widgets/mocha-panel/index.js";

import {Splash} from "../../../Splash/index.js";
import style from "../style.scss";

//Export preview panel wrapper
export const Preview = React.forwardRef(function (props, ref) {
    return (
        <Panel>
            <PanelHeader>
                <PanelTitle text={props.title} />
            </PanelHeader>
            <PanelBody>
            {/* Content not deployed */}
                <If condition={props.deployed === false}>
                    <Splash icon="chart-bar">
                        <Heading type="h4" className="siimple--mb-1">
                            <strong>Still nothing to display...</strong>
                        </Heading>
                        <div align="center">
                            Click on <strong>Run sandbox</strong> to preview the graphic.
                        </div>
                    </Splash>
                </If>
                {/* Content deployed */}
                <If condition={props.deployed === true}>
                    <div className={style.content}>
                        <div align="center" ref={ref} />
                    </div>
                </If>
            </PanelBody>
        </Panel>
    );
});

//Preview panel default props
Preview.defaultProps = {
    "title": "Preview",
    "visible": true,
    "deployed": false
};

