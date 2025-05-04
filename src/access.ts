
import * as u from "./utils"
import * as t from "./types";
import { dbLoadCredential, dbLoadRole, dbLoadUser, dbSaveCredential, dbSaveRole, dbSaveUser } from "./store";
import { OBaseInstance as OBase } from "./base";


////// security and access

// roles that provide access to the system
export type TRole = {
    name: t.TName,                    // primary key
    description: t.TDescription,
    enabled: boolean,
}

// all users of the system
export type TUser = {
    name: t.TName,                    // primary key
    email: t.TEmail,
    password: t.TPassword,            // stored in hashed form
    enabled: boolean,
}

// active roles a user has
export type TCredential = {
    userEmail: t.TEmail,              // from TUser
    userName: t.TName,                // from TUser
    roleNames: t.TName[],             // from TRole
    updatedTimestamp: t.TTimestamp,
}



export class ORole extends OBase<t.TName, TRole> {


    constructor(role: t.AtLeast<TRole, "name" | "description">) {
        const data: TRole = {
            name: role.name,
            description: role.description,
            enabled: role.enabled ?? true,
        };
        super("name", dbSaveRole, data);
    }

    isEnabled(): boolean {
        return this.data.enabled;
    }

    setEnable(status: boolean): ORole {
        this.data.enabled = status;
        return this;
    }

    static getInstance(roleName: t.TName): ORole | undefined {
        return OBase.loadInstance(roleName, dbLoadRole, ORole);
    }

}

export class OUser extends OBase<t.TEmail, TUser> {

    constructor(user: t.AtLeast<TUser, "email" | "password" | "name">) {
        const data: TUser = {
            email: user.email,
            password: user.password,
            name: user.name,
            enabled: user.enabled ?? true,
        };
        super("email", dbSaveUser, data);
    }

    setPassword(password: t.TPassword): OUser {
        this.data.password = password;
        return this;
    }

    isEnabled(): boolean {
        return this.data.enabled;
    }

    setEnable(status: boolean): OUser {
        this.data.enabled = true;
        return this;
    }

    static getInstance(emailId: t.TEmail): OUser | undefined {
        return OBase.loadInstance(emailId, dbLoadUser, OUser);
    }

}


export class OCredential extends OBase<t.TEmail, TCredential> {


    constructor(credential: t.AtLeast<TCredential, "userEmail" | "userName">) {
        const data: TCredential = {
            userEmail: credential.userEmail,
            userName: credential.userName,
            roleNames: credential.roleNames ?? [],
            updatedTimestamp: credential.updatedTimestamp ?? u.TimestampStr(),
        };
        super("userEmail", dbSaveCredential, data);
    }

    addRole(role: ORole): OCredential {
        if (OBase.addToArray(this.data.roleNames, role.getId())) {
            this.data.updatedTimestamp = u.TimestampStr();
        }
        return this;
    }

    removeRole(role: ORole): OCredential {
        if (OBase.removeFromArray(this.data.roleNames, role.getId())) {
            this.data.updatedTimestamp = u.TimestampStr();
        }
        return this;
    }


    static getInstance(emailId: t.TEmail): OCredential | undefined {
        return OBase.loadInstance(emailId, dbLoadCredential, OCredential);
    }

}

