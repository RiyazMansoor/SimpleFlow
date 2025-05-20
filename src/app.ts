
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./basics";
import { OceanFlow as s } from "./security";
import { OceanFlow as v } from "./validations";
import { OceanFlow as c } from "./configs";
// import { OceanFlow as n } from "./nodes";


export namespace OceanFlow {

    // short-cut internal type for convenience
    type FlowConfigs = b.ConfigEntity<c.FlowConfig>;

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
        private flowConfigs = new Map<t.NameT, c.FlowConfig>();

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

        add(...flowConfigsT: t.FlowConfigT[]): void {
            flowConfigsT
                .map(configT => new c.FlowConfig(configT))
                .forEach(config => this.flowConfigs.set(config.getIdT(), config));
        }

        get(flowNameIdT: t.NameT): c.FlowConfig {
            return this.flowConfigs.get(flowNameIdT)!;
        }

        apiRequest(apiRequestE: t.APIRequestE, contextT: t.ContextT): t.ResponseT {
            const loginEmailIdT: t.EmailT = contextT.userEmailIdT ?? "";
            const credential = this.credential(loginEmailIdT);
            if (!credential) {
                return this.invalidCredential(loginEmailIdT);
            };
            // credential validated at this point
            const dataValuesT: t.DataValueT[] = contextT.formDataValuesT ?? [];
            const flowNameIdT = contextT.flowNameIdT ?? "";
            const formInstanceIdT = contextT.formInstanceIdT ?? "";
            switch (apiRequestE) {
                case t.APIRequestE.FETCH_FLOW:
                    {
                        const flowConfig = this.flowConfigs.get(flowNameIdT);
                        if (!flowConfig) {
                            return this.invalidFlowName(flowNameIdT);
                        };
                        return flowConfig.startFetch(credential);
                    }
                case t.APIRequestE.START_FLOW:
                    {
                        const flowConfig = this.flowConfigs.get(flowNameIdT);
                        if (!flowConfig) {
                            return this.invalidFlowName(flowNameIdT);
                        };
                        flowConfig.startSubmit(credential, dataValuesT);
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


        private credential(loginEmailIdT: t.EmailT): s.Securable | undefined {
            if (!loginEmailIdT) new s.Securable(t.PublicCredentialT);
            return s.Securable.getInstance(loginEmailIdT);
        }

        private invalidCredential(loginEmailIdT: t.EmailT): t.ResponseT {
            const auditCause: t.AuditCauseT = {
                descriptionT: `valid login-email not found for [${loginEmailIdT}]`,
                payloadT: {}
            };
            return b.wrapResponse(auditCause);
        }

        private invalidFlowName(flowNameIdT: t.NameT): t.ResponseT {
            const auditCause: t.AuditCauseT = {
                descriptionT: `valid flow-name not found for [${flowNameIdT}]`,
                payloadT: {}
            };
            return b.wrapResponse(auditCause);
        }

 
    }


}