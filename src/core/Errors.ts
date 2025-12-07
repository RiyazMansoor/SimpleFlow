/**
 * This file defines custom error type for the Simpleflow application.
 * ALL errors that expected in the SimpleFlow application are defined here
 * @author Riyaz Mansoor <riyaz.mansoor@gmail.com>
 * @version 1.0
 */

// Import necessary types from other modules.
import * as t from "./Types.js;"
import { getJsonValue, timestampStr } from "./Utils.js";

/**
 * Defines the types of errors that can occur within the application.
 */
export enum ErrorTypeE {
    APP,
    DATA,
    CACHE,
    SPEC,
    INSTANCE,
    FLOWSPEC,
    STEPSPEC,
    FLOWINSTANCE,
    STEPINSTANCE,
};

/**
 * Represents the structure of the data associated with an error.
 */
export type ErrorDataT = {
    /** A timestamp string indicating when the error occurred. */
    timestampStr: t.TimestampStrT,
    /** The type of the error. */
    errorTypeE: ErrorTypeE, 
    /** An optional key or name associated with the error. */
    key?: t.NameT, 
    /** The error message, which can be in HTML format. */
    message: t.HtmlT,
    /** A JSON object containing additional data related to the error. */
    data: t.JSONObjectT,
};



export function specDuplicated(message: t.HtmlT, data: t.JSONObjectT): SimpleflowError {
    const errorT: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.CACHE,
        message: message,
        data: data,
    };
    return new SimpleflowError(errorT);
};

export function specNotActive(specDefT: t.SpecDefT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.SPEC,
        message: `Request spec is NOT active.`,
        data: specDefT,
    };
    return new SimpleflowError(errorData);
};

export function dataInvalid(dataSpec: t.DataSpecT, data: t.JSONObjectT): SimpleflowError {
    const val = getJsonValue(data, dataSpec.name);
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.DATA,
        message: `Data validation failed.`,
        data: { dataSpec: dataSpec, data: val },
    };
    return new SimpleflowError(errorData);
};    

export function dataCalulation(msg: t.HtmlT, data: t.JSONObjectT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.DATA,
        message: msg,
        data: data,
    };
    return new SimpleflowError(errorData);
};

export function securityViolation(specDefT: t.SpecDefT, email: t.EmailT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.APP,
        message: `Security access violation by user [${email}]`,
        data: specDefT,
    };
    return new SimpleflowError(errorData);
};

export function wfSpecNotFound(specIdT: t.SpecIdT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.SPEC,
        message: `Workflow spec NOT found.`,
        data: specIdT,
    };
    return new SimpleflowError(errorData);
};

export function wsSpecNotFound(specIdT: t.SpecIdT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.SPEC,
        message: `Workstep spec NOT found.`,
        data: specIdT,
    };
    return new SimpleflowError(errorData);
};

export function expectedWsInputSpec(wsSpecDef: t.SpecDefT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.APP,
        message: `Expected a WsInputSpec.`,
        data: wsSpecDef,
    };
    return new SimpleflowError(errorData);
};

export function expectedWsSystemSpec(wsSpecDef: t.SpecDefT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.STEPSPEC,
        message: `Expected a WsSystemSpec.`,
        data: wsSpecDef,
    };
    return new SimpleflowError(errorData);
};

export function expectedWsInputInstanceKey(wsInstanceKey: t.HasInstanceKeyT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.STEPINSTANCE,
        message: `Expected an WsInstanceKey of type WsInputInstanceKey.`,
        data: wsInstanceKey,
    };
    return new SimpleflowError(errorData);
};

export function expectedWsSystemInstanceKey(wsInstanceKey: t.HasInstanceKeyT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.STEPINSTANCE,
        message: `Expected an WsInstanceKey of type WsSystemInstanceKey.`,
        data: wsInstanceKey,
    };
    return new SimpleflowError(errorData);
};

export function wfCreatedHasNoWorkSteps(flowSpecIdT: t.SpecIdT, dataInput: t.JSONObjectT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.FLOWINSTANCE,
        message: `Work flow created has NO steps .`,
        data: { flowSpecIdT: flowSpecIdT, dataInput: dataInput },
    };
    return new SimpleflowError(errorData);
    
};

export function wsCannotSelect(wsInputInstance: t.WsInputInstanceT, email: t.EmailT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.STEPINSTANCE,
        message: `Workstep already selected by another user [${wsInputInstance.userActive}].`,
        data: { wsInstance: wsInputInstance, attempter: email },
    };
    return new SimpleflowError(errorData);
};

export function wsCannotReturn(wsInputInstance: t.WsInputInstanceT, email: t.EmailT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.STEPINSTANCE,
        message: `Workstep already selected by another user.`,
        data: { wsInstance: wsInputInstance, attempter: email },
    };
    return new SimpleflowError(errorData);
};

export function wsCannotSubmit(wsInputInstance: t.WsInputInstanceT, email: t.EmailT): SimpleflowError {
    const errorData: ErrorDataT = {
        timestampStr: timestampStr(),
        errorTypeE: ErrorTypeE.STEPINSTANCE,
        message: `Workstep already selected by another user.`,
        data: { wsInstance: wsInputInstance, attempter: email },
    };
    return new SimpleflowError(errorData);
};



/**
 * A custom error class for the Simpleflow application.
 * It encapsulates detailed error information.
 */
export class SimpleflowError extends Error {

    /**
     * The detailed data associated with the error.
     */
    private readonly errorDataT: ErrorDataT;

    /**
     * Use the static factory methods to create instances of this class.
     * @param errorData The detailed error data.
     */
    constructor(errorData: ErrorDataT) {
        super(errorData.message);
        this.errorDataT = errorData;
    };

   /**
     * Returns the detailed data associated with the error.
     * @returns The error data.
     */
    getData(): ErrorDataT {
        return this.errorDataT;
    };

};