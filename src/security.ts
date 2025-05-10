
import { OceanFlow as t } from "./types"; 
import { OceanFlow as u } from "./utils"
import { OceanFlow as c } from "./core";
import { OceanFlow as db } from "./store";


export namespace OceanFlow {

    export class Role extends c.Instance<t.NameT, t.RoleT> {

        constructor(roleT: t.AtLeastRole) {
            const dataT: t.RoleT = {
                nameT: roleT.nameT,
                descriptionT: roleT.descriptionT,
                enabled: roleT.enabled ?? true,
            };
            super(t.RolePK, db.dbSaveRole, dataT);
        }

        static getInstance(roleNameT: t.NameT): Role | undefined {
            return super.loadInstance(roleNameT, db.dbLoadRole, Role);
        }

        getDescription(): t.DescriptionT {
            return this.dataT.descriptionT;
        }

        setDescription(descriptionT: t.DescriptionT): Role {
            this.dataT.descriptionT = descriptionT;
            return this;
        }

        isEnabled(): boolean {
            return this.dataT.enabled;
        }

        enable(status: boolean): Role {
            this.dataT.enabled = status;
            // todo => iterate credentials to update disabled status
            return this;
        }

    }

    export class Login extends c.Instance<t.EmailT, t.LoginT> {

        constructor(loginT: t.AtLeastLogin) {
            const dataT: t.LoginT = {
                emailT: loginT.emailT,
                passwordT: loginT.passwordT,
            };
            super(t.LoginPK, db.dbSaveUser, dataT);
        }

        static getInstance(emailT: t.EmailT): Login | undefined {
            return super.loadInstance(emailT, db.dbLoadUser, Login);
        }

        setPassword(passwordT: t.PasswordT): Login {
            this.dataT.passwordT = passwordT;
            return this;
        }

        match(password: t.PasswordT): boolean {
            return this.dataT.passwordT == password;
        }

    }

    export class Credential extends c.Instance<t.EmailT, t.CredentialT> {

        constructor(credentialT: t.AtLeastCredential) {
            const dataT: t.CredentialT = {
                emailT: credentialT.emailT,
                nameT: credentialT.nameT,
                hasRoleNamesT: credentialT.hasRoleNamesT ?? [],
                enabled: credentialT.enabled ?? true,
                updatedT: credentialT.updatedT ?? [],
            };
            super(t.CredentialPK, db.dbSaveCredential, dataT);
        }

        static getInstance(emailT: t.EmailT): Credential | undefined {
            return super.loadInstance(emailT, db.dbLoadCredential, Credential);
        }

        addRole(roleNameT: t.NameT): Credential {
            const index = this.dataT.hasRoleNamesT.indexOf(roleNameT);
            if (index < 0) {
                this.dataT.hasRoleNamesT.push(roleNameT);
                this.update();
            };
            return this;
        }

        removeRole(roleNameT: t.NameT): Credential {
            const index = this.dataT.hasRoleNamesT.indexOf(roleNameT);
            if (index >= 0) {
                this.dataT.hasRoleNamesT.splice(index, 1);
                this.update();
            };
            return this;
        }

        hasRoles(): t.NameT[] {
            return this.dataT.hasRoleNamesT;
        }

        isEnabled(): boolean {
            return this.dataT.enabled;
        }

        enable(status: boolean): Credential {
            this.dataT.enabled = status;
            this.update();
            return this;
        }

        loadPayload(jsonObjectT: t.JSONObjectT): t.AtLeastAuditReport {
            const atLeastAuditReport: t.AtLeastAuditReport = {
                credentialT: this.dataT,
            };
            return Object.assign(atLeastAuditReport, jsonObjectT);
        }

        private update(): void {
            this.dataT.updatedT.push(u.TimestampStr());
            this.dataT.updatedT = this.dataT.updatedT.slice(-10);
        }

    }

}