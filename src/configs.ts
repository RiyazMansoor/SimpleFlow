
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./basics";
import { OceanFlow as d } from "./design";
import { OceanFlow as c } from "./configs";
import { OceanFlow as s } from "./security";
import { OceanFlow as i } from "./instances";
import { data } from "jquery";
// import { OceanFlow as v } from "./validations";

export namespace OceanFlow {


    /**
     * The work flow data configuration object.
     */
    // export class DataConfig extends b.ConfigBase<t.DataConfigT> {

    //     /**
    //      * @param configT the json data object
    //      * @param flowConfig the parent flow configuration object
    //      */
    //     constructor(dataConfigT: t.DataConfigT, flowConfig: FlowConfig) {
    //         super(t.DataConfigPK, dataConfigT, flowConfig);
    //     }

    //     /**
    //      * This validation happens before flow instance is updated.
    //      * @param dataInstanceT data instance to validate
    //      * @returns array of causes if not validated or empty array
    //      */
    //     validate(dataInstanceT: t.DataInstanceT): t.AuditCauseT[] {
    //         // return v.validateData(this.getDataT(), dataInstanceT);
    //         return [];
    //     }

    // }

    /**
     * Rendering controls for this work flow forms
     */
    // export class HTMLConfig extends b.ConfigBase<t.HTMLConfigT> {

    // /**
    //  * @param configT the json data object
    //  * @param flowConfig the parent flow configuration object
    //  */
    // constructor(htmlConfigT: t.HTMLConfigT, flowConfig: FlowConfig) {
    //     super(t.HTMLConfigPK, htmlConfigT, flowConfig);
    // }

    // dataNamesT(): t.NameT[] {
    //     const dataNamesT: t.NameT[] = [];
    //     if (this.dataT.component) {
    //         dataNamesT.push(...this.dataT.component.dataNamesT);
    //     } else if (this.dataT.custom) {
    //         dataNamesT.push(this.dataT.custom.dataNameT);
    //     } else {
    //         // by default - its new line 
    //     };
    //     return dataNamesT;
    // }

    // }


    /**
     * Generic base class for all nodes on the work-flow tree.
     * @see [types.NodeConfigT] the base json object for all nodes
     * <ConfigT> must extend basic node json object [NodeConfigT]
     */
    export abstract class NodeConfig<ConfigT extends t.NodeConfigT>
        extends b.Entity<t.NameT, ConfigT>
        implements d.NodeConfig<ConfigT> {

        protected readonly flowConfig: FlowConfig;

        /**
         * @param configT the base json object
         * @param flowConfig the work-flow configuration object 
         */
        constructor(configT: ConfigT, flowConfig: FlowConfig) {
            super(t.NodeConfigPK, configT);
            this.flowConfig = flowConfig;
        }

        getDataT(): ConfigT {
            return this.dataT;
        }

        type(): t.NodeTypeE {
            return this.dataT.nodeTypeE;
        }

        hasRoles(): t.NameT[] {
            return this.dataT[t.RoleNamesProperty];
        }

        hasRolesAccess(credential: d.Securable<t.EmailT, t.CredentialT>): t.AuditCauseT[] {
            return b.hasAccess(this, credential);
        }

        spawnNodes(flowInstance: i.FlowInstance): void {
            this.nextNodes(flowInstance, this.dataT.nextNodeNameIdsT);
        }

        private nextNodes(flowInstance: i.FlowInstance, nodeNameIdst: t.NameT[]): void {
            for (const nodeNameT of nodeNameIdst) {
                // node names are checked at startup diagnostics
                const nodeConfig = this.flowConfig.nodeConfig(nodeNameT);
                if (!nodeConfig.canProceed(flowInstance)) {
                    // predicate failed - means this branch execution stops here
                    // TODO: log this ?
                    continue;
                };
                switch (nodeConfig.type()) {
                    case t.NodeTypeE.FORM:
                        const formInstanceT: t.AtLeastFormInstanceT = {
                            [t.NodeConfigPK]: nodeConfig.getIdT(),
                            [t.FlowInstancePK]: flowInstance.getIdT(),
                        };
                        const formInstance: i.FormInstance = new i.FormInstance(formInstanceT);
                        formInstance.save();
                        break;
                    case t.NodeTypeE.TASK:
                        const taskInstanceT: t.AtLeastTaskInstanceT = {
                            [t.NodeConfigPK]: nodeConfig.getIdT(),
                            [t.FlowInstancePK]: flowInstance.getIdT(),
                        };
                        const taskInstance: i.TaskInstance = new i.TaskInstance(taskInstanceT);
                        taskInstance.save();
                        taskInstance.taskUpload();
                        if (taskInstance.isClosed()) {
                            taskInstance.getConfig().spawnNodes(flowInstance);
                        };
                        break;
                    default:
                    // error
                };
            };
        }

        private canProceed(flowInstance: i.FlowInstance): boolean {
            // TODO check predicate with data from flowconfig
            return true;
        }

    }

    /**
     * A CJobConfig is the configuration class for a work unit carried
     * out by the system automatically.
     * It is a node on the work flow graph.
     */
    export class TaskConfig
        extends NodeConfig<t.TaskConfigT>
        implements d.TaskConfig {


        /**
         * @param configT the base json object
         * @param flowConfig the work-flow configuration object 
         */
        constructor(taskConfigT: t.TaskConfigT, flowConfig: FlowConfig) {
            super(taskConfigT, flowConfig);
        }

        dataMap(): t.DataPropertiesMapT {
            return this.dataT.dataMapT;
        }

    }


    /**
     * A FormConfig is the configuration class for a user input form.
     * It is a node on the work flow graph.
     */
    export class FormConfig
        extends NodeConfig<t.FormConfigT>
        implements d.FormConfig {

        // instance of the start form for kick starting the work-flow
        // private readonly formInstance: i.FormInstance

        // pre-cached response of the form structure
        private readonly formResponseT: t.ResponseT;

        // pre-record data configs to be uploaded flow data
        private readonly flowDataNamesT: t.NameT[];

        /**
         * @param configT the base json object
         * @param flowConfig the work-flow configuration object 
         */
        constructor(formConfigT: t.FormConfigT, flowConfig: FlowConfig) {
            super(formConfigT, flowConfig);
            // compute the form properties
            const allHTMLNamesT: t.NameT[] = [];
            const allDataNamesT: t.NameT[] = [];
            const flowDataNamesT: t.NameT[] = [];
            for (const formSegmentT of formConfigT.formSegmentsT) {
                for (const formComponentT of formSegmentT.formCompnentsT) {
                    const htmlConfigNameT = formComponentT[t.FormWidgetPK];
                    allHTMLNamesT.push(htmlConfigNameT);
                    const htmlConfigT: t.FormWidgetT = flowConfig.htmlConfigT(htmlConfigNameT);
                    const dataNamesT: t.NameT[] = htmlConfigT.component?.dataNamesT ?? [];
                    if (htmlConfigT.custom?.dataNameT) {
                        dataNamesT.push(htmlConfigT.custom.dataNameT);
                    };
                    allDataNamesT.push(...dataNamesT);
                    if (formComponentT.isFlowData) {
                        flowDataNamesT.push(...dataNamesT);
                    };
                };
            };
            // prepare the form response
            const responseT: t.ResponseT = {
                form: {
                    formTitleT: formConfigT.titleT,
                    formSegmentsT: formConfigT.formSegmentsT,
                    dataPropertiesT: allDataNamesT.map(dataNameT => flowConfig.dataConfigT(dataNameT)),
                    htmlConfigsT: allHTMLNamesT.map(htmlNameT => flowConfig.htmlConfigT(htmlNameT)),
                    dataValuesT: []
                },
            };
            this.formResponseT = responseT;
            this.flowDataNamesT = flowDataNamesT;
            // const atLeastFormInstanceT: t.AtLeastFormInstanceT = {
            //     [t.NodeConfigPK]: formConfigT[t.NodeConfigPK],
            //     // note the following is worng - but the flow instance is not needed in this case
            //     [t.FlowInstancePK]: flowConfig.getIdT(),    
            // };
            // this.formInstance = new i.FormInstance(atLeastFormInstanceT);
        }

        form(): t.ResponseT {
            return this.formResponseT;
        }

        filter(dataValuesT: t.DataValueT[]): t.DataValueT[] {
            return dataValuesT.filter(dataValueT => this.flowDataNamesT.includes(dataValueT[t.DataPropertiesPK]));
        }

        validate(dataInstancesT: t.DataValueT[]): t.AuditCauseT[] {
            throw new Error("Method not implemented.");
        }


        // validate(dataInstancesT: t.DataInstanceT[]): t.AuditCauseT[] {
        //     const auditCauses: t.AuditCauseT[] = [];
        //     for (const dataConfig of this.uploadDataConfigs) {
        //         const dataInstanceT = dataInstancesT.find(dataItemT => dataItemT[t.DataConfigPK] == dataConfig.getIdT());
        //         if (!dataInstanceT) {
        //             const cause: t.AuditCauseT = {
        //                 descriptionT: `required dataInstance for dataConfig missing`,
        //                 payloadT: {
        //                     dataConfigT: dataConfig.getDataT(),
        //                 },
        //             };
        //             auditCauses.push(cause);
        //             continue;
        //         };
        //         auditCauses.push(...dataConfig.validate(dataInstanceT));
        //     };
        //     return auditCauses;
        // }

    }

    /**
     * The work-flow configuration tht contains all sub configurations.
     */
    export class FlowConfig
        extends b.Entity<t.NameT, t.FlowConfigT>
        implements d.FlowConfig {


        private dataConfigsT = new Map<t.NameT, t.DataPropertiesT>();
        private htmlConfigsT = new Map<t.NameT, t.FormWidgetT>();

        private nodeConfigs = new b.EntityMap<t.NodeConfigT, NodeConfig<t.NodeConfigT>>();


        constructor(flowConfigT: t.FlowConfigT) {
            super(t.FlowConfigPK, flowConfigT);
            flowConfigT.dataConfigsT.forEach(dataConfigT => this.dataConfigsT.set(dataConfigT[t.DataPropertiesPK], dataConfigT));
            flowConfigT.formWidgetsT.forEach(htmlConfigT => this.htmlConfigsT.set(htmlConfigT[t.FormWidgetPK], htmlConfigT));
            this.nodeConfigs.setAll(...flowConfigT.formConfigsT.map(formConfigT => new FormConfig(formConfigT, this)));
            this.nodeConfigs.setAll(...flowConfigT.taskConfigsT.map(taskConfigT => new TaskConfig(taskConfigT, this)));
        }

        static createInstance(flowNameIdt: t.NameT): i.FlowInstance {
            const atLeastFlowInstanceT: t.AtLeastFlowInstanceT = {
                [t.FlowConfigPK]: flowNameIdt,
            };
            return new i.FlowInstance(atLeastFlowInstanceT);
        }

        dataConfigT(dataNameIdT: t.NameT): t.DataPropertiesT {
            return this.dataConfigsT.get(dataNameIdT);
        }

        htmlConfigT(htmlNameIdT: t.NameT): t.FormWidgetT {
            return this.htmlConfigsT.get(htmlNameIdT);
        }

        nodeConfig(nodeNameIdT: t.NameT): c.NodeConfig<t.NodeConfigT> {
            return this.nodeConfigs.get(nodeNameIdT);
        }

        startFetch(credential: s.Securable): t.ResponseT {
            const formNameT: t.NameT = this.dataT.startFormNameT;
            // startup diagnostics will verify this -> hence no errors
            const formConfig = this.nodeConfig(formNameT) as FormConfig;
            // role access check - user access no required
            const auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            return formConfig.form();
        }

        startSubmit(credential: s.Securable, dataValuesT: t.DataValueT[]): t.ResponseT {
            const formNameT: t.NameT = this.dataT.startFormNameT;
            // startup diagnostics will verify this -> hence no errors
            const formConfig = this.nodeConfig(formNameT) as FormConfig;
            // role access check - user access no required
            let auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            // filter the relevatn data values
            dataValuesT = formConfig.filter(dataValuesT);
            // validate the data values
            auditCauses = formConfig.validate(dataValuesT);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            // create work flow instance
            const flowInstance = FlowConfig.createInstance(this.getIdT());
            auditCauses = flowInstance.addData(dataValuesT);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            flowInstance.save();
            // TODO: spawn next nodes
            formConfig.spawnNodes(flowInstance);
            // return empty response for success
            return {};
        }

        formPicked(credential: s.Securable, nodeInstanceIdt: t.IdT): t.ResponseT {
            // fetch the form instance
            const formInstance: i.FormInstance = i.FormInstance.getInstance(nodeInstanceIdt) as i.FormInstance;
            if (!formInstance) {
                return this.invalidFormName(nodeInstanceIdt);
            };
            const formConfig = formInstance.getConfig() as FormConfig;
            // role access check - user access no required
            let auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            auditCauses = formInstance.hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return b.wrapResponse(...auditCauses);
            };
            // access validated -> proceed to business logic
            return formInstance.formPicked(credential);
        }

        formRequested(credential: s.Securable, nodeInstanceIdt: t.IdT): t.ResponseT {
            // fetch the form instance
            const formInstance: i.FormInstance = i.FormInstance.getInstance(nodeInstanceIdt) as i.FormInstance;
            if (!formInstance) {
                return this.invalidFormName(nodeInstanceIdt);
            };
            const formConfig = formInstance.getConfig() as FormConfig;
            // role access check - user access no required
            let auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            auditCauses = formInstance.hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return b.wrapResponse(...auditCauses);
            };
            // access validated -> proceed to business logic
            return formInstance .formRequested();
        }

        formReturned(credential: s.Securable, nodeInstanceIdt: t.IdT): t.ResponseT {
            // fetch the form instance
            const formInstance: i.FormInstance = i.FormInstance.getInstance(nodeInstanceIdt) as i.FormInstance;
            if (!formInstance) {
                return this.invalidFormName(nodeInstanceIdt);
            };
            const formConfig = formInstance.getConfig() as FormConfig;
            // role access check - user access no required
            let auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            auditCauses = formInstance.hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return b.wrapResponse(...auditCauses);
            };
            // access validated -> proceed to business logic
            return formInstance .formReturned();
        }

        formSaved(credential: s.Securable, nodeInstanceIdt: t.IdT, dataValuesT: t.DataValueT[]): t.ResponseT {
            // fetch the form instance
            const formInstance: i.FormInstance = i.FormInstance.getInstance(nodeInstanceIdt) as i.FormInstance;
            if (!formInstance) {
                return this.invalidFormName(nodeInstanceIdt);
            };
            const formConfig = formInstance.getConfig() as FormConfig;
            // role access check - user access no required
            let auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            auditCauses = formInstance.hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return b.wrapResponse(...auditCauses);
            };
            // access validated -> proceed to business logic
            return formInstance .formSaved(dataValuesT);
        }

        formSubmitted(credential: s.Securable, nodeInstanceIdt: t.IdT, dataValuesT: t.DataValueT[]): t.ResponseT {
            // fetch the form instance
            const formInstance: i.FormInstance = i.FormInstance.getInstance(nodeInstanceIdt) as i.FormInstance;
            if (!formInstance) {
                return this.invalidFormName(nodeInstanceIdt);
            };
            const formConfig = formInstance.getConfig() as FormConfig;
            // role access check - user access no required
            let auditCauses: t.AuditCauseT[] = formConfig.hasRolesAccess(credential);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            auditCauses = formInstance.hasUserAccess(credential);
            if (auditCauses.length >= 0) {
                return b.wrapResponse(...auditCauses);
            };
            // filter the relevatn data values
            dataValuesT = formConfig.filter(dataValuesT);
            // validate the data values
            auditCauses = formConfig.validate(dataValuesT);
            if (auditCauses.length) {
                return b.wrapResponse(...auditCauses);
            };
            // create work flow instance
            return formInstance.formSubmitted(dataValuesT);
        }

        private invalidFormName(formInstanceIdT: t.NameT): t.ResponseT {
            const auditCause: t.AuditCauseT = {
                descriptionT: `invalid form-name [${formInstanceIdT}]`,
                payloadT: {}
            };
            return b.wrapResponse(auditCause);
        }


    }

}