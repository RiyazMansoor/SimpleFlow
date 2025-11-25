
import { SpecIdT, InstanceIdT, JSONObjectT, NameT } from "./Types";
import { ConditionT } from "./Conditions";
import { WorkflowInstance } from "./Workflows";
import { randomStr } from "./Utils";


export enum StepStatusE { WAITING, EXECUTE_READY, EXECUTE_SUCCESS, NAVIGATED, EXECUTE_FAIL, TERMINATED };

export type StepEntryF = (flowData: JSONObjectT) => boolean;

export type StepExecuteF = (flowData: JSONObjectT, newData: JSONObjectT) => StepStatusE;


export type WorkstepLipSpecT = {
    stepSpecIdT: SpecIdT,
    stepConditionT?: ConditionT,
    stepRequiresExternalData: boolean,
    stepExecuteF: StepExecuteF,
};

export type WorkstepSpecT = WorkstepLipSpecT & {
    stepPrevNames: NameT[],
    stepNextNames: NameT[], 
};

export type WorkstepInstanceT = {
    stepInstanceIdT: InstanceIdT,
    flowInstanceIdT: InstanceIdT,
    stepSpecIdT: SpecIdT,
    completedPreSteps: { [stepname: NameT]: boolean },
    stepStatusE: StepStatusE,
    tempDataT: JSONObjectT,
};

export interface WorkstepInstance {

    stepPrevCompleted(stepName: NameT): boolean;

    stepExecute(newData: JSONObjectT): StepStatusE;

    stepNextSteps(): NameT[];
    
};

export class WorkstepInstanceImpl implements WorkstepInstance {

    private readonly workflowInstance: WorkflowInstance;

    private readonly workstepSpecT: WorkstepSpecT;
    private readonly workstepInstanceT: WorkstepInstanceT;

    constructor(workflowInstance: WorkflowInstance, workstepSpec: WorkstepSpecT, workstepInstanceT?: WorkstepInstanceT) {
        this.workflowInstance = workflowInstance;
        this.workstepSpecT = workstepSpec;
        if (!workstepInstanceT) {
            const completedPreSteps: { [stepname: NameT]: boolean } = {}; 
            for (const stepname of workstepSpec.stepNextNames) {
                completedPreSteps[stepname] = false;
            };
            workstepInstanceT = {
                stepInstanceIdT: randomStr(),
                flowInstanceIdT: workflowInstance.flowInstanceIdT(),
                stepSpecIdT: workstepSpec.stepSpecIdT,
                completedPreSteps: completedPreSteps,
                stepStatusE: workstepSpec.stepRequiresExternalData ? StepStatusE.WAITING : StepStatusE.EXECUTE_READY,
                tempDataT: {},
            };
        };
        this.workstepInstanceT = workstepInstanceT;
    };
    
    stepPrevCompleted(stepName: string): boolean {
        const steps = this.workstepInstanceT.completedPreSteps;
        steps[stepName] = true;
        return Object.keys(steps).reduce((pVal, stepName) => pVal && steps[stepName], true);
    };

    stepExecute(newData: JSONObjectT): StepStatusE {
        const status = this.workstepInstanceT.stepStatusE;
        if (status != StepStatusE.EXECUTE_READY && status != StepStatusE.EXECUTE_FAIL) {
            return status;
        }
        this.workstepInstanceT.stepStatusE = this.workstepSpecT.stepExecuteF(this.workflowInstance.flowDataT(), newData);
        return this.workstepInstanceT.stepStatusE
    };

    stepNextSteps(): NameT[] {
        return this.workstepSpecT.stepNextNames;
    };

};

