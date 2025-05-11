
import { OceanFlow as t } from "./types";
import { OceanFlow as u } from "./utils";
import { OceanFlow as c } from "./core";
import { OceanFlow as s } from "./security";
import { OceanFlow as a } from "./audit";
import { OceanFlow as d } from "./data";
import { OceanFlow as db } from "./store";


namespace OceanFlow {



    export class NodeConfig extends c.Base<t.NameT, t.NodeConfigT> {


        constructor(nodeConfigT: t.NodeConfigT) {
            super(t.NodeConfigPK, nodeConfigT);
        }

        assertPredicate(dataConfigs: c.Configs<t.NameT, t.DataConfigT, d.DataConfig>): t.AuditCauseT[] {
            const auditCauses: t.AuditCauseT[] = [];
            // TODO check predicate
            return auditCauses;
        }

        assertRole(credential: s.Credential): t.AuditCauseT[] {
            const auditCauses: t.AuditCauseT[] = [];
            const commonRoles = credential.hasRoles().filter(roleT => this.getRoles().includes(roleT));
            if (commonRoles.length == 0) {
                const auditCause: t.AuditCauseT = {
                    descriptionT: "NodeConfig: unauthorized user",
                    payloadT: { nodeConfigT: this.dataT },
                };
                a.AuditReport.saveReport(credential, auditCause);
                auditCauses.push(auditCause);
            };
            return auditCauses;
        }

        private getRoles(): t.NameT[] {
            return this.dataT.roleNamesT;
        }

        nextNodes(): t.NodeConfigT[] {
            return this.dataT.nextNodesT;
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
                            nodeConfigT: this.nodeConfigT,
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
                nameT: this.nodeConfigT.nameT,
                roleNamesT: this.nodeConfigT.roleNamesT,
                start: this.nodeConfigT.start,
            };
            jsonObjectT.flowConfigT = payload;
            return jsonObjectT;
        }

    }

    export abstract class NodeInstance<DataT extends t.AtLeastNodeInstance> extends c.Instance<t.InstanceIdT, DataT> {
    
    
        constructor(propertyPK: string, dbSave, dataT: t.AtLeastNodeInstance) {
            // const dataT: t.FormInstanceT = {
            //     [t.FormInstancePK]: formInstanceT[t.FormInstancePK] ?? u.RandomStr(),
            //     flowInstanceIdT: formInstanceT.flowInstanceIdT,
            //     flowNameT: formInstanceT.flowNameT,
            //     nodeConfigT: formInstanceT.nodeConfigT,
            //     formNameT: formInstanceT.nodeConfigT.nameT,
            //     timestampedT: formInstanceT.timestampedT ?? u.TimestampStr(),
            //     accessesT: formInstanceT.accessesT ?? [],
            //     statusE: formInstanceT.statusE ?? t.FormStatusE.CREATED,
            //     tempDataItemsT: formInstanceT.tempDataItemsT ?? [],
            //     currentUserEmailT: formInstanceT.currentUserEmailT ?? "",
            // };
            super(propertyPK, db.dbSaveFormInstance, dataT);
        }
        
        assertAuthorised(credentialT: t.CredentialT): t.AuditCauseT[] {
            const jsonObjectT: t.JSONObjectT = {
                flowName: this.dataT.flowNameT,
                flowInstanceId: this.dataT.flowInstanceIdT,
                formName: this.dataT.formNameT,
                formInstanceId: this.dataT.instanceIdT,
                neededFormRoles: this.dataT.nodeConfigT.roleNamesT,
            };
            return u.assertAuthorized(credentialT, this.dataT.nodeConfigT.roleNamesT, jsonObjectT);
        }
    
        flowInstanceId(): t.InstanceIdT {
            return this.dataT.flowInstanceIdT;
        }
    
        selected(credentialT: t.CredentialT): FormInstance {
            this.dataT.statusE = t.FormStatusE.SELECTED;
            const accessed: t.FormAccessT = {
                credentialT: credentialT,
                selectedTimestampT: u.TimestampStr(),
            }
            this.dataT.accessesT.push(accessed);
            this.update();
            return this;
        }
    
        returned(credentialT: t.CredentialT): FormInstance {
            this.dataT.statusE = t.FormStatusE.CREATED;
            const accessedT: t.FormAccessT = this.dataT.accessesT.slice(-1)[0];
            accessedT.returnedTimestampT = u.TimestampStr();
    
            return this;
        }
    
        requested(credentialT: t.CredentialT): FormInstance {
            this.dataT.accessesT.slice(-1)[0].requestedTimestampT = u.TimestampStr();
            // TODO
            return this;
        }
    
        submitted(credentialT: t.CredentialT): FormInstance {
    
            return this;
        }
    
        aborted(credentialT: t.CredentialT): FormInstance {
            this.dataT.statusE = t.FormStatusE.ABORTED;
            const accessedT: t.FormAccessT = {
                credentialT: credentialT,
                selectedTimestampT: u.TimestampStr(),
                abortedTimestampT: u.TimestampStr(),
            };
            this.dataT.accessesT.push(accessedT);
            return this;
        }
    
        private update(): void {
            this.dataT.accessesT = this.dataT.accessesT.slice(-10);
            this.dataT.currentUserEmailT = this.dataT.accessesT.slice(-1)[0].credentialT.emailT;
        }
    
    }
    
    
    
}


    // export const NodeConfigs = new c.Configs<t.NameT, t.NodeConfigT, NodeConfig>();

    class JobInstance extends c.Instance<t.NameT, t.JobInstanceT> {

        constructor(jobInstanceT: t.JobInstanceT) {
            super(t.JobInstancePK, db.dbLoadJobInstance, jobInstanceT);
        }



    }

    export class FormInstance extends c.Instance<t.InstanceIdT, t.FormInstanceT> {
    
    
        constructor(formInstanceT: t.AtLeastFormInstance) {
            const dataT: t.FormInstanceT = {
                [t.FormInstancePK]: formInstanceT[t.FormInstancePK] ?? u.RandomStr(),
                flowInstanceIdT: formInstanceT.flowInstanceIdT,
                flowNameT: formInstanceT.flowNameT,
                nodeConfigT: formInstanceT.nodeConfigT,
                formNameT: formInstanceT.nodeConfigT.nameT,
                timestampedT: formInstanceT.timestampedT ?? u.TimestampStr(),
                accessesT: formInstanceT.accessesT ?? [],
                statusE: formInstanceT.statusE ?? t.FormStatusE.CREATED,
                tempDataItemsT: formInstanceT.tempDataItemsT ?? [],
                currentUserEmailT: formInstanceT.currentUserEmailT ?? "",
            };
            super(t.FormInstancePK, db.dbSaveFormInstance, dataT);
        }
    
        static getInstance(instanceId: t.NameT): FormInstance | undefined {
            return super.loadInstance(instanceId, db.dbLoadFormInstance, FormInstance);
        }
    
        assertAuthorised(credentialT: t.CredentialT): t.AuditCauseT[] {
            const jsonObjectT: t.JSONObjectT = {
                flowName: this.dataT.flowNameT,
                flowInstanceId: this.dataT.flowInstanceIdT,
                formName: this.dataT.formNameT,
                formInstanceId: this.dataT.instanceIdT,
                neededFormRoles: this.dataT.nodeConfigT.roleNamesT,
            };
            return u.assertAuthorized(credentialT, this.dataT.nodeConfigT.roleNamesT, jsonObjectT);
        }
    
        flowInstanceId(): t.InstanceIdT {
            return this.dataT.flowInstanceIdT;
        }
    
        selected(credentialT: t.CredentialT): FormInstance {
            this.dataT.statusE = t.FormStatusE.SELECTED;
            const accessed: t.FormAccessT = {
                credentialT: credentialT,
                selectedTimestampT: u.TimestampStr(),
            }
            this.dataT.accessesT.push(accessed);
            this.update();
            return this;
        }
    
        returned(credentialT: t.CredentialT): FormInstance {
            this.dataT.statusE = t.FormStatusE.CREATED;
            const accessedT: t.FormAccessT = this.dataT.accessesT.slice(-1)[0];
            accessedT.returnedTimestampT = u.TimestampStr();
    
            return this;
        }
    
        requested(credentialT: t.CredentialT): FormInstance {
            this.dataT.accessesT.slice(-1)[0].requestedTimestampT = u.TimestampStr();
            // TODO
            return this;
        }
    
        submitted(credentialT: t.CredentialT): FormInstance {
    
            return this;
        }
    
        aborted(credentialT: t.CredentialT): FormInstance {
            this.dataT.statusE = t.FormStatusE.ABORTED;
            const accessedT: t.FormAccessT = {
                credentialT: credentialT,
                selectedTimestampT: u.TimestampStr(),
                abortedTimestampT: u.TimestampStr(),
            };
            this.dataT.accessesT.push(accessedT);
            return this;
        }
    
        private update(): void {
            this.dataT.accessesT = this.dataT.accessesT.slice(-10);
            this.dataT.currentUserEmailT = this.dataT.accessesT.slice(-1)[0].credentialT.emailT;
        }
    
    }
    
    
    
}

