
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./basics";
import { OceanFlow as i } from "./design";
import { OceanFlow as db } from "./store";


export namespace OceanFlow {


    /**
     * Security roles for access to parts of the different work-flows.
     */
    export class Role
        extends b.SavableEntity<t.NameT, t.RoleT>
        implements i.Enableable<t.RoleT> {

        static fsdb: any = db.dbRoles;

        /**
         * @see [types.AtLeastRole] minimum parameters needed
         * @param atLeastRoleT minimum role json to create this Role
         */
        constructor(atLeastRoleT: t.AtLeastRoleT) {
            const dataT: t.RoleT = {
                [t.RolePK]: atLeastRoleT[t.RolePK],
                descriptionT: atLeastRoleT.descriptionT,
                enabled: atLeastRoleT.enabled ?? true,
            };
            super(t.RolePK, dataT, Role.fsdb);
        }

        /**
         * Convenient generic static method to load Role objects.
         * @roleNameIdT the value of the primary key of the role json data object
         * @returns the Role object representing the json data object or undefined if not found
         */
        static getInstance(roleNameIdT: t.NameT): Role | undefined {
            return super.loadInstance(Role.fsdb, roleNameIdT, Role);
        }

        /**
         * @param descriptionT updated description for this role
         * @returns this object for chaining
         */
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


    /**
     * User passwords and login management
     */
    export class Login
        extends b.SavableEntity<t.EmailT, t.LoginT> {

        static fsdb: any = db.dbLogins;

        /**
         * @see [types.AtLeastLoginT] minimum parameters needed
         * @param atLeastLoginT minimum Login json data to create this Login
         */
        constructor(atLeastLoginT: t.AtLeastLoginT) {
            const dataT: t.LoginT = {
                [t.LoginPK]: atLeastLoginT[t.LoginPK],
                passwordT: atLeastLoginT.passwordT,
            };
            super(t.LoginPK, dataT, Login.fsdb);
        }

        /**
         * Convenient generic static method to load Login objects.
         * @loginEmailIdT the value of the primary key of the login json data object
         * @returns the Login object representing the json data object or undefined if not found
         */
        static getInstance(loginEmailIdT: t.EmailT): Login | undefined {
            return super.loadInstance(Login.fsdb, loginEmailIdT, Login);
        }

        /**
         * @param passwordT updated password to change
         * @returns this Login object for chaining
         */
        setPassword(passwordT: t.PasswordT): Login {
            this.dataT.passwordT = passwordT;
            return this;
        }

        /**
         * Matches entered password to the stored password.
         * @param password entered password to match
         * @returns true if password is correct
         */
        match(password: t.PasswordT): boolean {
            return this.dataT.passwordT == password;
        }

    }


    /**
     * A users credential to accessing parts of this application
     */
    export class Credential
        extends b.SavableEntity<t.EmailT, t.CredentialT>
        implements i.Saveable, i.Securable<t.CredentialT>, i.Enableable<t.CredentialT> {

        static fsdb: any = db.dbCredentials;

        /**
         * @see [types.AtLeastCredentialT] minimum parameters needed
         * @param crdentialT minimum credential json data to create this Credential
         */
        constructor(credentialT: t.AtLeastCredentialT) {
            const dataT: t.CredentialT = {
                [t.LoginPK]: credentialT[t.LoginPK],
                userNameT: credentialT.userNameT,
                [t.PropRoleNames]: credentialT[t.PropRoleNames] ?? [],
                enabled: credentialT.enabled ?? true,
                updatedT: credentialT.updatedT ?? [],
            };
            super(t.LoginPK, dataT, Credential.fsdb);
        }

        /**
         * Convenient generic static method to load Credential objects.
         * @loginEmailIdT the value of the primary key of the credential json data object
         * @returns the Credential object representing the json data object or undefined if not found
         */
        static getInstance(loginEmailIdT: t.EmailT): Credential | undefined {
            return super.loadInstance(Credential.fsdb, loginEmailIdT, Credential);
        }

        /**
         * @param roleNameIdT role to add to this credential
         * @returns returns this Credential for chaining
         */
        addRole(roleNameIdT: t.NameT): Credential {
            const index = this.dataT[t.PropRoleNames].indexOf(roleNameIdT);
            if (index < 0) {
                this.dataT[t.PropRoleNames].push(roleNameIdT);
                this.update();
            };
            return this;
        }

        /**
         * @param roleNameIdT role to remove to this credential
         * @returns returns this Credential for chaining
         */
        removeRole(roleNameIdT: t.NameT): Credential {
            const index = this.dataT[t.PropRoleNames].indexOf(roleNameIdT);
            if (index >= 0) {
                this.dataT[t.PropRoleNames].splice(index, 1);
                this.update();
            };
            return this;
        }

        hasRoleNamesT(): t.NameT[] {
            return this.dataT[t.PropRoleNames];
        }

        isEnabled(): boolean {
            return this.dataT.enabled;
        }

        enable(status: boolean): Credential {
            this.dataT.enabled = status;
            this.update();
            return this;
        }

        private update(): void {
            this.dataT.updatedT.push(b.TimestampStr());
            this.dataT.updatedT = this.dataT.updatedT.slice(-10);
        }

    }

    /**
     * Audit reports of happenings and serious issues that have to be followed up.
     */
    export class AuditReport
        extends b.SavableEntity<t.InstanceIdT, t.AuditReportT>
        implements i.Saveable, i.Closeable<t.AuditReportT> {

        static fsdb: any = db.dbAuditReports;

        /**
         * @see [types.AtLeastAuditReportT] minimum parameters needed
         * @param auditReportT minimum audit report json data to create an audit report
         */
        constructor(auditReportT: t.AtLeastAuditReportT) {
            const dataT: t.AuditReportT = {
                timestampedT: auditReportT.timestampedT ?? b.TimestampStr(),
                [t.AuditReportPK]: auditReportT[t.AuditReportPK] ?? b.RandomStr(),
                auditTypeE: auditReportT.auditTypeE ?? t.AuditTypeE.INFO,
                credentialT: auditReportT.credentialT,
                stack: auditReportT.stack ?? "",
                auditCausesT: auditReportT.auditCausesT ?? [],
                auditReviewsT: auditReportT.auditReviewsT ?? [],
                closed: auditReportT.closed ?? false,
            };
            if (!dataT.stack) {
                Error.captureStackTrace(dataT, AuditReport);
            }
            super(t.AuditReportPK, dataT, AuditReport.fsdb);
            this.freeze(this.isClosed());
        }

        /**
         * Convenient static method to load AuditReport objects.
         * @auditReportInstanceIdT the value of the primary key of the audit report json data object
         * @returns the AuditReport object representing the json data object or undefined if not found
         */
        static getInstance(auditReportInstanceIdT: t.InstanceIdT): AuditReport | undefined {
            return super.loadInstance(AuditReport.fsdb, auditReportInstanceIdT, AuditReport);
        }

        /**
         * An audit report may have many causes. A stack trace is provided for each cause.
         * @see [types.AuditCauseT] for structure
         * @param auditCausesT the multiple causes for this report
         * @returns this AuditReport for chaining
         */
        addCauses(...auditCausesT: t.AuditCauseT[]): AuditReport {
            this.dataT.auditCausesT.push(...auditCausesT);
            return this;
        }

        /**
         * All audit reports must be reviewed by staff before it is closed.
         * @see [types.AuditReviewT] for structure
         * @param auditReveiwT the review conducted
         * @returns this AuditReport for chaining
         */
        addReveiw(auditReveiwT: t.AuditReviewT): AuditReport {
            this.dataT.auditReviewsT.push(auditReveiwT);
            return this;
        }

        /**
         * @returns true if this AuditReport is closed
         */
        isClosed(): boolean {
            return this.dataT.closed;
        }

        /**
         * Closes this audit report
         * @returns this AuditReport for chaining
         */
        close(): AuditReport {
            this.dataT.closed = true;
            this.freeze(this.isClosed());
            return this;
        }

        static toCause(descriptionT: t.DescriptionT, payloadT: t.JSONObjectT): t.AuditCauseT {
            const causeT: t.AuditCauseT = {
                descriptionT: descriptionT,
                payloadT: payloadT,
            };
            return causeT;
        }

        static toReview(credentialT: t.CredentialT, descriptionT: t.DescriptionT): t.AuditReviewT {
            const reviewT: t.AuditReviewT = {
                timestampedT: b.TimestampStr(),
                credentialT: credentialT,
                descriptionT: descriptionT,
            };
            return reviewT;
        }

        static toReport(credentialT: t.CredentialT, ...auditCausesT: t.AuditCauseT[]): AuditReport {
            return new AuditReport({ credentialT: credentialT }).addCauses(...auditCausesT);
        }

    }

}
