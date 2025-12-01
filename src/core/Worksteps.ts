
import { SpecIdT, InstanceIdT, JSONObjectT, NameT, ExpressionT } from "./Types.js";
import { WorkflowInstanceT } from "./Workflows.js";
import { randomStr } from "./Utils.js";
import { calculateExpression } from "./Expressions.js";
import { db } from "./Firebase.js";

import * as firestore from "firebase/firestore";
import * as logger from "firebase-functions/logger"



export enum StepStatusE { WAITING, EXECUTE_READY, EXECUTE_SUCCESS, NAVIGATED, EXECUTE_FAIL, TERMINATED };

export type StepExecuteF = (flowData: JSONObjectT, newData: JSONObjectT) => StepStatusE;


export type WorkstepLibT = SpecIdT & {
    guardExpression?: ExpressionT,
    systemStep: boolean,
    executeLogic: StepExecuteF,
};

export type WorkstepSpecT = WorkstepLibT & {
    prevSteps: SpecIdT[],
    nextSteps: SpecIdT[], 
};

export type WorkstepInstanceT = SpecIdT & {
    instanceId: InstanceIdT,
    flowInstanceId: InstanceIdT,
    prevStepsCompleted: { [stepname: NameT]: boolean },
    status: StepStatusE,
    dataTmp: JSONObjectT,
};

export function canPassGuardExpression(workstepSpec: WorkstepSpecT, flowData: JSONObjectT): boolean {
    if (workstepSpec.guardExpression) {
        return calculateExpression(workstepSpec.guardExpression, flowData);
    };
    return true;
};


export async function createWorkstep(workstepSpec: WorkstepSpecT, flowInstance: WorkflowInstanceT, creatorStep: NameT): Promise<WorkstepInstanceT> {
    // 
    let workstepInstance: WorkstepInstanceT;
    // if this step has multiple previous steps
    if (workstepSpec.prevSteps.length > 1) {
        const existingSteps = flowInstance.stepsData[workstepSpec.specName];
        // if there is a previous created step that is waiting (on previous steps)
        if (existingSteps && existingSteps[existingSteps.length].status == StepStatusE.WAITING) {
            workstepInstance = await loadStepInstance(existingSteps[existingSteps.length].instanceId);
            workstepInstance.prevStepsCompleted[creatorStep] = true;
            const allPrevStepsCompleted: boolean = Object.values(workstepInstance.prevStepsCompleted).every(val => val == true);
            workstepInstance.status = allPrevStepsCompleted ? StepStatusE.EXECUTE_READY : StepStatusE.WAITING;
            return Promise.resolve(workstepInstance);
        };
    };
    // at this point => means new step must be created
    const prevStepsCompleted: { [stepname: NameT]: boolean } = {};
    workstepSpec.prevSteps.forEach((prevStepSpec) => {
        prevStepsCompleted[prevStepSpec.specName] = false;
        // log this update
    });
    prevStepsCompleted[creatorStep] = true;
    const allPrevStepsCompleted: boolean = Object.values(prevStepsCompleted).every(val => val == true);
    workstepInstance = {
        specName: workstepSpec.specName,
        specVersion: workstepSpec.specVersion,
        instanceId: randomStr(40),
        flowInstanceId: flowInstance.instanceId,
        prevStepsCompleted: prevStepsCompleted,
        status: allPrevStepsCompleted ? StepStatusE.EXECUTE_READY : StepStatusE.WAITING,
        dataTmp: {},
    };
    return Promise.resolve(workstepInstance);
};


//// firestore interactions for Worksteps

/*
type WorkstepInstanceDBModelT = WorkstepInstanceT;

//class WorkstepConverter implements firestore.FirestoreDataConverter<WorkstepInstanceT, WorkstepInstanceDBModelT> {
const WorkstepConverter: firestore.FirestoreDataConverter<WorkstepInstanceT, WorkstepInstanceDBModelT> = {

    toFirestore(workstepInstance: firestore.WithFieldValue<WorkstepInstanceT>): firestore.WithFieldValue<WorkstepInstanceDBModelT> {
        return workstepInstance;
    },

    fromFirestore(snapshot: firestore.QueryDocumentSnapshot, options: firestore.SnapshotOptions): WorkstepInstanceT {
        const data = snapshot.data(options) as WorkstepInstanceDBModelT;
        return data as WorkstepInstanceT;
    },

};
*/

export const DB_WORKSTEPS = "Worksteps";

export async function saveStepInstance(workstepInstance: WorkstepInstanceT): Promise<void> {
    const docRef = firestore.doc(db, DB_WORKSTEPS, workstepInstance.instanceId); // .withConverter(WorkstepConverter);
    await firestore.setDoc(docRef, workstepInstance); // try non blocking saves ???
};

export async function loadStepInstance(instanceId: InstanceIdT): Promise<WorkstepInstanceT> {
    const docRef = firestore.doc(db, DB_WORKSTEPS, instanceId); // .withConverter(WorkstepConverter);
    const snapshot = await firestore.getDoc(docRef);
    return snapshot.data() as WorkstepInstanceT;
};

async function existingStepInstance(flowInstance: WorkflowInstanceT, specName: NameT): Promise<WorkstepInstanceT> {
    const workstepsRef = firestore.collection(db, DB_WORKSTEPS);
    const where1 = firestore.where("flowInstanceId", "==", flowInstance.instanceId);
    const where2 = firestore.where("specName", "==", specName);
    const where3 = firestore.where("status", "==", StepStatusE.WAITING);
    const q = firestore.query(workstepsRef, where1, where2, where3);
    const querySnapshot = await firestore.getDocs(q);
    // should we have a check (logger.error) for more than 1 result?
    switch (querySnapshot.size) {
        case 0:
            return undefined;
        case 1:
            return querySnapshot.docs[0].data() as WorkstepInstanceT;
        default:
            // should not reach this point
            // logger error
            logger.error(`impossible multiple [${querySnapshot.size}] instances of step found step ${specName}`, flowInstance);
            throw new Error("workflow corrupted, see error log.");
    };
};
