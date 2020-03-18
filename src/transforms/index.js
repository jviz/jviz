//Import transform types
import {filterTransform} from "./filter.js";
import {summarizeTransform} from "./summarize.js";
import {formulaTransform} from "./formula.js";
import {renameTransform} from "./rename.js";
import {identifierTransform} from "./identifier.js";
import {extendTransform} from "./extend.js";
import {rangeTransform} from "./range.js";
import {spacingTransform} from "./spacing.js";
import {stackTransform} from "./stack.js";

//Transforms types
export const transformTypes = {
    "filter": filterTransform,
    "formula": formulaTransform,
    "summarize": summarizeTransform,
    "rename": renameTransform,
    "identifier": identifierTransform,
    "extend": extendTransform,
    "range": rangeTransform,
    "spacing": spacingTransform,
    "stack": stackTransform
};

//Get a transform renderer
export function getTransform (name) {
    return transformTypes[name];
}

