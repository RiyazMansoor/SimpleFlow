

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
    export const dbTaskInstances = new FSDB("./db/TaskInstances.json", false);
    export const dbFormInstances = new FSDB("./db/FormInstances.json", false);
    export const dbFlowInstances = new FSDB("./db/FlowInstances.json", false);


}
