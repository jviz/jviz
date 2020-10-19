import React from "react";
import {classNames} from "neutrine/Lib/utils";
import {If} from "neutrine/lib/components";

import style from "./style.scss";

//Cell class
export class CellElement {
    constructor(file) {
        this.file = file;
        this.parent = React.createRef();
        this.viewer = null;
        this.schema = null;
        this.error = null;
        this.logs = [];
    }
    //Register a new log message to this cell
    log(type, message) {
        this.logs.push({"type": type, "message": message, "date": Date.now()});
    }
}

//Export cell wrapper
export const PreviewCell = React.forwardRef(function (props, ref) {
    let classList = classNames({
        [style.cell]: true,
        [style.cellError]: typeof props.error === "string",
        [style.cellActive]: props.active && props.error === null
    });
    //Handle cell click
    let handleClick = function () {
        //Check if this cell is active --> ignore click action
        if (props.active === true) {
            return null;
        }
        //This cell is not active --> call the click listener
        return props.onClick(props.index);
    };
    return (
        <div className={classList} onClick={handleClick} data-index={props.index}>
            <If condition={typeof props.error === "string"}>
                <span>{props.error}</span>
            </If>
            <div ref={ref} />
        </div>
    );
});

//Cell default props
PreviewCell.defaultProps = {
    "index": 0,
    "active": false,
    "error": null
};

