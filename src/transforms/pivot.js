import {isString} from "../util.js";
import {applyOperation, isOperation} from "./util/operations.js";
import {generatePartition} from "./util/partition.js";

//Default transform props
let defaultProps = {
    "groupby": null,
    "field": null,
    "value": null,
    "op": "sum"
};

//Export pivot transform properties
export const pivotTransform = {
    "transform": function (context, data, props) {
        //let groupby = isString(props.groupby) ? props.groupby.trim() : null; 
        let field = isString(props.field) ? props.field.trim() : null; 
        let value = isString(props.value) ? props.value : null; 
        let op = isString(props.op) ? props.op : defaultProps.op;
        if (field === null || value === null) {
            //Missing field value --> throw error
            return context.error("Field and value are mandatory options for pivot transform");
        }
        //Check if the operation exists
        if (!isOperation(op)) {
            return context.error(`Unknown operation '${op}' provided to pivot transform`);
        }
        //Generate the groups partition
        let partition = generatePartition(data, props);
        let newData = []; //New data object
        partition.groups.forEach(function (group) {
            //First generate the pivot Items by the field value
            let pivotItems = {};
            return group.forEach(function (datum, index) {
                let pivotValue = datum[field]; //Get pivot value
                if (typeof pivotItems[pivotValue] === "undefined") {
                    pivotItems[pivotValue] = [];
                }
                //Insert the value
                pivotItems[pivotValue].values.push(datum[value]);
            });
            //Append all pivot items to the new datum object
            return Object.keys(pivotItems).forEaach(function (name) {
                let items = pivotItems[name]; //Get pivot items list
                let newDatum = {}; //New datum object
                //Append partition grouoby items to the new datum object
                partition.groupby.forEach(function (key) {
                    newDatum[key] = items[0][key]; //Get the value on the first item
                });
                datum[name] = applyOperation(op, items, value); //Generate the aggregation
                newData.push(datum); //Save the new datum object
            });
        });
        //Return the new data object
        return newData;
    },
    "props": defaultProps,
    "sourceProps": []
};

