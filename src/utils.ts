
import { TName, TTimestamp } from "./types";

export function TimestampStr(): TTimestamp {
    return new Date().toISOString();
}

export function RandomStr(len: number = 40): string {
    return "";
}

export function ArrayIntersection(array1: string[], array2: string[]): string[] {
    return array1.filter(x => array2.includes(x));
}

export function Key(flowName: TName, formName: TName): string {
    return `${flowName}~${formName}`;
}