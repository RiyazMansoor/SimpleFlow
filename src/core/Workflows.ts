

import { JSONObjectT, SpecIdT, HtmlT, NameT, InstanceIdT, AdminDataT, JSONPrimitiveT } from "./Types.js";
import { randomStr, timestampStr } from "./Utils.js";
import { DB_WORKSTEPS, WorkstepInstanceT, canPassGuardExpression, createWorkstep } from "./Worksteps.js";
import { SimpleflowError } from './Errors.js';
import { WorkstepCache } from './WorkflowService.js';

import * as firestore from "firebase/firestore";
import * as logger from "firebase-functions/logger"
import { db } from "./Firebase.js";
import { DataSpecT } from "./Data.js";


export const DB_WORKFLOWS = "Workflows";

export type WorkflowSpecT = SpecIdT & {
    dataSpecs: DataSpecT[],
    nextSteps: SpecIdT[],
    startData: NameT[],
    isActive: boolean,
};

enum WorkflowStatusE {
    RUNNABLE, SUSPENDED, TERMINATED, COMPLETED_SUCCESS, COMPLETED_FAIL
};

export type WorkflowInstanceT = SpecIdT & {
    instanceId: InstanceIdT,
    data: JSONObjectT,
    status: WorkflowStatusE,
    adminData: AdminDataT,
    stepsData: {
        [specName: NameT]: Pick<WorkstepInstanceT, "instanceId" | "status">[],
    },
};


export function validateActiveWorkflow(workflowSpecT: WorkflowSpecT): void {
    if (!workflowSpecT.isActive) {
        throw SimpleflowError.errorWorkflowNotActive(workflowSpecT);
    };
};

// workflow is active
// data has been validated
export async function createWorkflow(workflowSpecT: WorkflowSpecT, startData: JSONObjectT): Promise<void> {
    const workflowInstanceT: WorkflowInstanceT = {
        instanceId: randomStr(40),
        specName: workflowSpecT.specName,
        specVersion: workflowSpecT.specVersion,
        data: startData,
        status: WorkflowStatusE.RUNNABLE,
        adminData: {
            startTimestampT: timestampStr(),
        },
        stepsData: {},
    };
    const workstepInstancePromises: Promise<WorkstepInstanceT>[] = workflowSpecT.nextSteps
        .map((specIdT) => WorkstepCache.get(specIdT))
        .filter(workstepSpec => canPassGuardExpression(workstepSpec, startData))
        .map(workstepSpec => createWorkstep(workstepSpec, workflowInstanceT, workflowSpecT.specName));
    // TODO assert promises > 0
    Promise.all(workstepInstancePromises).then(workstepInstances => {
        const batch = firestore.writeBatch(db);
        // new workflow
        const flowRef = firestore.doc(db, DB_WORKFLOWS, workflowInstanceT.instanceId);
        batch.set(flowRef, workflowInstanceT);
        // add all the next steps
        workstepInstances.forEach(workstepInstance => {
            const stepRef = firestore.doc(db, DB_WORKSTEPS, workstepInstance.instanceId);
            batch.set(stepRef, stepRef);
        });
        return batch.commit();
    });
    logger.error(workflowInstanceT); // TODO long error message
    return Promise.reject(new Error(""));
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

