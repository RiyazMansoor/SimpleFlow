
import { SimpleflowError } from "./Errors.js";
import { calculateExpression } from "./Expressions.js";
import { HtmlT, NameT, JSONObjectT, JSONPrimitiveT, JSONValueT, ExpressionT } from "./Types.js";
import { jsonValue } from "./Utils.js";

export enum DataType {
    STRING, INTEGER, FLOAT, DATESTR, BOOLEAN
};

export type DataSpecT = {
    name: NameT,
    description: HtmlT,
    type: DataType,
    defaultValue?: JSONPrimitiveT,
    validationExpression?: ExpressionT,
};


export function validateData(dataSpecs: DataSpecT[], data: JSONObjectT): SimpleflowError[] {
    const errors: SimpleflowError[] = [];
    for (const dataSpec of dataSpecs) {
        try {
            const result = calculateExpression(dataSpec.validationExpression, data, dataSpec.name);

        } catch (err) {
            errors.push(err);
        };
    };
    return errors;
};



