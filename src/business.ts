import { OceanFlow as t } from "./types";
import { OceanFlow as db } from "./store";


export namespace OceanFlow {

    /**
     * Note: this function is called internally, hence parameter checks not required
     * @param taskInstanceT 
     */
    export function actionTaskUpload(taskInstanceT: t.TaskInstanceT): void {
        const flowInstanceT: t.FlowInstanceT = db.dbFlowInstances[taskInstanceT[t.FlowInstancePK]];
        // flowName comes internally so will return a valid object
        const flowConfigT: t.FlowConfigT = getFlowConfigT(flowInstanceT[t.FlowNamePK]) as t.FlowConfigT;
        const nodeConfigT: t.NodeConfigT = flowConfigT.nodeConfigsT[taskInstanceT[t.NodeNamePK]];
        // TODO: at this point nodeConfigT and flowInstanceT will have the properties 
        // to get the location of upload and the fields to upload and the data to upload
    }

    export function startFetch(credential: t.AuthorizerT): t.ResponseT {
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

    function getFlowConfigT(flowNameIdT: t.NameT): t.FlowConfigT | undefined {
        return t.FlowConfigs[flowNameIdT];
    }

    function credential(loginEmailIdT: t.EmailT): s.Securable | undefined {
        if (!loginEmailIdT) new s.Securable(t.PublicCredentialT);
        return s.Securable.getInstance(loginEmailIdT);
    }

    function invalidCredential(loginEmailIdT: t.EmailT): t.ResponseT {
        const auditCause: t.AuditCauseT = {
            descriptionT: `valid login-email not found for [${loginEmailIdT}]`,
            payloadT: {}
        };
        return b.wrapResponse(auditCause);
    }

    function invalidFlowName(flowNameIdT: t.NameT): t.ResponseT {
        const auditCause: t.AuditCauseT = {
            descriptionT: `valid flow-name not found for [${flowNameIdT}]`,
            payloadT: {}
        };
        return b.wrapResponse(auditCause);
    }


}