/**
 * @fileoverview This file defines custom error types for the Simpleflow application.
 * @author Riyaz Mansoor <riyaz.mansoor@gmail.com>
 * @version 1.0
 */

// Import necessary types from other modules.
import { HtmlT, JSONObjectT, NameT, SpecIdT, TimestampStrT } from "./Types.js";
import { timestampStr } from "./Utils.js";

/**
 * Defines the types of errors that can occur within the application.
 */
export enum ErrorTypeE {
    /** An error related to the workflow logic. */
    FLOW,
    /** An error related to data validation. */
    DATA,
    /** An error related to caching. */
    CACHE,
    /** An unknown or uncategorized error. */
    UNKNOWN
};

/**
 * Represents the structure of the data associated with an error.
 */
export type ErrorDataT = {
    /** A timestamp string indicating when the error occurred. */
    timestampStr: TimestampStrT,
    /** The type of the error. */
    errorTypeE: ErrorTypeE, 
    /** An optional key or name associated with the error. */
    key?: NameT, 
    /** The error message, which can be in HTML format. */
    message: HtmlT,
    /** A JSON object containing additional data related to the error. */
    data: JSONObjectT,
};


/**
 * A custom error class for the Simpleflow application.
 * It encapsulates detailed error information.
 */
export class SimpleflowError extends Error {

    /**
     * Creates a new SimpleflowError for a duplicate spec error.
     * @param message The error message.
     * @param data Additional data related to the error.
     * @returns A new SimpleflowError instance.
     */
    static errorSpecDuplicate(message: HtmlT, data: JSONObjectT): SimpleflowError {
        const errorT: ErrorDataT = {
            timestampStr: timestampStr(),
            errorTypeE: ErrorTypeE.CACHE,
            message: message,
            data: data,
        };
        return new SimpleflowError(message, errorT);
    };

    /**
     * Creates a new SimpleflowError for a spec not found error.
     * @param message The error message.
     * @param data Additional data related to the error.
     * @returns A new SimpleflowError instance.
     */
    static errorSpecNotFound(message: HtmlT, data: JSONObjectT): SimpleflowError {
        const errorT: ErrorDataT = {
            timestampStr: timestampStr(),
            errorTypeE: ErrorTypeE.CACHE,
            message: message,
            data: data,
        };
        return new SimpleflowError(message, errorT);
    };

    /**
     * Creates a new SimpleflowError for when a workflow is not active.
     * @param specIdT The SpecIdT of the inactive workflow.
     * @returns A new SimpleflowError instance.
     */
    static errorWorkflowNotActive(specIdT: SpecIdT): SimpleflowError {
        const message = "Workflow is NOT active.";
        const errorT: ErrorDataT = {
            timestampStr: timestampStr(),
            errorTypeE: ErrorTypeE.FLOW,
            message: message,
            data: specIdT,
        };
        return new SimpleflowError(message, errorT);
    };

    /**
     * Creates a new SimpleflowError for a data validation error.
     * @param name The name associated with the data validation error.
     * @param message The error message.
     * @param data Additional data related to the error.
     * @returns A new SimpleflowError instance.
     */
    static errorDataValidation(name: NameT, message: HtmlT, data: JSONObjectT): SimpleflowError {
        const errorT: ErrorDataT = {
            timestampStr: timestampStr(),
            errorTypeE: ErrorTypeE.DATA,
            key: name,
            message: message,
            data: data,
        };
        return new SimpleflowError(message, errorT);
    };    
    /**
     * The detailed data associated with the error.
     */
    private readonly errorDataT: ErrorDataT;

    /**
     * Private constructor to create a new SimpleflowError.
     * Use the static factory methods to create instances of this class.
     * @param msg The error message.
     * @param errorDetailT The detailed error data.
     */
    private constructor(msg: string, errorDetailT: ErrorDataT) {
        super(msg);
        this.errorDataT = errorDetailT;
    };

   /**
     * Returns the detailed data associated with the error.
     * @returns The error data.
     */
    getData(): ErrorDataT {
        return this.errorDataT;
    };

};