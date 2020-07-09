import React from "react";

import {ForEach} from "@siimple/neutrine";
import {Icon} from "@siimple/neutrine";
import {Heading} from "@siimple/neutrine";
import {Row, Column} from "@siimple/neutrine";

import style from "./style.scss";

//List sandboxes
export function ListSandboxes (props) {
    return (
        <React.Fragment>
            {/*
            <Heading type="h5">{props.title}</Heading>
            */}
            <Row className="siimple--mb-0">
                <ForEach items={props.sandboxes} render={function (sandbox, index) {
                    let onClick = function () {
                        return props.onClick(sandbox);
                    };
                    //Return sandbox card
                    return (
                        <Column className={style.item} onClick={onClick} key={index}>
                            <div className="siimple--border-rounded siimple--bg-light siimple--p-4" align="center">
                                <Icon icon="image" className="siimple--text-secondary" size="60px" />
                            </div>
                            <Heading type="h6" className="siimple--mt-2">
                                <strong>{sandbox.name}</strong>
                            </Heading>
                        </Column>
                    );
                }} />
            </Row>
        </React.Fragment>
    );
}


