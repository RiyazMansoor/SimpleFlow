import { dbLoadUser, dbSaveUser } from "./store";
import * as util from "./utils"
import { TAuditLog, TCredential, TEmail, TError, TName, TPassword, TUser } from "./types";


export function apiUserCreate(credential: TCredential, emailId: TEmail, password: TPassword, name: TName): TUser {
    try {
        const user = UserCreate(emailId, password, name);
        const log: TAuditLog = {
            logEntityClass: "TUser",
            logEntityInstance: "TEmail",
            logTimestamp: util.TimestampStr(),
            logCredential: credential
            logMessage: `created TUser`
        }
        return user;
    } catch (error) {

    }
}

export function UserCreate(emailId: TEmail, password: TPassword, name: TName): TUser {
    const user = dbLoadUser(emailId);
    if (user) {
        const error: TError = {
            errorTimestamp: util.TimestampStr(),
            errorMessages: "User already exists",
            errorMethodName: "CreateUser",
            errorPayload: user,
        }
        throw error;
    }
    const newUser: TUser = {
        emailId: emailId,
        password: password,
        name: name,
        active: true,
    };
    dbSaveUser(newUser);
    return newUser;
}

function UserSelect(emailId: TEmail): TUser {
    const user = dbLoadUser(emailId);
    if (!user) {
        const error: TError = {
            errorTimestamp: util.TimestampStr(),
            errorMessages: "User not found",
            errorMethodName: "SelectUser",
            errorPayload: {},
        }
        throw error;
    }
    return user;
}

export function UserSetActive(emailId: TEmail, activeStatus: boolean): TUser {
    const user = UserSelect(emailId);
    user.active = activeStatus;
    dbSaveUser(user);
    return user;
}


export function UserSetPassword(emailId: TEmail, password: TPassword): TUser {
    const user = UserSelect(emailId);
    user.password = password;
    dbSaveUser(user);
    return user;
}
