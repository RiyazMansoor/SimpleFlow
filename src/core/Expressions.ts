
/**
 * @file This file contains the logic for parsing and evaluating expressions.
 * @packageDocumentation
 */

import { NameT, ExpressionT, JSONObjectT } from "./Types.js";
import { PatternDecimal, jsonValue } from "./Utils.js";
import { SimpleflowError } from "./Errors.js";

/**
 * Enum representing the available expression functions.
 */
export enum ExpressionFuncsE {
    REQUIRED,
    EQ, NEQ, GT, GTE, LT, LTE,                      // number booleans
    LEN, ADD, NEG, MUL, INV, POW, ABS,              // number calculations
    STARTSWITH, ENDSWITH, INCLUDES,                 // string booleans
    CONCAT, LEFT, RIGHT,                            // string calculations
    AND, OR                                         // logical
};

/**
 * Calculates the result of an expression.
 * @param expression The expression to calculate.
 * @param data The data to use for the calculation.
 * @param name The name of the datafield.
 * @returns True if the expression is true, false otherwise.
 */
export function calculateExpression(expression: ExpressionT, data: JSONObjectT, name: NameT): boolean {
    const tokens = tokensCreate(expression);
    return tokensParse(tokens, data, name) === "true";
};

/**
 * Creates a token array from an expression string.
 * @param expression The expression to tokenize.
 * @returns A token array.
 * @private
 */
function tokensCreate(expression: ExpressionT): string[] {
    const tokens: string[] = [];
    let pos = 0;
    while (true) {
        const tokenPos = {
            "(": expression.indexOf("(", pos),
            ")": expression.indexOf(")", pos),
            ",": expression.indexOf(",", pos),
        };
        const tokenMatches = Object.values(tokenPos).filter((value) => value !== -1);
        // if no tokens found, then expression has ended
        if (tokenMatches.length === 0) {
            break;
        };
        // find the next token and push
        const firstPos = Math.min(...tokenMatches);
        const nextTokenizer = Object.keys(tokenPos).find((key) => tokenPos[key as keyof typeof tokenPos] === firstPos) as string;
        const token = expression.substring(pos, firstPos).trim();
        if (token) {
            tokens.push(token);
        };
        if (nextTokenizer !== ",") {
            tokens.push(nextTokenizer);
        };
        pos = firstPos + nextTokenizer.length;
    };
    return tokens;
};

/**
 * Parses a token array and calculates the result.
 * @param tokens The token array to parse.
 * @param data The data to use for the calculation.
 * @param name The name of the datafield.
 * @returns The result of the calculation.
 * @private
 */
function tokensParse(tokens: string[], data: JSONObjectT, name: NameT): string {
    if (tokens.length < 3) {
        throw new Error(`Expected minimum tokens: 3 but got: ${tokens.length}`);
    };
    const token = tokens.pop();
    if (token !== ")") {
        throw new Error(`Expected token: ) but got: ${token}`);
    };
    const args = [];
    let fnName;
    do {
        const arg = tokens.pop() as string;
        if (arg === ")") {
            // new function. recurse calculate
            tokens.push(arg);
            args.push(tokensParse(tokens, data, name));
        } else if (arg === "(") {
            fnName = tokens.pop() as string;
            break; // 
        } else {
            args.push(arg);
        }
    } while (true);
    return calculate(fnName, args, data, name);

};

/**
 * Calculates the result of a function.
 * @param fnName The name of the function to calculate.
 * @param args The arguments of the function.
 * @param data The data to use for the calculation.
 * @param name The name of the datafield.
 * @returns The result of the calculation.
 * @private
 */
function calculate(fnName: string, args: string[], data: JSONObjectT, name: NameT): string {
    /**
     * Checks if there is exactly one argument.
     * @throws {SimpleflowError} If there is not exactly one argument.
     */
    function string1(): void {
        if (args.length !== 1) {
            const errMsg = `Function [${fnName}] at Datafield [${name}] expects 1 argument :: [${args.toString()}]`;
            throw SimpleflowError.errorDataValidation(name, errMsg, data);
        };
    };
    /**
     * Checks if there is exactly one numeric argument.
     * @throws {SimpleflowError} If there is not exactly one numeric argument.
     */
    function numeric1(): void {
        string1();
        if (args.every(arg => PatternDecimal.test(arg))) {
            const errMsg = `Function [${fnName}] at Datafield [${name}] expects a numeric argument :: [${args.toString()}]`;
            throw SimpleflowError.errorDataValidation(name, errMsg, data);
        };
    };
    /**
     * Checks if there are at least two arguments.
     * @throws {SimpleflowError} If there are less than two arguments.
     */
    function string2more(): void {
        if (args.length < 2) {
            const errMsg = `Function [${fnName}] at Datafield [${name}] expects atleast 2 arguments :: [${args.toString()}]`;
            throw SimpleflowError.errorDataValidation(name, errMsg, data);
        };
    };
    /**
     * Checks if there are at least two numeric arguments.
     * @throws {SimpleflowError} If there are less than two numeric arguments.
     */
    function numeric2more(): void {
        string2more();
        if (args.every(arg => PatternDecimal.test(arg))) {
            const errMsg = `Function [${fnName}] at Datafield [${name}] expects a numeric arguments :: [${args.toString()}]`;
            throw SimpleflowError.errorDataValidation(name, errMsg, data);
        };
    };
    switch (fnName.toUpperCase()) {
        case "FORMVALUE":
            return jsonValue(data, args[0]).toString();
        case "NOW":
            return new Date().toISOString();
        case "LEN":
            if (args.length !== 1) {
                throw SimpleflowError.errorDataValidation(name, "LEN functeion expects 1 argument", data);
            };
            return args[0].length.toString();
        case "ADD":
            numeric2more();
            return args.reduce((a, b) => a + parseFloat(b), 0.0).toString();
        case "NEG":
            numeric1();
            return args.slice(1).reduce((a, b) => a - parseFloat(b), parseFloat(args[0])).toString();
        case "MUL":
            numeric2more();
            return args.reduce((a, b) => a * parseFloat(b), 1.0).toString();
        case "INV":
            numeric1();
            return (1/parseFloat(args[0])).toString();
        case "ABS":
            numeric1();
            const val = parseFloat(args[0]);
            return (val < 0 ? val * -1 : val).toString();
        case "POW":
            numeric2more();
            return args.slice(1).reduce((a, b) => Math.pow(a, parseFloat(b)), parseFloat(args[0])).toString();
        case "LT":
            numeric2more();
            return args.every((a, i) => i === 0 ? true : parseFloat(args[i-1]) < parseFloat(args[i])).toString();
        case "LTE":
            numeric2more();
            return args.every((a, i) => i === 0 ? true : parseFloat(args[i-1]) <= parseFloat(args[i])).toString();
        case "GT":
            numeric2more();
            return args.every((a, i) => i === 0 ? true : parseFloat(args[i-1]) > parseFloat(args[i])).toString();
        case "GTE":
            numeric2more();
            return args.every((a, i) => i === 0 ? true : parseFloat(args[i-1]) >= parseFloat(args[i])).toString();
        case "EQ":
            numeric2more();
            return (new Set(...args).size === 1).toString();
        case "NEQ":
            numeric2more();
            return (new Set(...args).size === args.length).toString();
        case "REQUIRED":
            return args.every(a => !!a).toString();
        case "STARTSWITH":
            return args.slice(1).every(a => a.startsWith(args[0])).toString();
        case "ENDSWITH":
            return args.slice(1).every(a => a.endsWith(args[0])).toString();
        case "INCLUDES":
            return args.slice(1).every(a => a.includes(args[0])).toString();
        case "AND":
            return args.every(a => a === "true").toString();
        case "OR":
            return args.some(a => a === "true").toString();
        case "CONCAT":
            return args.reduce((a, b) => a + b, "").toString();
        case "LEFT":
            return args[0].substring(0, parseInt(args[1])).toString();
        case "RIGHT":
            return args[0].substring(args[0].length - parseInt(args[1])).toString();
        default:
            return "NOT IMPLEMENTED";
    };
};
