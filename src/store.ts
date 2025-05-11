
import { OceanFlow as t } from "./types";


export namespace OceanFlow {

    const { FSDB } = require("file-system-db");


    export function dbSave<K, V>(db: typeof FSDB, key: K, value: V): V {
        db.set(key, value);
        return value;
    }
    export function dbLoad<K, V>(db: typeof FSDB, key: K): V | undefined {
        return db.get(key);
    }

    export const dbRoles = new FSDB("./db/Roles.json", false);
    export const dbLogins = new FSDB("./db/Logins.json", false);
    export const dbCredentials = new FSDB("./db/Credentials.json", false);
    export const dbAuditReports = new FSDB("./db/AuditReports.json", false);
    export const dbJobInstances = new FSDB("./db/JobInstances.json", false);
    export const dbFormInstances = new FSDB("./db/FormInstances.json", false);


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


}
