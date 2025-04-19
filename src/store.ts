
import { TUser, TEmail, TRole, TRoleName, TCredential, TName, TInstanceId, TFlowSpec } from "./types";
import { TFlowInstance } from "./flows";
import { TTaskInstance } from "./tasks";

const { FSDB } = require("file-system-db");

const dbFlowSpecs = new FSDB("./db/FlowSpecs.json", false);
export function dbSaveFlowSpec(flowSpec: TFlowSpec): void {
    dbFlowSpecs.set(flowSpec.flowSpecName, flowSpec);
}
export function dbLoadFlowSpec(flowName: TName): TFlowSpec {
    return dbFlowSpecs.get(flowName);
}

const dbFlowInstances = new FSDB("./db/FlowInstances.json", false);
export function dbSaveFlowInstance(flowInstance: TFlowInstance): void {
    dbFlowInstances.set(flowInstance.flowInstanceId, flowInstance);
}
export function dbLoadInstance(flowInstanceId: TInstanceId): TFlowInstance | undefined {
    return dbFlowInstances.get(flowInstanceId);
}

const dbTaskInstances = new FSDB("./db/TaskInstances.json", false);
export function dbSaveTaskInstance(taskInstance: TTaskInstance): void {
    dbTaskInstances.set(taskInstance.taskInstanceId, taskInstance);
}
export function dbLoadTaskInstance(taskInstanceId: TInstanceId): TTaskInstance | undefined {
    return dbTaskInstances.get(taskInstanceId);
}


const dbUsers = new FSDB("./db/Users.json", false);
export function dbSaveUser(user: TUser): void {
    dbUsers.set(user.emailId, user);
}
export function dbLoadUser(emailId: TEmail): TUser | undefined {
    return dbUsers.get(emailId);
}

const dbRoles = new FSDB("./db/Roles.json", false);
export function dbSaveRole(role: TRole): void {
    dbUsers.set(role.name, role);
}
export function dbLoadRole(roleName: TRoleName): TRole | undefined {
    return dbRoles.get(roleName);
}

const dbCredentials = new FSDB("./db/Credentials.json", false);
export function dbSaveCredential(credential: TCredential): void {
    dbCredentials.set(credential.emailId, dbCredentials);
}
export function dbLoadCredential(emailId: TEmail): TCredential | undefined {
    return dbCredentials.get(emailId);
}

