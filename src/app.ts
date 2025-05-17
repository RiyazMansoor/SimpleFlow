
import { OceanFlow as t } from "./types";
import { OceanFlow as c } from "./basics";
import { OceanFlow as s } from "./security";
import { OceanFlow as d } from "./validation";
import { OceanFlow as f } from "./flows";
import { OceanFlow as n } from "./nodes";


export namespace OceanFlow {

    // short-cut internal type for convenience
    type FlowConfigs = c.Configs<t.NameT, t.FlowConfigT, f.FlowConfig>;

    /**
     * Main class of the OceanFlow application.
     * This class is a singleton that contains
     * 1) all the api requests
     * 2) all the different work flow configs to service the api requests
     */
    export class OceanFlowApp {

        // single instance of this app
        private static app: OceanFlowApp = new OceanFlowApp();

        // respository of work-flow configurations by work-flow name
        private flowConfigs = new c.Configs<t.NameT, t.FlowConfigT, f.FlowConfig>();

        // private constructor - for singleton instance
        private constructor() {
            // singleton app
        }

        /**
         * Returns the single instance of this application.
         * @returns singleton instance of this application
         */
        static getInstance(): OceanFlowApp {
            return OceanFlowApp.app;
        }

        add(...configs: f.FlowConfig[]): void {
            this.flowConfigs.add(...configs);
        }

        get(flowNameIdT: t.NameT): f.FlowConfig {
            return this.flowConfigs.get(flowNameIdT)!;
        }

        apiRequest(apiRequestE: t.APIRequestE, contextT: t.ContextT): t.ResponseT {
            const loginEmailIdT: t.EmailT = contextT.userEmail ?? "";
            const credential = this.credential(loginEmailIdT);
            if (!credential) return this.invalidCredential(loginEmailIdT);
            // credential validated at this point
            switch (apiRequestE) {
                case t.APIRequestE.FETCH_FLOW:
                    {
                        const flowNameIdT = contextT.flowName ?? "";
                        const flowConfig = this.flowConfigs.get(flowNameIdT);
                        // validate a real flow
                        if (!flowConfig) return this.invalidFlowName(flowNameIdT);
                        // validate role permissions
                        const formName: t.NameT = flowConfig.startFormName();
                        const formConfig: n.FormConfig = flowConfig.getFormConfig(formName);
                        {
                            const auditCauses: t.AuditCauseT[] = formConfig.assertRole(credential);
                            if (auditCauses.length) return this.wrapResponse(...auditCauses);
                        }
                        // return start form information
                        const responseT: t.ResponseT = formConfig.response();
                        return responseT;
                    }
                case t.APIRequestE.START_FLOW:
                    {
                        const flowNameIdT = contextT.flowName ?? "";
                        const flowConfig = this.flowConfigs.get(flowNameIdT);
                        // validate a real flow
                        if (!flowConfig) return this.invalidFlowName(flowNameIdT);
                        // validate role permissions
                        const formName: t.NameT = flowConfig.startFormName();
                        const formConfig: n.FormConfig = flowConfig.getFormConfig(formName);
                        {
                            const auditCauses: t.AuditCauseT[] = formConfig.assertRole(credential);
                            if (auditCauses.length) return this.wrapResponse(...auditCauses);
                        }
                        // validate data
                        const dataItemsT: t.DataInstanceT[] = formConfig.dataItemsToUpload(contextT.dataItems ?? []);
                        {
                            const auditCauses: t.AuditCauseT[] = formConfig.validate(dataItemsT);
                            if (auditCauses.length) return this.wrapResponse(...auditCauses);
                        }
                        // everthing good - create objects and save
                        const atLeastFlowInstance: t.AtLeastFlowInstance = {
                            [t.FlowConfigPK]: flowConfig.getName(),
                            dataItemsT: dataItemsT,
                        };
                        const flowInstance: f.FlowInstance = new f.FlowInstance(atLeastFlowInstance);
                        flowInstance.save();
                        formConfig.nextSteps(flowInstance);
                        //
                        return responseT;
                    }
                case t.APIRequestE.SELECT_FORM:
                    break;
                case t.APIRequestE.RETURN_FORM:
                    break;
                case t.APIRequestE.SAVE_FORM:
                    break;
                case t.APIRequestE.SUBMIT_FORM:
                    break;
                case t.APIRequestE.ABORT_FLOW:
                    break;
                default:
                    const responseT: t.ResponseT = {
                        "error": [s.AuditReport.toCause(`unknown api call`, {})],
                    };
                    return responseT;
            };
        }


        private credential(loginEmailIdT: t.EmailT): s.Credential | undefined {
            if (!loginEmailIdT) new s.Credential(t.PublicCredentialT);
            return s.Credential.getInstance(loginEmailIdT);
        }

        private invalidCredential(loginEmailIdT: t.EmailT): t.ResponseT {
            const auditCause: t.AuditCauseT = {
                descriptionT: `valid login-email not found for [${loginEmailIdT}]`,
                payloadT: {}
            };
            return this.wrapResponse(auditCause);
        }

        private invalidFlowName(flowNameIdT: t.NameT): t.ResponseT {
            const auditCause: t.AuditCauseT = {
                descriptionT: `valid flow-name not found for [${flowNameIdT}]`,
                payloadT: {}
            };
            return this.wrapResponse(auditCause);
        }

        private invalidFormName(formInstanceIdT: t.NameT): t.ResponseT {
            const auditCause: t.AuditCauseT = {
                descriptionT: `valid form-instance not found for [${formInstanceIdT}]`,
                payloadT: {}
            };
            return this.wrapResponse(auditCause);
        }

        private wrapResponse(...auditCauses: t.AuditCauseT[]): t.ResponseT {
            const responseT: t.ResponseT = {
                error: auditCauses,
            };
            return responseT;
        }

    }


}