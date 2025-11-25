
import * as logger from 'firebase-functions/logger';

import { JSONObjectT, SpecIdT, HtmlT, NameT, InstanceIdT, AdminDataT, JSONPrimitiveT } from "./Types.js";
import { randomStr, timestampStr } from "./Utils.js";
import { WorkstepSpecT } from "./Worksteps.js";
import { ConditionT } from './Conditions.js';


export enum DataType {
    STRING, INTEGER, FLOAT, DATESTR, BOOLEAN
};

export type DataSpecT = {
    dataNameT: NameT,
    dataDescriptionT: HtmlT,
    dataType: DataType,
    dataDefault?: JSONPrimitiveT,
    dataCondition?: ConditionT[],
};

export type WorkflowSpecT = {
    flowSpecIdT: SpecIdT,
    flowDescriptionT: HtmlT,
    flowDataSpecT: DataSpecT[],
    flowSteps: WorkstepSpecT[],
    flowStartDataNamesT: NameT[],
    flowIsActiveB: boolean,
};

export enum WorkflowStatusE {
    RUNNABLE, SUSPENDED, TERMINATED, COMPLETED_SUCCESS, COMPLETED_FAIL
};

export type WorkflowInstanceT = {
    flowInstanceIdT: InstanceIdT,
    flowSpecIdT: SpecIdT,
    flowDataT: JSONObjectT,
    flowStatusE: WorkflowStatusE
    flowAdminDataT: AdminDataT,
};


function checkWorkflowActive(workflowSpecT: WorkflowSpecT): boolean {
    if (workflowSpecT.flowIsActiveB) {
        throw new Error("Inactive workflow", workflowSpecT, startData);
    
    };

};

export function createWorkflow(workflowSpecT: WorkflowSpecT, startData: JSONObjectT): WorkflowInstanceT {
    const workflowInstanceT: WorkflowInstanceT = {
        flowInstanceIdT: randomStr(40),
        flowSpecIdT: workflowSpecT.flowSpecIdT,
        flowDataT: startData,
        flowStatusE: WorkflowStatusE.RUNNABLE,
        flowAdminDataT: {
            startTimestampT: timestampStr(),
        },
    };
    return workflowInstanceT;
};

/*
export interface WorkflowInstance {

    // flowInstanceIdT(): InstanceIdT;
    // flowDataT(): JSONObjectT;
    

};

export class WorkflowInstanceImpl implements WorkflowInstance {

    private readonly workflowInstanceT: WorkflowInstanceT;

    constructor(specIdT: SpecIdT) {
        this.workflowInstanceT = {
            flowInstanceIdT: randomStr(40),
            flowSpecIdT: specIdT,
            flowDataT: {},
            flowAdminDataT: {
                startTimestampT: timestampStr(),
            },
        };
    }
};
*/

