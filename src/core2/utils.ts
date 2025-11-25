
import { IntegerT, TimestampT } from "./types";

/**
 * @returns the ISO formatted current timestamp
 */
export function timestampStr(): TimestampT {
    return new Date().toISOString();
};

/**
 * @param len length of the random string - default 40
 * @returns random string
 */
export function randomStr(len: IntegerT = 40): string {
    let rstr = "";
    while (rstr.length < len) {
        rstr += Math.random().toString(36).substring(2, 12);
    };
    return rstr.substring(0, len);
};

/*

export function addToArray<T>(array: T[], arrayItem: T): void {
    const index = array.indexOf(arrayItem);
    if (index < 0) {
        array.push(arrayItem);
    };
};

export function removeFromArray<T>(array: T[], arrayItem: T): void {
    const index = array.indexOf(arrayItem);
    if (index >= 0) {
        array.splice(index, 1);
    };
};

*/


