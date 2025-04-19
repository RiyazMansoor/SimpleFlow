import { dbLoadFlowSpec } from "./store";
import { TTaskInstance, TTaskSpecName } from "./tasks";
import { DatumName, EDatumType, EWidgetAccess, TCredential, TDataSpec, TDatumSpec, TEmail, TFlowSpec, TInstanceId, TLabel, TRoleName, TTimestamp, TValidationSpec } from "./types";
import * as util from "./utils";




export type TDatumInstance = {
    type: EDatumType,
    datumValue: string | number,
}
export type TDataInstance = {
    [datumName: DatumName]: TDatumInstance | TDataInstance
}

export enum EFlowStatus {
    OPEN,
    CLOSED
}

export type TFlowInstance = {
    flowSpecName: TLabel,
    flowInstanceId: TInstanceId,
    flowCreated: {
        roleNames: TRoleName[],
        emailId: TEmail,
        timestamp: TTimestamp,
    },
    flowIterations: {
        roleNames: TRoleName[],
        emailId: TEmail,
        timestamp: TTimestamp,
        taskSpecName: TTaskSpecName,
        taskInstanceId: TInstanceId,
        data: TDataInstance,
    }[],
    flowData: TDataInstance,
    flowLog: {
        timestamp: TTimestamp,
        activity: string,
    }[],
    flowStatus: EFlowStatus,
    flowClosed: TTimestamp,
}



function findTaskSpec(flowSpec: TFlowSpec, taskSpecName: TTaskSpecName): TTaskSpecName | undefined {
    const taskSpec = flowSpec.flowTasks.find(ts => ts.taskSpecName == taskSpecName);
    if (taskSpec) return taskSpec.taskNext[0].taskName;
    return undefined;
}

// will only be called by a user
export function flowPeek(flowSpecName: TLabel, credential: TCredential): Record<string, any> {
    const flowSpec: TFlowSpec = dbLoadFlowSpec(flowSpecName);
    const roles: TRoleName[] = util.ArrayIntersection(flowSpec.flowInitRoles, credential.activeRoleNames);
    if (!roles.length) {
        return createError(flowSpec, credential, "flowPeek", `security violation - cannot peek into this workflow`);
    }
    const initFrm: TLabel = flowSpec.flowInitForm;
    const form = flowSpec.flowRendering.filter(fld => fld.forms.find(frm => frm.formName == initFrm)?.renderLevel != EWidgetAccess.HIDDEN);
    return form;
}

export function flowStart(flowSpecName: TLabel, credential: TCredential, data: TDataInstance): Record<string, any> {
    const flowSpec: TFlowSpec = dbLoadFlowSpec(flowSpecName);
    const roles: TRoleName[] = util.ArrayIntersection(flowSpec.flowInitRoles, credential.activeRoleNames);
    if (!roles.length) {
        return createError(flowSpec, credential, "flowStart", `security violation - cannot create this workflow`);
    }
    const validationErrors = validateData(flowSpec.flowDataSpec, data);
    if (validationErrors.keys().length > 0) {

    }
    // start workflow
    const flowInstance: TFlowInstance = {
        flowSpecName: flowSpec.flowSpecName,
        flowInstanceId: util.RandomStr(),
        flowCreated: {
            roleNames: credential.activeRoleNames,
            emailId: credential.emailId,
            timestamp: util.TimestampStr(),
        },
        flowIterations: [],
        flowData: data,
        flowLog: [],
        flowStatus: EFlowStatus.OPEN,
        flowClosed: util.TimestampStr(),
    };
    const taskInstance: TTaskInstance = taskCreate(credential, flowSpec.flowInitTask, flowInstance.flowInstanceId);

}

export function flowNext() {

}

function createError(flowSpec: TFlowSpec, credential: TCredential, method: string, msg: string): Record<string, any> {
    return {
        error: msg,
        method: method,
        flowName: flowSpec.flowSpecName,
        flowDescription: flowSpec.flowSpecName,
        flowRoles: flowSpec.flowInitRoles,
        userCredential: credential
    }
}

// export type TValidationSpec = {
//     dateRange?: { min?: TInteger, max?: TInteger },     // days relative to TODAY()
//     timeRange?: { min?: TInteger, max?: TInteger },     // in minutes
// }

function validateData(dataSpec: TDataSpec, data: TDataInstance): Record<string, any> {
    const violations = {};
    for (const datumName in dataSpec) {
        const genericValue = dataSpec[datumName];
        if (typeof genericValue === 'object') {
            const dataValue = genericValue as TDataSpec
            violations[datumName] = validateData(dataValue, data[datumName] as TDataInstance);
        } else {
            const datumValue = genericValue as TDatumSpec;
            if (!datumValue.validations) continue;
            const validations: TValidationSpec = datumValue.validations;
            const dataValue = data[datumName];
            //     required?: boolean,
            const required = validations.required ?? false;
            if (required) {
                if (!dataValue) {
                    violations[datumName] = `required field`;
                    continue;
                }
            }
            //     pattern?: string,
            const pattern = validations.pattern;
            if (pattern) {
                if (!dataValue.toString().match(pattern)) {
                    violations[datumName] = `pattern [${pattern}] match failed`;
                }
            }
            //     valRange?: { min?: TDecimal, max?: TDecimal },
            const valRange = validations.valRange;
            if (valRange) {
                const min = Number(valRange.min);
                if (!isNaN(min) && min > Number(dataValue)) {
                    violations[datumName] = `min value [${min}] > actual [${dataValue}]`;
                }
                const max = Number(valRange.max);
                if (!isNaN(max) && max <= Number(dataValue)) {
                    violations[datumName] = `max value [${max}] <= actual [${dataValue}]`;
                }
            }
            //     lenRange?: { min?: TInteger, max?: TInteger },
            const lenRange = validations.lenRange;
            if (lenRange) {
                const len = dataValue?.toString().length ?? 0;
                const min = Number(lenRange.min);
                if (!isNaN(min) && min > len) {
                    violations[datumName] = `min length [${min}] > actual [${len}]`;
                }
                const max = Number(lenRange.max);
                if (!isNaN(max) && max <= len) {
                    violations[datumName] = `max length [${max}] <= actual [${len}]`;
                }
            }
            // TODO
        }
    }
    return violations;
}
