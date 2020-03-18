//Create a new action operation
export function createAction (node, value) {
    let context = this;
    //Save to the list of pending actions
    context.actions.push({
        "type": "update",
        "target": node,
        "value": value,
        "date": Date.now()
    });
}

