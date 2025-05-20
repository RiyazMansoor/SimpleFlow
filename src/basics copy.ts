

import { OceanFlow as t } from "./types";
import { OceanFlow as d } from "./design";
import { OceanFlow as s } from "./security";
import { OceanFlow as db } from "./store";
import { OceanFlow as c } from "./configs";


export namespace OceanFlow {

    /**
     * Base read-only generic class for all entities.
     * <IdT> is the type of the primary key field
     * <DataT> is the json data object
     */
    export abstract class Entity<IdT, DataT extends { [key: string]: any }>
        implements d.Entity<IdT, DataT> {

        // the property name of the primary key field in data
        protected readonly idPropertyName: string;

        // the json data object
        protected readonly dataT: DataT;

        /**
         * @param idPropertyName the property name of the primary key field in data
         * @param dataT the json data object
         */
        constructor(idPropertyName: string, dataT: DataT) {
            this.idPropertyName = idPropertyName;
            this.dataT = dataT;
        }

        getIdT(): IdT {
            return this.dataT[this.idPropertyName];
        }

        // getDataT(): DataT {
        //     return this.dataT;
        // }

    }

    /**
     * Base read-write generic class for all entities.
     * <IdT> is the type of the primary key field
     * <DataT> is the json data object
     */
    export abstract class SavableEntity<IdT, DataT extends {}>
        extends Entity<IdT, DataT>
        implements d.SavableEntity<IdT, DataT> {

        // data-store - this is temporary. TODO move to database. 
        private readonly fsdb: any;

        /**
         * @param idPropertyName the property name of the primary key field in data
         * @param dataT the json data object
         * @param fsdb [temp] data store
         */
        constructor(idPropertyName: string, dataT: DataT, fsdb: any) {
            super(idPropertyName, dataT);
            this.fsdb = fsdb;
        }

        freeze(yes: boolean): void {
            if (yes) {
                Object.freeze(this.dataT);
            };
        }

        save(): void {
            SavableEntity.saveData(this.fsdb, this.getIdT(), this.dataT);
        }

        /**
         * Convenient generic static method to save json objects.
         * @fsdb the database to query
         * @idT the value of the primary key the json data object
         * @dataT the json data object
         */
        static saveData<IdT, DataT>(fsdb: any, idT: IdT, dataT: DataT): void {
            db.dbSave(fsdb, idT, dataT);
        }

        /**
         * Convenient generic static method to load json objects.
         * @fsdb the database to query
         * @idT the value of the primary key the json data object
         * @returns the json data object
         */
        static loadData<IdT, DataT>(fsdb: any, id: IdT): DataT | undefined {
            const dataT: DataT | undefined = db.dbLoad(fsdb, id);
            return dataT;
        }

        /**
         * Convenient generic static method to load class objects.
         * @fsdb the database to query
         * @idT the value of the primary key the json data object
         * @returns the class object representing the json data object
         */
        static loadInstance<TId, DataT, Class>(fsdb: any, id: TId, clazz: t.Constructor<Class, DataT>): Class | undefined {
            const dataT: DataT | undefined = SavableEntity.loadData(fsdb, id);
            if (dataT) {
                return new clazz(dataT);
            }
            return undefined;
        }

    }


    /**
     * Convenient abstract configuration class for all flow sub configurations
     */
    export abstract class ConfigEntity<ConfigT extends {}>
        extends Entity<t.NameT, ConfigT> {

        /**
         * the parent flow configuration object
         */
        protected readonly flowConfig: c.FlowConfig;

        /**
         * @param idPropertyNameT property name of the primary key of json data object
         * @param configT the json data object
         * @param flowConfig the parent flow configuration object
         */
        constructor(idPropertyNameT: t.NameT, configT: ConfigT, flowConfig: c.FlowConfig) {
            super(idPropertyNameT, configT);
            this.flowConfig = flowConfig;
        }

    }

    /**
     * Classes that provide security authentication to operate on.
     * <IdT> is the type of the primary key field
     * <DataT> is the json data object
     */
    export class SecurableConfigEntity<DataT extends t.SecurableT>
        extends ConfigEntity<DataT>
        implements d.Securable<t.NameT, DataT> {

        /**
         * 
         * @param idPropertyName the property name of the primary key field in data
         * @param dataT the json data object
         * @param flowConfig the parent flow configuration object
         */
        constructor(idPropertyName: string, dataT: DataT, flowConfig: c.FlowConfig) {
            super(idPropertyName, dataT, flowConfig);
        }

        /**
         * @see const [RoleNamesProperty] from types
         * @returns the authorized role-names for this object
         */
        hasRoles(): t.NameT[] {
            return this.dataT[t.RoleNamesProperty];
        }

        /**
         * Asserts the supplied credential has access to this object.
         * @param credential the credential of a public or logged in user
         * @returns arry of issues found
         */
        assertRole(credential: s.Securable): t.AuditCauseT[] {
            return hasAccess(this, credential);
        }

        /**
         * @returns the json object data record
         */
        getDataT(): DataT {
            return this.dataT;
        }


    }


    /**
     * Generic conveniece [Map] of [ReadBase] configuration objects.
     * The application has many arrays of such configuration objects.
     * <IdT> is fixed to type [types.NameT]
     * <DataT> is the json data object
     * <T> any object that extends ReadBase with underlying [DataT] json object
     */
    export class EntityMap<DataT extends {}, T extends Entity<t.NameT, DataT>> extends Map<t.NameT, T> {

        // default constructor
        constructor() {
            super();
        }

        /**
         * Convenience method to add many objects at once.
         * @param ts objects extending [ReadBase]
         */
        setAll(...ts: T[]): void {
            ts.forEach(t => this.set(t.getIdT(), t));
        }

    }


    //// utility functions ////

    /**
     * @returns the ISO formatted current timestamp
     */
    export function TimestampStr(): t.TimestampT {
        return new Date().toISOString();
    }

    /**
     * @param len length of the random string - default 40
     * @returns random string
     */
    export function RandomStr(len: t.IntegerT = 40): string {
        let rstr = "";
        while (rstr.length < len) {
            rstr += Math.random().toString(36).substring(2, 12);
        }
        return rstr.substring(0, 40);
    }

    export function hasAccess<IdT, DataT extends {}>
        (accessing: d.Securable<IdT, DataT>, credential: d.Securable<t.EmailT, t.CredentialT>): t.AuditCauseT[] {
        const auditCauses: t.AuditCauseT[] = [];
        const commonRoles = accessing.hasRoles().filter(role1T => credential.hasRoles().includes(role1T));
        if (commonRoles.length == 0) {
            const auditCause: t.AuditCauseT = {
                descriptionT: "authorization failed",
                payloadT: {
                    accessing: accessing.getDataT(),
                    credential: credential.getDataT(),
                },
            };
            s.AuditReport.toReport(credential, auditCause).save();
            auditCauses.push(auditCause);
        };
        return auditCauses;
    }

    export function wrapResponse(...auditCauses: t.AuditCauseT[]): t.ResponseT {
        const responseT: t.ResponseT = {
            error: auditCauses,
        };
        return responseT;
    }
}