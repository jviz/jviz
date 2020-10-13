import React from "react";
import {If, ForEach} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Row, Column} from "neutrine/lib/components";
import {Card, CardImage, CardContent} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";

import style from "./style.scss";

//List sandboxes
export function ListSandboxes (props) {
    return (
        <React.Fragment>
            <Row className="siimple--mb-0">
                <ForEach items={props.sandboxes} render={function (sandbox, index) {
                    let onClick = function () {
                        return props.onClick(sandbox);
                    };
                    let hasThumbnail = false; //To store if has thumbnail image
                    let imageStyle = null; //Initialize thumbnail style
                    if (typeof sandbox.thumbnail === "string") {
                        imageStyle = {
                            "backgroundImage": `url(${sandbox.thumbnail})`
                        };
                        hasThumbnail = true;
                    }
                    //Return sandbox card
                    return (
                        <Column className={style.item} key={index}>
                            <Card className="siimple--mb-0">
                                <CardContent className="siimple--p-4">
                                    <div className={style.image} style={imageStyle} align="center">
                                        <If condition={!hasThumbnail} render={function () {
                                            return React.createElement(Icon, {
                                                "icon": "image",
                                                "className": "siimple--text-secondary",
                                                "size": "60px"
                                            });
                                        }} />
                                    </div>
                                    <Heading type="h6" className={style.title}>
                                        <strong>{sandbox.name}</strong>
                                    </Heading>
                                    <div className="siimple--text-small siimple--text-muted siimple--mb-3">
                                        {sandbox.description || "No description for this sandbox..."}
                                    </div>
                                    <Btn fluid color="secondary" onClick={onClick}>
                                        <strong>Open</strong>
                                    </Btn>
                                </CardContent>
                            </Card>
                        </Column>
                    );
                }} />
            </Row>
        </React.Fragment>
    );
}


