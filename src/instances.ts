
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./basics";
import { OceanFlow as s } from "./security";
import { OceanFlow as d } from "./design";
import { OceanFlow as c } from "./configs";
import { OceanFlow as m } from "./app";
import { OceanFlow as db } from "./store";

export namespace OceanFlow {



    /**
     * Class that represents the data in workflows, forms, etc 
     */
    export class DataInstance extends b.Entity<t.NameT, t.DataInstanceT> {

        /**
         * @param dataInstanceT the json object
         */
        constructor(dataInstanceT: t.DataInstanceT) {
            super(t.DataConfigPK, dataInstanceT);
        }

    }


    /**
     * An abstract node instance on the flow graph.
     * A node instance may different implementations.
     */
    export abstract class NodeInstance<DataT extends t.AtLeastNodeInstance>
        extends b.SavableEntity<t.NameT, DataT>
        implements d.NodeInstance<DataT> {


        // parent node configuration for this node instance
        protected readonly nodeConfig: c.NodeConfig<t.NodeConfigT>;

        // the flow instance for this node instance
        protected readonly flowInstance: FlowInstance;

        /**
         * @param atLeastNodeInstanceT the json object represeting this NodeInstance 
         */
        constructor(atLeastNodeInstanceT: DataT, fsdb: any) {
            super(t.NodeInstancePK, atLeastNodeInstanceT, fsdb);
            // these lines should never return null
            this.flowInstance = FlowInstance.getInstance(atLeastNodeInstanceT[t.FlowInstancePK])!;
            this.nodeConfig = this.flowInstance.getConfig().nodeConfig(atLeastNodeInstanceT[t.NodeConfigPK]);
        }

        getConfig(): c.NodeConfig<t.NodeConfigT> {
            return this.nodeConfig;
        }

        getFlowInstance(): FlowInstance {
            return this.flowInstance;
        }

        abstract isClosed(): boolean;

        // abstract close(credential: s.Credential): d.NodeInstance<DataT>;

    }

    export class TaskInstance
        extends NodeInstance<t.TaskInstanceT>
        implements d.TaskInstance {

        static fsdb: any = db.dbJobInstances;

        /**
         * @param atLeastTaskInstanceT the minimum json object represeting this task instance 
         */
        constructor(atLeastTaskInstanceT: t.AtLeastTaskInstanceT) {
            const dataT: t.TaskInstanceT = {
                timestampedT: atLeastTaskInstanceT.timestampedT ?? b.TimestampStr(),
                [t.NodeInstancePK]: atLeastTaskInstanceT[t.NodeInstancePK] ?? b.RandomStr(),
                [t.NodeConfigPK]: atLeastTaskInstanceT[t.NodeConfigPK],
                [t.FlowInstancePK]: atLeastTaskInstanceT[t.FlowInstancePK],
                attemptsT: atLeastTaskInstanceT.attemptsT ?? [],
                statusE: atLeastTaskInstanceT.statusE ?? t.TaskStatusE.OPEN,
            };
            super(dataT, TaskInstance.fsdb);
            this.freeze(this.isClosed())
        }

        /**
         * Convenient static method to load TaskInstance objects.
         * @nodeInstanceIdT the value of the primary key of the TaskInstance json data object
         * @returns the TaskInstance object representing the json data object or undefined if not found
         */
        static getInstance(nodeInstanceIdT: t.InstanceIdT): TaskInstance | undefined {
            return super.loadInstance(nodeInstanceIdT, TaskInstance, TaskInstance.fsdb);
        }

        getConfig(): c.TaskConfig {
            return super.getConfig() as c.TaskConfig;
        }

        isClosed(): boolean {
            return this.dataT.statusE != t.TaskStatusE.OPEN;
        }

        taskUpload(): void {
            throw new Error("Method not implemented.");
        }

        private update(): void {
            this.dataT.attemptsT = this.dataT.attemptsT.slice(-10);
        }

    }

    export class FormInstance
        extends NodeInstance<t.FormInstanceT>
        implements d.FormInstance {

        static fsdb: any = db.dbFormInstances;

        /**
         * @param formInstanceT the json object represeting this FormInstance 
         */
        constructor(formInstanceT: t.AtLeastFormInstanceT) {
            const dataT: t.FormInstanceT = {
                timestampedT: formInstanceT.timestampedT ?? b.TimestampStr(),
                [t.NodeInstancePK]: formInstanceT[t.NodeInstancePK] ?? b.RandomStr(),
                [t.NodeConfigPK]: formInstanceT[t.NodeConfigPK],
                [t.FlowInstancePK]: formInstanceT[t.FlowInstancePK],
                accessesT: formInstanceT.accessesT ?? [],
                currentUserEmailT: formInstanceT.currentUserEmailT ?? "",
                tempDataItemsT: formInstanceT.tempDataItemsT ?? [],
                statusE: formInstanceT.statusE ?? t.FormStatusE.CREATED,
            };
            super(dataT, FormInstance.fsdb);
            this.freeze(this.isClosed())
        }

        static getInstance(nodeInstanceIdT: t.InstanceIdT): FormInstance | undefined {
            return super.loadInstance(nodeInstanceIdT, FormInstance, FormInstance.fsdb);
        }

        /**
         * @returns true if this instance is closed to any modification
         */
        isClosed(): boolean {
            return this.dataT.statusE == t.FormStatusE.EXECUTED
                || this.dataT.statusE == t.FormStatusE.ABORTED;
        }

        getConfig(): c.FormConfig {
            return super.getConfig() as c.FormConfig;
        }

        formPicked(credential: s.Credential): t.ResponseT {
            const auditCauses: t.AuditCauseT[] = this.getConfig().hasRolesAccess(credential);
            if (auditCauses.length >= 0) {
                return this.errorResponseT(auditCauses);
            };
            this.dataT.statusE = t.FormStatusE.SELECTED;
            const accessed: t.FormAccessT = {
                credentialT: credential.getDataT(),
                selectedTimestampT: b.TimestampStr(),
            };
            this.dataT.accessesT.push(accessed);
            this.formRequested(credential);
        }

        formRequested(credential: s.Credential): t.ResponseT {
            const auditCauses: t.AuditCauseT[] = this.getConfig().hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return this.errorResponseT(auditCauses);
            };
            this.dataT.statusE = t.FormStatusE.SELECTED;
            this.dataT.accessesT.slice(-1)[0].requestedTimestampT = b.TimestampStr();
            this.update().save();
            return this.getConfig().formResponse();
        }

        formReturned(credential: s.Credential): t.ResponseT {
            const auditCauses: t.AuditCauseT[] = this.getConfig().hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return this.errorResponseT(auditCauses);
            };
            this.dataT.statusE = t.FormStatusE.CREATED;
            this.dataT.accessesT.slice(-1)[0].returnedTimestampT = b.TimestampStr();
            this.update().save();
            return this.getConfig().formResponse();
            // TODO what is returned ? not responseT
        }

        formSaved(credential: s.Credential, dataInstancesT: t.DataInstanceT[]): t.ResponseT {
            const auditCauses: t.AuditCauseT[] = this.getConfig().hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return this.errorResponseT(auditCauses);
            };
            this.dataT.tempDataItemsT = dataInstancesT;
            return {};
        }

        formSubmitted(credential: s.Credential, dataInstancesT: t.DataInstanceT[]): t.ResponseT {
            throw new Error("Method not implemented.");
        }

        /**
         * Uploads the data instances to the flow.
         * @param dataItemsT data instances uploaded to the flow
         */
        sendData(dataItemsT: t.DataInstanceT[]): void {
            // iterate flowForm data fields and update from taskData
            for (const dataInstance of dataItemsT) {
                const foundInstance = this.dataT.dataItemsT.find(dataItem => dataItem.name == dataInstance.name);
                if (!foundInstance) {
                    this.dataT.dataItemsT.push(dataInstance);
                };
            };
        }

        /**
         * TODO what is returned ?
         * @param credential the user selecting this form
         */
        selected(credential: s.Credential): void {
        }

        assertCurrentUser(credential: s.Credential): t.AuditCauseT[] {
            const auditCauses: t.AuditCauseT[] = [];
            if (this.dataT.currentUserEmailT != credential.getIdT()) {
                const auditCause: t.AuditCauseT = {
                    descriptionT: "serious security issue - different users accessing same form",
                    payloadT: {
                        lastUser: this.dataT.accessesT.slice(-1)[0],
                        thisUser: credential.getDataT(),
                    },
                };
                auditCause.payloadT.authorizedUserEmailT = this.dataT.currentUserEmailT;
                s.AuditReport.toReport(credential).addCauses(auditCause).save();
                auditCauses.push(auditCause);
            }
            return auditCauses;
        }

        returned(): void {
            this.dataT.statusE = t.FormStatusE.CREATED;
            const accessedT: t.FormAccessT = this.dataT.accessesT.slice(-1)[0];
            accessedT.returnedTimestampT = b.TimestampStr();
            this.dataT.currentUserEmailT = "";
            this.update().save();
        }

        private update(): FormInstance {
            this.dataT.accessesT = this.dataT.accessesT.slice(-10);
            this.dataT.currentUserEmailT = this.dataT.accessesT.slice(-1)[0].credentialT[t.LoginPK];
            return this;
        }

        private errorResponseT(auditCauses: t.AuditCauseT[]): t.ResponseT {
            const responseT: t.ResponseT = {
                error: auditCauses,
            };
            return responseT;
        }

    }

    /**
     * User generated flow instances as per its respective flow configuration.
     */
    export class FlowInstance
        extends b.SavableEntity<t.InstanceIdT, t.FlowInstanceT>
        implements d.FlowInstance {

        static fsdb = db.dbFlowInstances;

        // flow configuration that this instance belongs to
        protected readonly flowConfig: c.FlowConfig;

        /**
         * @param flowInstanceT the json object represeting this FlowInstance 
         */
        constructor(flowInstanceT: t.AtLeastFlowInstance) {
            const dataT: t.FlowInstanceT = {
                [t.FlowInstancePK]: flowInstanceT[t.FlowInstancePK] ?? b.RandomStr(),
                [t.FlowConfigPK]: flowInstanceT[t.FlowConfigPK],
                logItemsT: flowInstanceT.logItemsT ?? [],
                dataItemsT: flowInstanceT.dataItemsT ?? [],
                statusE: flowInstanceT.statusE ?? t.FlowStatusE.OPEN,
                timestamps: {
                    createdT: b.TimestampStr(),
                },
            };
            super(t.FlowInstancePK, dataT, FlowInstance.fsdb);
            this.freeze(this.isClosed());
            this.flowConfig = m.OceanFlowApp.getInstance().get(flowInstanceT[t.FlowConfigPK]);
        }

        /**
         * Convenient static method to load FlowInstance objects.
         * @flowInstanceIdT the value of the primary key of the FlowInstance json data object
         * @returns the FlowInstance object representing the json data object or undefined if not found
         */
        static getInstance(flowInstanceIdT: t.InstanceIdT): FlowInstance | undefined {
            return super.loadInstance(FlowInstance.fsdb, flowInstanceIdT, FlowInstance);
        }

        /**
         * @returns the flow configuration object for this instance
         */
        getConfig(): c.FlowConfig {
            return this.flowConfig;
        }

        /**
         * No duplicate data instances are allowed.
         * @param dataItemsT to add to this flows instance data
         * @returns array of causes that failed or empty array if succeeded
         */
        receiveData(dataItemsT: t.DataInstanceT[]): t.AuditCauseT[] {
            const auditCauses: t.AuditCauseT[] = [];
            const existingDataItemNamesT = this.dataT.dataItemsT.map(dataItemT => dataItemT[t.DataConfigPK]);
            dataItemsT.forEach(dataItemT => {
                const index = existingDataItemNamesT.indexOf(dataItemT[t.DataConfigPK]);
                if (index >= 0) {
                    const auditCause: t.AuditCauseT = {
                        descriptionT: `data overwrites not allowed - duplicate data-instance [${dataItemT[t.DataConfigPK]}]`,
                        payloadT: {
                            existing: this.dataT.dataItemsT[index],
                            adding: dataItemT,
                        },
                    };
                    auditCauses.push(auditCause);
                };
            });
            // if duplicate data-instances return errors
            if (auditCauses.length) {
                return auditCauses;
            };
            // receive data to this workflow
            this.dataT.dataItemsT.push(...dataItemsT);
            return auditCauses;
        }

        /**
         * @returns true if this work flow is closed for any chances 
         */
        isClosed(): boolean {
            return this.dataT.statusE != t.FlowStatusE.OPEN;
        }

        /**
         * @param credential the user whose action triggered closing this low
         * @returns this flow instance for chaining
         */
        close(credential: s.Credential): FlowInstance {
            this.dataT.statusE = t.FlowStatusE.CLOSED;
            this.dataT.timestamps.closedT = b.TimestampStr();
            this.log(credential, "closing");
            this.freeze(this.isClosed());
            return this;
        }

        /**
         * Creates a log entry on this work flow instance.
         * @param credential the user whose activity triggered this log itme
         * @param descriptionT brief description of this log
         * @returns the log item created
         */
        log(credential: s.Credential, descriptionT: t.DescriptionT): t.LogItemT {
            const logItemT: t.LogItemT = {
                timestamp: b.TimestampStr(),
                credential: credential.getDataT(),
                description: descriptionT,
            };
            this.dataT.logItemsT.push(logItemT);
            return logItemT;
        }

    }

}