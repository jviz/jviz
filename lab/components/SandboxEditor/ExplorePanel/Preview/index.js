import React from "react";
import {If} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Panel, PanelHeader, PanelBody} from "neutrine/lib/components";
import {PanelTitle} from "neutrine/lib/components";

import style from "../style.scss";

//Export preview panel wrapper
export const Preview = React.forwardRef(function (props, ref) {
    return (
        <Panel>
            <PanelHeader>
                <PanelTitle>{props.title}</PanelTitle>
            </PanelHeader>
            <PanelBody>
                {/* Content not deployed */}
                <If condition={props.deployed === false}>
                    <div className="siimple--p-9" style={{"opacity": 0.5}} align="center">
                        <div align="center">
                            <Icon icon="chart-bar" size="100px" />
                        </div>
                        <Heading type="h4" className="siimple--mb-1 siimple--mt-0">
                            <strong>Still nothing to display...</strong>
                        </Heading>
                        <div align="center">
                            Click on <strong>Run sandbox</strong> to preview the graphic.
                        </div>
                    </div>
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

