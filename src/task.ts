
import * as u from "./utils";
import * as t from "./types";
import { OAuditReport } from "./audit";
import { OBaseInstance } from "./base";
import { TCredential } from "./access";
import { dbLoadTaskInstance, dbSaveTaskInstance } from "./store";
import { TDataInstance } from "./flows";


//// begin task specification
//// a task is a unit of work that a user performs part of a workflow
//// a task definition defines the work to be done


// the status of a task
export enum ETaskStatus {
    CREATED,        // task created by system, waiting queue - an active state
    SELECTED,       // task has been picked from queue - an active state - HUMAN task only
    RETURNED,       // task returned to queue - this is an end state - HUMAN task only
    EXECUTED,       // task executed - this is an end state
    ABORTED,        // task aborted - by a supervisor/admin - this is an end state
}

// common properties for a task specification
export type TTaskConfig = {
    // must be a unique name withing this application domain
    name: t.TName,
    // authorised roles for this task
    roleNames: t.TName[],
    // the form to load for this task TODO remove in lieu of name
    formName: t.TName,
    // the multiple tasks that follow this task
    next: {
        // boolean expression must be true to execute this following task
        predicateExpr: t.TExpression,
        // name of the following task
        taskName: t.TName,
    }[],
}

export type TTaskAccess = {
    credential: TCredential,
    selectedTimestamp: t.TTimestamp,
    requestedTimestamp?: t.TTimestamp,
    savedTimestamp?: t.TTimestamp,
    returnedTimestamp?: t.TTimestamp,
    executedTimestamp?: t.TTimestamp,
    abortedTimestamp?: t.TTimestamp,
}

// common properties for tasks
// currently human-tasks and system-tasks
export type TTaskInstance = {
    taskInstanceId: t.TInstanceId,
    taskName: t.TName,
    flowInstanceId: t.TInstanceId,
    flowName: t.TName,
    taskConfig: TTaskConfig,
    status: ETaskStatus,
    timestamp: t.TTimestamp,
    // -- human input tasks --
    // users access task form
    accesses: TTaskAccess[],
    // users have the option to temp save values without submitting
    // these temp values stored here, will be populated upon form load later
    savedData: TDataInstance[],
    // quick access to the current user
    userEmail: t.TEmail,
}



export class TaskInstance extends OBaseInstance<t.TInstanceId, TTaskInstance> {


    constructor(taskInstance: t.AtLeast<TTaskInstance, "taskConfig" | "flowInstanceId" | "flowName">) {
        const data: TTaskInstance = {
            taskInstanceId: taskInstance.taskInstanceId ?? u.RandomStr(),
            taskName: taskInstance.taskConfig.name,
            flowInstanceId: taskInstance.flowInstanceId,
            flowName: taskInstance.flowName,
            taskConfig: taskInstance.taskConfig,
            status: taskInstance.status ?? ETaskStatus.CREATED,
            timestamp: taskInstance.timestamp ?? u.TimestampStr(),
            accesses: taskInstance.accesses ?? [],
            savedData: taskInstance.savedData ?? [],
            userEmail: "none@none.none",
        };
        super("taskInstanceId", dbSaveTaskInstance, data);
    }

    assertAuthorised(credential: TCredential): void {
        const roles: t.TName[] = this.data.taskConfig.roleNames;
        for (const credentialRole of credential.roleNames) {
            if (roles.includes(credentialRole)) {
                return;
            };
        };
        const description = "unauthorized person accessing task instance";
    }

    // throwError(credential: TCredential, description: t.TDescription, roles: t.TName[]): void {
    //     new OAuditReport({ credential: credential })
    //         .addCause({
    //             description: description,
    //             payload: {
    //                 flowName: this.data.flowInstanceId,
    //                 flowInstanceId: this.data.flowInstanceId,
    //                 taskName: this.data.taskDefinition.formName,
    //                 taskInstanceId: this.data.taskInstanceId,
    //                 authorizedRoles: roles,
    //                 requestingCredential: credential
    //             }
    //         })
    //         .save()
    //         .throw();
    // }

    selected(credential: TCredential): TaskInstance {
        this.data.status = ETaskStatus.SELECTED;
        const accessed: TTaskAccess = {
            credential: credential,
            selectedTimestamp: u.TimestampStr(),
        }
        this.data.accesses.push(accessed);
        this.data.userEmail = credential.userEmail
        return this;
    }

    returned(credential: TCredential): TaskInstance {
        this.data.status = ETaskStatus.CREATED;
        const accessed = this.data.accesses.slice(-1)[0];
        accessed.returnedTimestamp = u.TimestampStr();
        return this;
    }

    requested(credential: TCredential): TaskInstance {
        const accessed = this.data.accesses.slice(-1)[0];
        accessed.requestedTimestamp = u.TimestampStr();
        // TODO
        return this;
    }

    submitted(credential: TCredential): TaskInstance {

        return this;
    }

    aborted(credential: TCredential): TaskInstance {
        this.data.status = ETaskStatus.ABORTED;
        const accessed = {
            credential: credential,
            selectedTimestamp: u.TimestampStr(),
            abortedTimestamp: u.TimestampStr(),
        };
        this.data.accesses.push(accessed);
        return this;
    }

    static getInstance(roleName: t.TName): TaskInstance | undefined {
        return super.loadInstance(roleName, dbLoadTaskInstance, TaskInstance);
    }

}



