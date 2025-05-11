

// fetchFlow :: exists-flowConfig | has-Access | exec-function  
import { OceanFlow as u } from "./utils";
import { OceanFlow as t } from "./types";
import { OceanFlow as s } from "./security";


export namespace OceanFlow {

    // common start action - loads the credential
    // a public user credential is created if no userEmail is supplied
    const CredentialAction: t.Action = (context: t.TContext): void => {
        if (!context.userEmail) {
            context.credential = new Credential(t.PublicCredential);
            return;
        };
        const credential = Credential.getInstance(context.userEmail);
        if (!credential) {
            contextPropertyValueNotFound("userEmail", context);
            return;
        };
        context.credential = credential;
    }


    //// fetch flow sequence

    const LoadFetchContextAction: t.Action = (context: t.TContext): void => {
        // in this context flowName must be supplied from the client
        if (!context.flowName) {
            contextPropertyMissing("flowName", context);
            return;
        };
        const flowName: t.NameT = context.flowName;
        const flowConfig = FlowConfigs.getInstance().get(flowName);
        if (!flowConfig) {
            contextPropertyValueNotFound("flowName", context);
            return;
        };
        context.flowConfig = flowConfig;
        context.formName = flowConfig.startForm();
    }

    const SecureFetchAction: t.Action = (context: t.TContext): void => {
        const credential: Credential = context.credential!;
        const flowConfig: FlowConfig = context.flowConfig!;
        const auditCauses: t.AuditCauseT[] = flowConfig.assertAuthorized(credential.getData());
        if (auditCauses.length) {
            context.response = { "error": auditCauses };
        };
    }

    const FetchAction: t.Action = (context: t.TContext): void => {
        const formName: t.NameT = context.formName!;
        const flowConfig: FlowConfig = context.flowConfig!;
        // prepare response
        const viewConfigs = flowConfig.viewConfigs(formName);
        const dataConfigs = flowConfig.dataConfigs(formName);
        const response: t.ResponseT = {
            data: {
                viewConfigs: viewConfigs,
                dataConfigs: dataConfigs,
                dataItems: [],
            },
        };
        context.response = response;
    }

    const fetchFlow: t.Action[] = [CredentialAction, LoadFetchContextAction, SecureFetchAction,
        FetchAction];


    //// start flow sequence

    const LoadStartContextAction: t.Action = (context: t.TContext): void => {
        LoadFetchContextAction(context);
        if (!context.dataItems) {
            contextPropertyMissing("dataItems", context);
            return;
        };
    }

    const SecureStartAction: t.Action = (context: t.TContext): void => {
        SecureFetchAction(context);
    }

    const DataValidationAction: t.Action = (context: t.TContext): void => {
        const formName: t.NameT = context.formName!;
        const dataItems: t.DataItemT[] = context.dataItems!;
        const flowConfig: FlowConfig = context.flowConfig!;
        const credential: Credential = context.credential!;
        // validate relevant data and throw if validation errors+==
        const causes = flowConfig.validate(formName, dataItems, credential.getData());
        if (!causes.length) {
            dataValidationIssues(causes, context);
            return;
        }
    }

    const StartAction: t.Action = (context: t.TContext): void => {
        const flowNameT: t.NameT = context.flowName!;
        const dataItemsT: t.DataItemT[] = context.dataItems!;
        const credentialT: t.CredentialT = context.credential!.getData();
        const flowConfig: FlowConfig = FlowConfigs.getInstance().get(flowNameT)!;
        const flowInstance: FlowInstance = new FlowInstance({ "nameT": flowNameT });
        flowInstance.log(credentialT, "flow created");
        flowInstance.dataUpload(dataItemsT).save();
        const nodesT: t.NodeT[] = flowConfig.startNext();
        for (const nodeT of nodesT) {
            let predicate: boolean = true;
            if (nodeT.predExpressionT) {
                // execute expression and assign result
            };
            if (!predicate) continue;
            switch (nodeT.nodeTypeE) {
                case t.NodeTypeE.FORM:
                    break;
                case t.NodeTypeE.JOB:
                    break;
                default:
                // error
            };
        };
    }

    const startFlow: t.Action[] = [CredentialAction, LoadStartContextAction, SecureStartAction,
        DataValidationAction, StartAction];





    //// common util functions

    function contextPropertyMissing(propertyName: t.NameT, context: t.TContext): void {
        const credential = context.credential?.getData() ?? t.SystemCredential;
        const description: t.DescriptionT = `expected context property [${propertyName}] missing`;
        const cause = AuditReport.toCause(description, {});
        AuditReport.saveReport(credential, cause);
        context.response = { error: [cause] };
    }

    function contextPropertyValueNotFound(propertyName: t.NameT, context: t.TContext): void {
        const credential = context.credential!.getData();
        const description: t.DescriptionT = `context property [${propertyName}] value not found`;
        const cause = AuditReport.toCause(description, {});
        AuditReport.saveReport(credential, cause);
        context.response = { error: [cause] };
    }

    function accessRoleMissing(payload: t.JSONObjectT, context: t.TContext): void {
        const credential = context.credential!.getData();
        payload.userName = credential.nameT;
        payload.hasRoles = credential.hasRoleNamesT;
        // const credential = context.credential ?? SystemCredential;
        const description: t.DescriptionT = `required user role is missing`;
        const cause = AuditReport.toCause(description, payload);
        AuditReport.saveReport(credential, cause);
        context.response = { error: [cause] };
    }

    function dataValidationIssues(causes: t.AuditCauseT[], context: t.TContext): void {
        const credential = context.credential!.getData();
        AuditReport.saveReport(credential, ...causes);
        context.response = { error: causes };
    }

}