
import { RandomStr } from "./utils";
import { TCredential } from "./access";
import { TTimestamp } from "./types";



export enum ETaskStatus {
    OPEN,
    CLOSED
}
export type TTaskSpec = {
    taskName: string,
    next: {
        taskName: string,
        predicateExpr: string,
    }[],
}
export type TTaskInstance = {
    taskSpecName: string,
    taskInstanceId: string,
    flowInstanceId: string,
    taskStatus: ETaskStatus
}

export enum EHumanTaskStatus {
    WAITING,
    OPEN,
    CLOSED
}

export type THumanTaskSpec = TTaskSpec & {
    taskRoles: string[],
    formName: string,
}

export type THumanTaskInstance = {
    taskSpecName: string,
    taskInstanceId: string,
    flowInstanceId: string,
    adminData?: {
        credential: TCredential,
        timestamps: {
            fetched: TTimestamp,
            returned?: TTimestamp,
            submitted?: TTimestamp,
        }
    }
}


export function taskCreate(taskSpecName: string, flowInstanceId: string): THumanTaskInstance {
    const task: THumanTaskInstance = {
        taskSpecName: taskSpecName,
        taskInstanceId: RandomStr(),
        flowInstanceId: ""
    }
}

export function taskFetch(taskInstanceId: string, credential: TCredential): any {
    const task: THumanTaskInstance = dbGetHumanTask(taskInstanceId);
    const adminData = {
        credential: credential,
        timestamps: {
            fetched: new Date().toISOString(),
        }
    }
    task.adminData = adminData;
    dbSaveHumanTask(task);

}

export function taskReturn(taskInstanceId: string): void {

} 

export function taskSubmit(taskInstanceId: string): void {

}


function dbGetHumanTask(taskInstanceId: string): THumanTaskInstance {
    const task: THumanTaskInstance = {
        taskSpecName: "",
        taskInstanceId: "",
        flowInstanceId: ""
    };
    return task;
}

function dbSaveHumanTask(task: THumanTaskInstance): void {

}

