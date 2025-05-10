
import { OceanFlow as t } from "./types";


export namespace OceanFlow {

    const { FSDB } = require("file-system-db");


    function dbSave<K, V>(db: typeof FSDB, key: K, value: V): V {
        db.set(key, value);
        return value;
    }
    function dbLoad<K, V>(db: typeof FSDB, key: K): V | undefined {
        return db.get(key);
    }


    const dbUsers = new FSDB("./db/Users.json", false);
    export function dbSaveUser(key: t.EmailT, user: t.LoginT): t.LoginT {
        return dbSave<t.NameT, t.LoginT>(dbUsers, key, user);
    }
    export function dbLoadUser(userEmailId: t.EmailT): t.LoginT | undefined {
        return dbLoad<t.NameT, t.LoginT>(dbUsers, userEmailId);
    }

    const dbRoles = new FSDB("./db/Roles.json", false);
    export function dbSaveRole(key: t.NameT, role: t.RoleT): t.RoleT {
        return dbSave<t.NameT, t.RoleT>(dbRoles, key, role);
    }
    export function dbLoadRole(key: t.NameT): t.RoleT | undefined {
        return dbLoad<t.NameT, t.RoleT>(dbRoles, key);
    }

    const dbCredentials = new FSDB("./db/Credentials.json", false);
    export function dbSaveCredential(key: t.EmailT, credential: t.CredentialT): t.CredentialT {
        return dbSave<t.InstanceIdT, t.CredentialT>(dbCredentials, key, credential);
    }
    export function dbLoadCredential(userEmailId: t.EmailT): t.CredentialT | undefined {
        return dbLoad<t.EmailT, t.CredentialT>(dbCredentials, userEmailId);
    }



    const dbErrors = new FSDB("./db/Errors.json", false);
    export function dbSaveAuditReport(key: t.InstanceIdT, error: t.AuditReportT): t.AuditReportT {
        return dbSave<t.InstanceIdT, t.AuditReportT>(dbErrors, key, error);
    }
    export function dbLoadAuditReport(instanceId: t.InstanceIdT): t.AuditReportT | undefined {
        return dbLoad<t.InstanceIdT, t.AuditReportT>(dbErrors, instanceId);
    }


    const dbFlowSpecs = new FSDB("./db/FlowSpecs.json", false);
    export function dbSaveFlowSpecification(key: t.NameT, flowSpecification: t.FlowConfigT): t.FlowConfigT {
        return dbSave<t.InstanceIdT, t.FlowConfigT>(dbFlowSpecs, key, flowSpecification);
    }
    export function dbLoadFlowSpecification(flowName: t.NameT): t.FlowConfigT | undefined {
        return dbLoad<t.NameT, t.FlowConfigT>(dbFlowSpecs, flowName);
    }

    const dbFlowInstances = new FSDB("./db/FlowInstances.json", false);
    export function dbSaveFlowInstance(key: t.InstanceIdT, flowInstance: t.FlowInstanceT): t.FlowInstanceT {
        return dbSave<t.InstanceIdT, t.FlowInstanceT>(dbFlowInstances, key, flowInstance);
    }
    export function dbLoadFlowInstance(flowInstanceId: t.InstanceIdT): t.FlowInstanceT | undefined {
        return dbLoad<t.InstanceIdT, t.FlowInstanceT>(dbFlowInstances, flowInstanceId);
    }

    const dbTaskInstances = new FSDB("./db/TaskInstances.json", false);
    export function dbSaveFormInstance(key: t.InstanceIdT, formInstance: t.FormInstanceT): t.FormInstanceT {
        return dbSave<t.InstanceIdT, t.FormInstanceT>(dbTaskInstances, key, formInstance);
    }
    export function dbLoadFormInstance(key: t.InstanceIdT): t.FormInstanceT | undefined {
        return dbLoad<t.InstanceIdT, t.FormInstanceT>(dbTaskInstances, key);
    }

    const dbJobInstances = new FSDB("./db/JobInstances.json", false);
    export function dbSaveJobInstance(key: t.InstanceIdT, jobInstance: t.JobInstanceT): t.JobInstanceT {
        return dbSave<t.InstanceIdT, t.JobInstanceT>(dbJobInstances, key, jobInstance);
    }
    export function dbLoadJobInstance(key: t.InstanceIdT): t.JobInstanceT | undefined {
        return dbLoad<t.InstanceIdT, t.JobInstanceT>(dbJobInstances, key);
    }

}
