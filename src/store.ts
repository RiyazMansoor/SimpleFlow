
import * as t from "./types";
import { TFlowInstance } from "./flows";
import { TTaskInstance } from "./task";
import { TCredential, TRole, TUser } from "./access";
import { TAuditReport } from "./audit";

const { FSDB } = require("file-system-db");


function dbSave<K, V>(db: typeof FSDB, key: K, value: V): V {
    db.set(key, value);
    return value;
}
function dbLoad<K, V>(db: typeof FSDB, key: K): V | undefined {
    return db.get(key);
}
// function dbLoadAsType<K, V>(db: typeof FSDB, key: K): V {
//     const instance = db.get(key);
//     if (!instance) {
//         throw `expected value with Id [${key}] not found in db`;
//     }
//     return instance as V;
// }


const dbUsers = new FSDB("./db/Users.json", false);
export function dbSaveUser(key: t.TEmail, user: TUser): TUser {
    return dbSave<t.TName, TUser>(dbUsers, key, user);
}
export function dbLoadUser(userEmailId: t.TEmail): TUser | undefined {
    return dbLoad<t.TName, TUser>(dbUsers, userEmailId);
}

const dbRoles = new FSDB("./db/Roles.json", false);
export function dbSaveRole(key: t.TName, role: TRole): TRole {
    return dbSave<t.TName, TRole>(dbRoles, key, role);
}
export function dbLoadRole(key: t.TName): TRole | undefined {
    return dbLoad<t.TName, TRole>(dbRoles, key);
}

const dbCredentials = new FSDB("./db/Credentials.json", false);
export function dbSaveCredential(key: t.TEmail, credential: TCredential): TCredential {
    return dbSave<t.TInstanceId, TCredential>(dbCredentials, key, credential);
}
export function dbLoadCredential(userEmailId: t.TEmail): TCredential | undefined {
    return dbLoad<t.TEmail, TCredential>(dbCredentials, userEmailId);
}
// export function dbAsCredential(userEmailId: type.TEmail): type.TCredential {
//     return dbLoadAsType<type.TEmail, type.TCredential>(dbCredentials, userEmailId);
// }



const dbErrors = new FSDB("./db/Errors.json", false);
export function dbSaveError(key: t.TInstanceId, error: TAuditReport): TAuditReport {
    return dbSave<t.TInstanceId, TAuditReport>(dbErrors, key, error);
}
export function dbLoadError(instanceId: t.TInstanceId): TAuditReport | undefined {
    return dbLoad<t.TInstanceId, TAuditReport>(dbErrors, instanceId);
}


const dbFlowSpecs = new FSDB("./db/FlowSpecs.json", false);
export function dbSaveFlowSpecification(key: t.TName, flowSpecification: t.TFlowSpecification): t.TFlowSpecification {
    return dbSave<t.TInstanceId, t.TFlowSpecification>(dbFlowSpecs, key, flowSpecification);
}
export function dbLoadFlowSpecification(flowName: t.TName): t.TFlowSpecification | undefined {
    return dbLoad<t.TName, t.TFlowSpecification>(dbFlowSpecs, flowName);
}
// export function dbAsFlowSpec(flowName: type.TEmail): type.TFlowSpec {
//     return dbLoadAsType<type.TEmail, type.TFlowSpec>(dbFlowSpecs, flowName);
// }

const dbFlowInstances = new FSDB("./db/FlowInstances.json", false);
export function dbSaveFlowInstance(key: t.TInstanceId, flowInstance: TFlowInstance): TFlowInstance {
    return dbSave<t.TInstanceId, TFlowInstance>(dbFlowInstances, key, flowInstance);
}
export function dbLoadFlowInstance(flowInstanceId: t.TInstanceId): TFlowInstance | undefined {
    return dbLoad<t.TInstanceId, TFlowInstance>(dbFlowInstances, flowInstanceId);
}
// export function dbAsFlowInstance(flowInstanceId: type.TInstanceId): type.TFlowInstance {
//     const instance = dbLoadFlowInstance(flowInstanceId);
//     if (!instance) {
//         throw `expected flow instance with Id [${flowInstanceId}] not found in db`
//     }
//     return instance as type.TFlowInstance;
// }

const dbTaskInstances = new FSDB("./db/TaskInstances.json", false);
export function dbSaveTaskInstance(key: t.TInstanceId, taskInstance: TTaskInstance): TTaskInstance {
    return dbSave<t.TInstanceId, TTaskInstance>(dbTaskInstances, key, taskInstance);
}
export function dbLoadTaskInstance(key: t.TInstanceId): TTaskInstance | undefined {
    return dbLoad<t.TInstanceId, TTaskInstance>(dbTaskInstances, key);
}


