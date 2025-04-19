
import * as util from "./utils";
import { TCredential, TRoleName } from "./access";
import { TTimestamp } from "./types";
import { TDataSpec, TFlowSpec } from "./flows";
import { dbLoadTaskInstance, dbLoadTaskSpec, dbSaveTaskInstance } from "./tasksdb";


// common properties for tasks
// currently human-tasks and system-tasks
export type TTaskInstance = {
    taskSpecName: TTaskSpecName,
    taskInstanceId: TInstanceId,
    flowInstanceId: TInstanceId,
    taskStatus: ETaskStatus,
    createdTimestamp: TTimestamp,
    // -- human input tasks --
    // users access task form
    accesses: {
        credential: TCredential,
        selectedTimestamp: TTimestamp,
        returnedTimestamp?: TTimestamp,
        executedTimestamp?: TTimestamp,
    }[],
    // users have the option to temp save values without submitting
    // these temp values stored here, will be populated upon form load later
    taskTempData?: TDataSpec
}

export enum ETaskAction {
    CREATE,
    SELECT,
    RETURN,
    SUBMIT
}


export function taskCreate(credential: TCredential, taskSpecName: TTaskSpecName, flowInstanceId: TInstanceId): TTaskInstance {
    const taskSpec: TTaskSpec = dbLoadTaskSpec(taskSpecName);
    // check authorization
    if (!taskAuthorised(taskSpec, credential)) {
        throw ``;
    }
    const taskInstance: TTaskInstance = {
        taskSpecName: taskSpecName,
        taskInstanceId: util.RandomStr(),
        flowInstanceId: flowInstanceId,
        taskStatus: ETaskStatus.CREATED,
        createdTimestamp: util.TimestampStr(),
        accesses: [],
    }
    dbSaveTaskInstance(taskInstance);
    return taskInstance;
}

export function taskController(credential: TCredential, taskAction: ETaskAction, taskInstanceId: TInstanceId) {
    // load entities
    const taskInstance = dbLoadTaskInstance(taskInstanceId);
    const taskSpec = dbLoadTaskSpec(taskInstance.taskSpecName);
    // check authorization
    if (!taskAuthorised(taskSpec, credential)) {
        throw ``;
    }
    // execute action
    switch (taskAction) {
        case ETaskAction.CREATE:

            break;
        case ETaskAction.SELECT:
            if (taskInstance.taskStatus === ETaskStatus.SELECTED) {
                throw `already selected by user[]`;
            }
            taskInstance.taskStatus = ETaskStatus.SELECTED;
            const lastAccess = taskInstance.accesses[taskInstance.accesses.length-1];

            taskInstance.accesses = {
                credential: credential,
                selectedTimestamp: util.TimestampStr(),
            }
            dbSaveTaskInstance(taskInstance);
            // return ?            
            break;
        case ETaskAction.RETURN:
            taskInstance.taskStatus = ETaskStatus.RETURNED;
            taskInstance.timestamps.returned = util.TimestampStr();
            dbSaveTaskInstance(taskInstance);

            break;
        case ETaskAction.SUBMIT:

            break;
        default:        
    }
}

function taskAuthorised(taskSpec: TTaskSpec, credential: TCredential): boolean {
    switch (taskSpec.taskType) {
        case ETaskType.SYSTEM: 
            // system tasks are be design, needs no authorization
            return true;
        case ETaskType.HUMAN:
            // human tasks much have authorization roles
            if (!taskSpec.taskRoles) return false;
            for (let i = 0; i < taskSpec.taskRoles.length; i++) {
                if (credential.activeRoles.includes(taskSpec.taskRoles[i])) {
                    return true;
                }
            }
            return false;
        default:
            return false;
    }
    //    throw `user [${credential.userName}] does not have any required role from [${taskSpec.taskRoles.toString()}]`;
}

export function taskSelect(credential: TCredential, taskInstanceId: string): any {
    const task: TTaskInstance = dbLoadTask(taskInstanceId);
    const taskSpec: TTaskSpec = dbLoadTaskSpec(task.taskSpecName);
    if (!hasAccess(taskSpec, credential)) {
        // access error
    }
    const userData = {
        credential: credential,
        timestamps: {
            selected: new Date().toISOString(),
        }
    }
    task.taskUserData = userData;
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

