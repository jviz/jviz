import {propTypes} from "../props.js";

//Export spacing transform properties
export const spacingTransform = {
    "transform": function (context, data, props) {
        //Check for empty data --> skip transform
        if (data.length === 0) {
            return data; //Nothing to do
        }
        //Get the scale to apply
        let scale = context.scales[props.scale].value;
        //Initialize the items to space
        let items = data.map(function (item, index) {
            let value = scale(item[props.field]);
            return {
                "origin": value,
                "position": value
            };
        });
        //Get the other values
        let method = context.value(props.method, null, "equal");
        let repulsion = context.value(props.repulsion, null, 0);
        let minPosition = Math.min(scale.range[0], scale.range[1]);
        let maxPosition = Math.max(scale.range[0], scale.range[1]);
        //Optimized spaciong algorithm
        if (method === "optimized") {
            for (let i = 0; i < items.length; i++) {
                //Check for not the first item
                if (i > 0) {
                    let j = i - 1;
                    if (items[i].origin < items[j].position + repulsion) {
                        let centerSum = items[i].origin + items[j].origin;
                        let centerCount = 2;
                        j = j - 1;
                        while (j >= 0) {
                            if (Math.abs(items[j + 1].position - items[j].position) > 3 * repulsion / 2) {
                                break; //No more items to add
                            }
                            //Add this group
                            centerSum = centerSum + items[j].origin;
                            centerCount = centerCount + 1;
                            //Previous group
                            j = j - 1;
                        }
                        //Calculate the next center pointer
                        let center = centerSum / centerCount;
                        //Set the position of this item
                        items[i].position = center + (centerCount - 1) * repulsion / 2;
                        //Update the position of each item position
                        for (let k = i - 1; k >= 0; k--) {
                            //Check the distance between the two items positions
                            let diff = items[k].position - items[k + 1].position + repulsion;
                            if (diff <= 0) {
                                break;
                            }
                            //Update the position of the group circle
                            items[k].position = items[k].position - diff;
                        }
                    }
                }
            }
            //Check the position of the first item
            if (items[0].position < minPosition) {
                items[0].position = minPosition;
                //Update the position of solaped circles
                for (let i = 1; i < items.length; i++) {
                    let diff = items[i-1].position - items[i].position + repulsion;
                    if (diff <= 0) {
                        break; //Mo more circles to move
                    }
                    items[i].position = items[i].position + diff;
                }
            }
            //Check the position of the last item
            let lastIndex = items.length - 1;
            if (items[lastIndex].position > maxPosition) {
                items[lastIndex].position = maxPosition;
                //Update the position of solaped circles
                for (let i = lastIndex - 1; i >= 0; i--) {
                    let diff = items[i].position - items[i+1].position + repulsion;
                    if (diff <= 0) {
                        break; //No more circles to move
                    }
                    items[i].position = items[i].position - diff;
                }
            }
        }
        //Equal spacing algorithm
        else {
            //Calculate the separation between each item
            let spacing = (maxPosition - minPosition) / (items.length + 1);
            //Set the end item position
            items.forEach(function (item, index) {
                item.osition = minPosition + spacing * (index + 1);
            });
        }
        //Add the values to each datum
        return data.map(function (datum, index) {
            return Object.assign(datum, {
                [props.as]: items[index].position
            });
        });
    },
    "props": {
        "method": propTypes.string("equal"), //equal|optimized
        //"space": propTypes.string(), //Space reserved for the spacing
        "field": propTypes.string(),
        "scale": propTypes.string(), //Scale to apply
        "repulsion": propTypes.number(0), //Repulsion force
        //"join": propTypes.boolean(false), //Join new positions to the original data
        "as": propTypes.string("x") //Field to store the new position
    }
};

