
import { JSONObjectT, JSONValueT } from "./Types.js";

export enum ConditionFunc {
    Required,
    EQ, NEQ, GT, GTE, LT, LTE,
    Equals, StartsWith, EndsWith, Includes,
    AND, OR
};

export type ConditionValueT = {
    type: "V" | "D" | "R",      // value | dataObject | pre condition result
    value: string,
};

export type ConditionT = {
    conditionFunc: ConditionFunc,
    conditionValues: ConditionValueT[],
};





function conditionValue(conditionValue: ConditionValueT, data: JSONObjectT, conditionResults: boolean[]): JSONValueT {
    if (conditionValue.type == "V") {
        return conditionValue.value;
    };
    if (conditionValue.type == "R") {
        return conditionResults[parseInt(conditionValue.value)];
    };
    // if conditionValue.type == "D"
    const keys: string[] = conditionValue.value.split(".");
    let result: JSONObjectT = data;
    for (const key of keys) {
        if (result.hasOwnProperty(key)) {
            if (typeof result[key] == "object") {
                result = result[key] as JSONObjectT;
            } else {
                return result[key];
            };
        } else {
            return undefined;
        };
    };
    return result;
};


export function conditionResult(conditionsT: ConditionT[], data: JSONObjectT): boolean {
    const conditionResults: boolean[] = [];
    function aConditionResult(conditionT: ConditionT): boolean {
        const values = conditionT.conditionValues.map((cv) => conditionValue(cv, data, conditionResults));
        const value0 = values[0];
        const strValue0 = values[0].toString();
        switch (conditionT.conditionFunc) {
            case ConditionFunc.EQ:
                // all arguments must be equal
                return values.every(value => value0 == value);
            case ConditionFunc.NEQ:
                // all arguments must be not equal
                return values.length == [...new Set(values)].length;
            case ConditionFunc.GT:
                // ascending order
                return values.every((value, i) => (i == 0 ? true : value > values[i-1]));
            case ConditionFunc.GTE:
                // ascending order
                return values.every((value, i) => (i == 0 ? true : value >= values[i-1]));
            case ConditionFunc.LT:
                // descending order
                return values.every((value, i) => (i == 0 ? true : value < values[i-1]));
            case ConditionFunc.LTE:
                // descending order
                return values.every((value, i) => (i == 0 ? true : value <= values[i-1]));
            case ConditionFunc.Required:
                // all values must be real
                return values.every(value => !!value);
            case ConditionFunc.StartsWith:
                // first argument prefix, rest arguments must start with prefix
                return values.every((value, i) => (i == 0 ? true : value.toString().startsWith(strValue0)));
            case ConditionFunc.EndsWith:
                // first argument suffix, rest arguments must end with suffix
                return values.every((value, i) => (i == 0 ? true : value.toString().endsWith(strValue0)));
            case ConditionFunc.Includes:
                // first argument strng to search, rest arguments must contain string to search
                return values.every((value, i) => (i == 0 ? true : value.toString().includes(strValue0)));
            case ConditionFunc.AND:
                return values.every(value => value == true);
            case ConditionFunc.OR:
                return values.some(value => value == true);
            default:
                return false;
        };
    };
    for (const conditionT of conditionsT) {
        conditionResults.push(aConditionResult(conditionT));
    };
    return conditionResults.pop();
};



