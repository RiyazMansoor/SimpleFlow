
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./basics";
import { OceanFlow as d } from "./design";
import { OceanFlow as c } from "./configs";
import { OceanFlow as s } from "./security";
import { OceanFlow as i } from "./instances";
// import { OceanFlow as v } from "./validations";

export namespace OceanFlow {


    /**
     * The work-flow configuration tht contains all sub configurations.
     */
    export class FlowConfig extends b.Entity<t.NameT, t.FlowConfigT> implements d.FlowConfig {


        private dataConfigs = new b.EntityMap<t.DataConfigT, DataConfig>();
        private htmlConfigs = new b.EntityMap<t.HTMLConfigT, HTMLConfig>();
        private nodeConfigs = new b.EntityMap<t.NodeConfigT, NodeConfig<t.NodeConfigT>>();


        constructor(flowConfigT: t.FlowConfigT) {
            super(t.FlowConfigPK, flowConfigT);
            this.dataConfigs.setAll(...flowConfigT.dataConfigsT.map(dataConfigT => new DataConfig(dataConfigT, this)));
            this.htmlConfigs.setAll(...flowConfigT.htmlConfigsT.map(htmlConfigT => new HTMLConfig(htmlConfigT, this)));
            this.nodeConfigs.setAll(...flowConfigT.formConfigsT.map(formConfigT => new FormConfig(formConfigT, this)));
            this.nodeConfigs.setAll(...flowConfigT.taskConfigsT.map(taskConfigT => new TaskConfig(taskConfigT, this)));
        }

        start(): t.ResponseT {
            const formNameT: t.NameT = this.dataT.startFormNameT;
            const nodeConfig = this.nodeConfigs.get(formNameT);
            const formConfig = nodeConfig as FormConfig;
            return formConfig.formResponse();
        }

        dataConfig(dataNameIdT: t.NameT): c.DataConfig {
            return this.dataConfigs.get(dataNameIdT);
        }

        htmlConfig(htmlNameIdT: t.NameT): c.HTMLConfig {
            return this.htmlConfigs.get(htmlNameIdT);
        }

        nodeConfig(nodeNameIdT: t.NameT): c.NodeConfig<t.NodeConfigT> {
            return this.nodeConfigs.get(nodeNameIdT);
        }

    }



    /**
     * The work flow data configuration object.
     */
    export class DataConfig extends b.ConfigBase<t.DataConfigT> {

        /**
         * @param configT the json data object
         * @param flowConfig the parent flow configuration object
         */
        constructor(dataConfigT: t.DataConfigT, flowConfig: FlowConfig) {
            super(t.DataConfigPK, dataConfigT, flowConfig);
        }

        /**
         * This validation happens before flow instance is updated.
         * @param dataInstanceT data instance to validate
         * @returns array of causes if not validated or empty array
         */
        validate(dataInstanceT: t.DataInstanceT): t.AuditCauseT[] {
            // return v.validateData(this.getDataT(), dataInstanceT);
            return [];
        }

    }

    /**
     * Rendering controls for this work flow forms
     */
    export class HTMLConfig extends b.ConfigBase<t.HTMLConfigT> {

        /**
         * @param configT the json data object
         * @param flowConfig the parent flow configuration object
         */
        constructor(htmlConfigT: t.HTMLConfigT, flowConfig: FlowConfig) {
            super(t.HTMLConfigPK, htmlConfigT, flowConfig);
        }

        dataNamesT(): t.NameT[] {
            const dataNamesT: t.NameT[] = [];
            if (this.dataT.component) {
                dataNamesT.push(...this.dataT.component.dataNamesT);
            } else if (this.dataT.custom) {
                dataNamesT.push(this.dataT.custom.dataNameT);
            } else {
                // by default - its new line 
            };
            return dataNamesT;
        }

    }


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

        type(): t.NodeTypeE {
            return this.dataT.nodeTypeE;
        }

        hasRoles(): t.NameT[] {
            return b.hasRoles(this);
        }

        hasRolesAccess(credential: s.Credential): t.AuditCauseT[] {
            return b.hasAccess(this, credential);
        }

        canProceed(): boolean {
            // TODO check predicate with data from flowconfig
            return true;
        }

        next(): t.NameT[] {
            throw new Error("Method not implemented.");
        }


        // nextSteps(flowInstance: i.FlowInstance): void {
        //     for (const nodeNameT of this.getDataT().nextNodesT) {
        //         const config = this.flowConfig.getJobConfig(nodeNameT) ?? this.flowConfig.getJobConfig(nodeNameT);
        //         if (!config.assertPredicate()) {
        //             // predicate failed - means this branch execution stops here
        //             continue;
        //         };
        //         switch (config.getDataT().nodeTypeE) {
        //             case t.NodeTypeE.FORM:
        //                 const formInstanceT: t.AtLeastFormInstanceT = {
        //                     [t.NodeConfigPK]: config.getIdT(),
        //                     [t.FlowInstancePK]: flowInstance.getIdT(),
        //                 };
        //                 const formInstance: n.FormInstance = new FormInstance(formInstanceT);
        //                 formInstance.save();
        //                 break;
        //             case t.NodeTypeE.JOB:
        //                 const jobInstanceT: t.AtLeastJobInstanceT = {
        //                     [t.NodeConfigPK]: config.getIdT(),
        //                     [t.FlowInstancePK]: flowInstance.getIdT(),
        //                 }
        //                 break;
        //             default:
        //             // error
        //         };
        //     };
        // }

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

        dataMap(): t.DataConfigMapT {
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
                    const htmlConfigNameT = formComponentT[t.HTMLConfigPK];
                    allHTMLNamesT.push(htmlConfigNameT);
                    const dataNamesT: t.NameT[] = flowConfig.htmlConfig(htmlConfigNameT).dataNamesT();
                    allDataNamesT.push(...dataNamesT);
                    if (formComponentT.isFlowData) {
                        flowDataNamesT.push(...dataNamesT);
                    };
                };
            };
            const responseT: t.ResponseT = {
                form: {
                    formTitleT: formConfigT.titleT,
                    formSegmentsT: formConfigT.formSegmentsT,
                    dataConfigsT: allDataNamesT.map(dataNameT => flowConfig.dataConfig(dataNameT).getDataT()),
                    htmlConfigsT: allHTMLNamesT.map(htmlNameT => flowConfig.htmlConfig(htmlNameT).getDataT()),
                    dataInstancesT: []
                },
            };
            this.formResponseT = responseT;
            this.flowDataNamesT = flowDataNamesT;
        }

        hasUserAccess(credential: s.Credential): t.AuditCauseT[] {
            throw new Error("Method not implemented.");
        }

        formResponse(): t.ResponseT {
            return { ...this.formResponseT };
        }

        formDataInstances(dataInstancesT: t.DataInstanceT[]): t.DataInstanceT[] {
            return dataInstancesT.filter(dataInstanceT => this.flowDataNamesT.includes(dataInstanceT[t.DataConfigPK]));
        }

        formValidate(dataInstancesT: t.DataInstanceT[]): t.ResponseT {
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


}