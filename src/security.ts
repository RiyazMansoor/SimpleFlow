
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./basics";
import { OceanFlow as i } from "./interfaces";
import { OceanFlow as f } from "./functions";
import { OceanFlow as db } from "./store";


export namespace OceanFlow {


    /**
     * Security roles for access to parts of the different work-flows.
     */
    export class Role
        implements i.Saveable<t.RoleT>, i.Enableable<t.RoleT> {


        protected readonly dataT: t.RoleT;

        /**
         * @see [types.AtLeastRole] minimum parameters needed
         * @param atLeastRoleT minimum role json to create this Role
         */
        constructor(atLeastRoleT: t.AtLeastRoleT) {
            const dataT: t.RoleT = t.defRoleT(atLeastRoleT);
            this.dataT = dataT;
        }

        /**
         * Convenient generic static method to load Role objects.
         * @roleNameIdT the value of the primary key of the role json data object
         * @returns the Role object representing the json data object or undefined if not found
         */
        static getInstance(roleNameIdT: t.NameT): Role | undefined {
            return f.loadInstance(db.dbRoles, roleNameIdT, Role);
        }

        /**
         * @param descriptionT updated description for this role
         * @returns this object for chaining
         */
        setDescription(descriptionT: t.DescriptionT): Role {
            this.dataT.descriptionT = descriptionT;
            return this;
        }

        save(descriptionT: t.DescriptionT, userT: t.UserT): void {
            f.save(db.dbRoles, this.dataT, this.dataT[t.RoleNamePK], descriptionT, userT);
        }

        isEnabled(): boolean {
            return f.isEnabled(this.dataT);
        }

        enable(status: boolean): Role {
            f.enable(this.dataT, status);
            // todo => iterate credentials to update disabled status
            return this;
        }

    }


    /**
     * User passwords and login management
     */
    export class Login
        implements i.Saveable<t.LoginT> {


        protected readonly dataT: t.LoginT;

        /**
         * @see [types.AtLeastLoginT] minimum parameters needed
         * @param atLeastLoginT minimum Login json data to create this Login
         */
        constructor(atLeastLoginT: t.LeastLoginT) {
            const dataT: t.LoginT = t.defLoginT(atLeastLoginT);
            this.dataT = dataT;
        }

        /**
         * Convenient generic static method to load Login objects.
         * @loginEmailIdT the value of the primary key of the login json data object
         * @returns the Login object representing the json data object or undefined if not found
         */
        static getInstance(loginEmailIdT: t.EmailT): Login | undefined {
            return f.loadInstance(db.dbLogins, loginEmailIdT, Login);
        }

        save(descriptionT: t.DescriptionT, userT: t.UserT): void {
            f.save(db.dbLogins, this.dataT, this.dataT[t.LoginEmailPK], descriptionT, userT);
        }

        /**
         * @param passwordT updated password to change
         * @returns array of failure causes or empty if successful
         * @see [types.AuditCauseT] for structure
         */
        setPassword(passwordT: t.PasswordT): t.AuditCauseT[] {
            const auditCausesT: t.AuditCauseT[] = [];
            if (this.dataT.oldPasswordsT.includes(passwordT)) {
                auditCausesT.push(f.toAuditCause("Password already used", {}));
            } else {
                this.dataT.passwordT = passwordT;
            };
            return auditCausesT;
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
        implements i.Saveable<t.CredentialT>, i.Enableable<t.CredentialT>, i.Authoriser<t.CredentialT> {


        protected readonly dataT: t.CredentialT;

        /**
         * @see [types.AtLeastCredentialT] minimum parameters needed
         * @param crdentialT minimum credential json data to create this Credential
         */
        constructor(atLeastCredentialT: t.LeastCredentialT) {
            const dataT: t.CredentialT = t.defCredentialT(atLeastCredentialT);
            this.dataT = dataT;
        }

        /**
         * Convenient generic static method to load Credential objects.
         * @loginEmailIdT the value of the primary key of the credential json data object
         * @returns the Credential object representing the json data object or undefined if not found
         */
        static getInstance(loginEmailIdT: t.EmailT): Credential | undefined {
            return f.loadInstance(db.dbCredentials, loginEmailIdT, Credential);
        }

        save(descriptionT: t.DescriptionT, userT: t.UserT): void {
            f.save(db.dbCredentials, this.dataT, this.dataT[t.LoginEmailPK], descriptionT, userT);
        }

        /**
         * @param roleNameIdT role to add to this credential
         * @returns returns this Credential for chaining
         */
        addRole(roleNameIdT: t.NameT): Credential {
            f.addauthorisedRole(this.dataT, roleNameIdT);
            return this;
        }

        /**
         * @param roleNameIdT role to remove to this credential
         * @returns returns this Credential for chaining
         */
        removeRole(roleNameIdT: t.NameT): Credential {
            f.removeSecureRole(this.dataT, roleNameIdT);
            return this;
        }

        availalbeRoleNamesT(): t.NameT[] {
            return f.availableRoleNamesT(this.dataT);
        }

        isAuthorised(allowedRoleNamesIdT: t.NameT[]): t.AuditCauseT[] {
            const auditCausesT: t.AuditCauseT[] = [];
            if (!f.isAuthorised(this.dataT, allowedRoleNamesIdT)) {
                auditCausesT.push(f.toAuditCause("Not Authorised", {}));
            }
            return auditCausesT;
        }

        isEnabled(): boolean {
            return f.isEnabled(this.dataT);
        }

        enable(status: boolean): Credential {
            f.enable(this.dataT, status);
            return this;
        }

    }

    /**
     * Audit reports of happenings and serious issues that have to be followed up.
     */
    export class AuditReport
        implements i.Saveable<t.AuditReportT>, i.Closeable<t.AuditReportT> {

        protected readonly dataT: t.AuditReportT;

        /**
         * @see [types.AtLeastAuditReportT] minimum parameters needed
         * @param atLeastAuditReportT minimum audit report json data to create an audit report
         */
        constructor(atLeastAuditReportT: t.LeastAuditReportT) {
            const dataT: t.AuditReportT = t.defAuditReportT(atLeastAuditReportT);
            if (!dataT.stack) {
                Error.captureStackTrace(dataT, AuditReport);
            };
            this.dataT = dataT;
            this.freeze();
        }

        /**
         * Convenient static method to load AuditReport objects.
         * @auditReportInstanceIdT the value of the primary key of the audit report json data object
         * @returns the AuditReport object representing the json data object or undefined if not found
         */
        static getInstance(auditReportInstanceIdT: t.InstanceIdT): AuditReport | undefined {
            return f.loadInstance(db.dbAuditReports, auditReportInstanceIdT, AuditReport);
        }

        save(descriptionT: t.DescriptionT, userT: t.UserT): void {
            f.save(db.dbCredentials, this.dataT, this.dataT[t.AuditReportPK], descriptionT, userT);
        }

        /**
         * An audit report may have many causes. A stack trace is provided for each cause.
         * @see [types.AuditCauseT] for structure
         * @param auditCausesT the multiple causes for this report
         * @returns this AuditReport for chaining
         */
        addCauses(...auditCausesT: t.AuditCauseT[]): AuditReport {
            this.dataT.causesT.push(...auditCausesT);
            return this;
        }

        /**
         * All audit reports must be reviewed by staff before it is closed.
         * @see [types.AuditReviewT] for structure
         * @param auditReveiwT the review conducted
         * @returns this AuditReport for chaining
         */
        addReveiw(auditReveiwT: t.AuditReviewT): AuditReport {
            this.dataT.reviewsT.push(auditReveiwT);
            return this;
        }

        /**
         * @returns true if this AuditReport is closed
         */
        isClosed(): boolean {
            return f.isClosed(this.dataT);
        }

        /**
         * Closes this audit report
         * @returns this AuditReport for chaining
         */
        close(): AuditReport {
            f.close(this.dataT);
            this.freeze();
            return this;
        }

        freeze(): AuditReport {
            f.freeze(this.dataT);
            return this;
        }

        static toReport(userT: t.UserT, ...auditCausesT: t.AuditCauseT[]): AuditReport {
            return new AuditReport({ [t.PropUser]: userT }).addCauses(...auditCausesT);
        }

    }

}
