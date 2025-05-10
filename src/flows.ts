import { OceanFlow as t } from "./types";
import { OceanFlow as u } from "./utils";
import { OceanFlow as c } from "./core";
import { OceanFlow as d } from "./data";
import { OceanFlow as a } from "./audit";
import { validateData } from "./data";
import { dbLoadFlowInstance, dbSaveFlowInstance } from "./store";



export namespace OceanFlow {


    export const FlowConfigs = new c.Configs<t.NameT, t.FlowConfigT, FlowConfig>();

    export class FlowConfig extends c.Base<t.NameT, t.FlowConfigT> {

        private dataConfigs = new c.Configs<t.NameT, t.DataConfigT, d.DataConfig>();
        // viewConfigs, fieldNames, dataConfigs for each form 
        private formViewConfigs: Map<t.NameT, t.ViewConfigT[]> = new Map();
        // private formValueNames: Map<t.TName, t.TName[]> = new Map();
        private formDataConfigs: Map<t.NameT, t.DataConfigT[]> = new Map();
        // only some data-configs may require be updated flow-data
        private formSaveDataConfigs: Map<t.NameT, t.DataConfigT[]> = new Map();

        constructor(flowConfigT: t.FlowConfigT) {
            super("instanceId", flowConfigT);
            const dataConfigs = flowConfigT.dataConfigsT.map(dataConfig => new d.DataConfig(dataConfig));
            this.dataConfigs.add(dataConfigs);
            for (const viewConfigT of flowConfigT.viewConfigsT) {
                for (const form of viewConfigT.forms) {
                    const formNameT = form.nameT;
                    if (!this.formViewConfigs.has(formNameT)) {
                        this.formViewConfigs.set(formNameT, []);
                    }
                    this.formViewConfigs.get(formNameT)!.push(viewConfigT);
                    // get value names
                    const dataNames: t.NameT[] = [];
                    if (viewConfigT.component) {
                        dataNames.push(...viewConfigT.component.dataNames);
                    };
                    if (viewConfigT.custom) {
                        dataNames.push(viewConfigT.custom.dataName);
                    };
                    // all dataconfigs
                    const dataConfigs: t.DataConfigT[] = [];
                    dataNames.forEach(dataName => {
                        const dataConfig = flowConfigT.dataConfigsT.find(dataConfig => dataConfig.name == dataName)!;
                        dataConfigs.push(dataConfig);
                    });
                    if (!this.formDataConfigs.has(formNameT)) {
                        this.formDataConfigs.set(formNameT, []);
                    };
                    this.formDataConfigs.get(formNameT)!.push(...dataConfigs);
                    // data-configs that upload data to flow can be less than all data-configs
                    if (form.isFlowData) {
                        if (!this.formSaveDataConfigs.has(formNameT)) {
                            this.formSaveDataConfigs.set(formNameT, []);
                        };
                        this.formDataConfigs.get(formNameT)!.push(...dataConfigs);
                    };
                };
            };
        }

        assertAuthorized(credentialT: t.CredentialT): t.AuditCauseT[] {
            const payload: t.JSONObjectT = {
                flowNameT: this.flowConfigT.nameT,
                neededRolesT: this.flowConfigT.roleNamesT,
            };
            return u.assertAuthorized(credentialT, this.flowConfigT.roleNamesT, payload);
        }

        startForm(): t.NameT {
            return this.flowConfigT.start.formNameT;
        }

        startNext(): t.NodeConfigT[] {
            return this.flowConfigT.start.nextNodesT;
        }

        flowRoles(): t.NameT[] {
            return this.flowConfigT.roleNamesT;
        }

        flowConfig(): t.FlowConfigT {
            return this.flowConfigT;
        }

        viewConfigs(formNameT: t.NameT): t.ViewConfigT[] {
            return this.formViewConfigs.get(formNameT)!;
        }

        dataConfigs(formNameT: t.NameT): t.DataConfigT[] {
            return this.formDataConfigs.get(formNameT)!;
        }

        saveDataConfigs(formNameT: t.NameT): t.DataConfigT[] {
            return this.formSaveDataConfigs.get(formNameT)!;
        }

        validate(formNameT: t.NameT, dataItemsT: t.DataItemT[], credentialT: t.CredentialT): t.AuditCauseT[] {
            const causes: t.AuditCauseT[] = [];
            const saveDataConfigs = this.saveDataConfigs(formNameT);
            saveDataConfigs.forEach(dataConfig => causes.push(...validateData(dataConfig, dataItemsT)));
            if (causes.length) {
                const payload: t.JSONObjectT = {
                    credentialT: JSON.parse(JSON.stringify(credentialT)),
                };
                this.payload(payload);
                causes.push(AuditReport.toCause("validation errors", payload));
                AuditReport.saveReport(credentialT, ...causes);
            }
            return causes;
        }

        startNextNodes(flowInstanceIdT: t.InstanceIdT): void {
            const nodesT: t.NodeConfigT[] = this.startNext();
            for (const nodeT of nodesT) {
                let predicate: boolean = true;
                if (nodeT.predExpressionT) {
                    // execute expression and assign result
                };
                if (!predicate) continue;
                switch (nodeT.nodeTypeE) {
                    case t.NodeTypeE.FORM:
                        const formInstanceT: t.AtLeastFormInstance = {
                            nodeConfigT: this.flowConfigT,
                            flowInstanceIdT: flowInstanceIdT,
                            flowNameT: this
                        };
                        break;
                    case t.NodeTypeE.JOB:
                        break;
                    default:
                    // error
                };
            };

        }

        payload(jsonObjectT: t.JSONObjectT): t.JSONObjectT {
            const payload: t.JSONObjectT = {
                nameT: this.flowConfigT.nameT,
                roleNamesT: this.flowConfigT.roleNamesT,
                start: this.flowConfigT.start,
            };
            jsonObjectT.flowConfigT = payload;
            return jsonObjectT;
        }

    }

    export class FlowInstance extends Base<t.InstanceIdT, t.FlowInstanceT> {


        constructor(flowInstanceT: t.AtLeast<t.FlowInstanceT, "nameT">) {
            const dataT: t.FlowInstanceT = {
                nameT: flowInstanceT.nameT,
                instanceIdT: flowInstanceT.instanceIdT ?? u.RandomStr(),
                logItemsT: flowInstanceT.logItemsT ?? [],
                dataItemsT: flowInstanceT.dataItemsT ?? [],
                statusE: flowInstanceT.statusE ?? t.FlowStatusE.OPEN,
                timestamps: {
                    createdT: u.TimestampStr(),
                },
            };
            super("instanceIdT", dbSaveFlowInstance, dataT);
            this.freeze(this.isClosed());
        }

        static getInstance(instanceIdT: t.InstanceIdT): FlowInstance | undefined {
            return Base.loadInstance(instanceIdT, dbLoadFlowInstance, FlowInstance);
        }

        getName(): t.NameT {
            return this.dataT.nameT;
        }

        isClosed(): boolean {
            return this.dataT.statusE != t.FlowStatusE.OPEN;
        }

        close(credentialT: t.CredentialT): FlowInstance {
            this.dataT.statusE = t.FlowStatusE.CLOSED;
            this.dataT.timestamps.closedT = u.TimestampStr();
            this.freeze(this.isClosed());
            // TODO ???
            return this;
        }

        log(credentialT: t.CredentialT, descriptionT: t.DescriptionT): t.LogItemT {
            const logItemT: t.LogItemT = {
                timestamp: u.TimestampStr(),
                credential: credentialT,
                description: descriptionT,
            };
            this.dataT.logItemsT.push(logItemT);
            return logItemT;
        }

        dataUpload(dataItemsT: t.DataItemT[]): FlowInstance {
            // iterate flowForm data fields and update from taskData
            for (const dataInstance of dataItemsT) {
                const foundInstance = this.dataT.dataItemsT.find(dataItem => dataItem.name == dataInstance.name);
                if (!foundInstance) {
                    this.dataT.dataItemsT.push(dataInstance);
                };
            };
            return this;
            // redo whole code
        }


    }


}

