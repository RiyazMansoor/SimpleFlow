import { TEmail, TFlowSpec } from "./types";
import { TUser } from "./access";

const { FSDB } = require("file-system-db");

const dbFlowSpec = new FSDB("./dbFlowSpec.json", false);

export function loadFlowSpec(flowName: string): TFlowSpec {
    return dbFlowSpec.get(flowName);
}

const dbCredentials = new FSDB("./dbCredentials.json", false);
const REPOS = [ "users", "roles", "userroles", "roleusers" ];
REPOS.filter(key => !dbCredentials.has(key)).forEach(key => dbCredentials.set(key, {}));

export function dbAddUser(user: TUser): TUser {
    const key = `${REPOS[0]}.${user.useremail}`;
    if (dbCredentials.has(key)) {
        throw "err";
    }
    dbCredentials.set(key, user);
    return user;
}

export function dbDisableUser(user: TUser): TUser {
    const key = `${REPOS[0]}.${user.useremail}`;
    if (!dbCredentials.has(key)) {
        throw "err";
    }
    dbCredentials.set(`${key}.active`, false);
    return user;
}

export function existsUser(userEmail: TEmail): boolean {
    const key = `${REPOS[0]}.${userEmail}`;
    return (dbCredentials.has(key));
}

export function hasUserRole(userEmail: TEmail, roleName: string): boolean {
    if (existsUser(userEmail)) {
        const key = `${REPOS[2]}.${userEmail}`;
        return (dbCredentials.get(key).includes(roleName));
    }
    return false;
}

