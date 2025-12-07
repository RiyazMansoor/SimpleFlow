
/**
 * Provides a collection of utility functions and constants
 * that can be used throughout the application. 
 * 
 * @author Riyaz Mansoor <riyaz.mansoor@gmail.com>
 * @version 1.0
 */

import { IntegerT, TimestampStrT, JSONObjectT, JSONValueT } from "./Types.js";

/**
 * Generates the current timestamp in ISO 8601 format.
 * The ISO format is a standard for representing dates and times, ensuring
 * consistency and compatibility across different systems.
 *
 * @returns {TimestampStrT} The current timestamp as an ISO formatted string.
 * @example
 * const now = timestampStr(); // "2024-07-30T12:34:56.789Z"
 */
export function timestampStr(): TimestampStrT {
    return new Date().toISOString();
};

/**
 * A regular expression for validating decimal numeric strings.
 * This pattern allows for an optional leading sign (+ or -), followed by
 * one or more digits, an optional decimal point, and then zero or more digits.
 *
 * It is used to ensure that a string represents a valid decimal number before
 * attempting to parse it.
 *
 * @type {RegExp}
 * @example
 * PatternDecimal.test("123");       // true
 * PatternDecimal.test("-45.67");    // true
 * Patternical.test("+0.123");       // true
 * PatternDecimal.test(".5");        // true
 * PatternDecimal.test("abc");       // false
 */
export const PatternDecimal = /^[+-]?(\d+(\.\d*)?|\.\d+)$/

/**
 * The default length for randomly generated strings.
 * This constant is used by the `randomStr` function when no specific length
 * is provided, ensuring a consistent and secure default.
 *
 * @type {number}
 */
export const DEFAULT_RANDOMSTR_LEN = 40;

/**
 * Generates a random string of a specified length using a base-36 encoding.
 *
 * The function repeatedly calls `Math.random()` and converts the result to a
 * base-36 string, concatenating the parts until the desired length is reached.
 *
 * @param {IntegerT} [len=DEFAULT_RANDOMSTR_LEN] - The desired length of the random string.
 * @returns {string} A random base-36 string of the specified length.
 * @example
 * const token = randomStr(16);  // "a1b2c3d4e5f6g7h8"
 * const id = randomStr();       // "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0"
 */
export function randomStr(len: IntegerT = DEFAULT_RANDOMSTR_LEN): string {
    let rstr = "";
    while (rstr.length < len) {
        rstr += Math.random().toString(36).substring(2, 12);
    };
    return rstr.substring(0, len);
};


/**
 * Retrieves a value from a nested JSON object using a dot-delimited key path.
 * This function allows you to access deeply nested properties within a JSON
 * structure without having to write long chains of property accessors.
 *
 * If the path is invalid or any intermediate key does not exist, the function
 * will return `undefined`.
 *
 * @param {JSONObjectT} jsonObjectT - The JSON object from which to retrieve the value.
 * @param {string} keyPath - A dot-delimited string representing the path to the
 *        desired value (e.g., "user.address.city").
 * @returns {JSONValueT | undefined} The value found at the specified path, or
 *          `undefined` if the path is not valid.
 * @see {@link JSONObjectT}
 * @example
 * const data = {
 *   user: {
 *     name: "John Doe",
 *     address: {
 *       city: "New York",
 *       zip: "10001"
 *     }
 *   }
 * };
 *
 * const city = jsonValue(data, "user.address.city");  // "New York"
 * const country = jsonValue(data, "user.address.country"); // undefined
 */
export function getJsonValue(jsonObjectT: JSONObjectT, keyPath: string): JSONValueT {
    const keys = keyPath.split('.');
    const lastkey = keys.pop();
    let jsonCurrent = jsonObjectT;
    for (const key of keys) {
        if (jsonCurrent.hasOwnProperty(key) && typeof jsonCurrent[key] === 'object') {
            jsonCurrent = jsonCurrent[key] as JSONObjectT;
        } else {
            return undefined;
        };
    };
    return jsonCurrent[lastkey];
};

export function setJsonValue(jsonObjectT: JSONObjectT, keyPath: string, value: JSONValueT): void {
    const keys = keyPath.split('.');
    const lastkey = keys.pop();
    let jsonCurrent = jsonObjectT;
    for (const key of keys) {
        // case of having property but not as an object - is NOT handled here
        // since this is internal, tests should handle this before production
        if (!(jsonCurrent.hasOwnProperty(key) && typeof jsonCurrent[key] === 'object')) {
           jsonCurrent[key] = {};
        };
        jsonCurrent = jsonCurrent[key] as JSONObjectT;
    };
    jsonCurrent[lastkey] = value;
};

export function mergeJsonObjects(target: JSONObjectT, source: JSONObjectT, paths: string[]): JSONObjectT {
    for (const path of paths) {
        setJsonValue(target, path, getJsonValue(source, path));
    };
    return target;
};

