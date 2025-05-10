
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


    export const NodeConfigs = new c.Configs<t.NameT, t.NodeConfigT, NodeConfig>();

    class JobInstance extends c.Instance<t.NameT, t.JobInstanceT> {

        constructor(jobInstanceT: t.JobInstanceT) {
            super(t.JobInstancePK, db.dbLoadJobInstance, jobInstanceT);
        }



    }

}

