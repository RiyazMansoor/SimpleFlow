
import { OceanFlow as t } from "./types";
import { OceanFlow as s } from "./security";
import { OceanFlow as a } from "./audit";
import { OceanFlow as f } from "./flows";
import { OceanFlow as n } from "./nodes";


export namespace OceanFlow {

    class OceanFlow {

        private static oceanFlow: OceanFlow = new OceanFlow();

        private configs: Map<t.NameT, f.FlowConfig> = new Map();

        private constructor() { }

        getInstance(): OceanFlow {
            return OceanFlow.oceanFlow;
        }

        add(...configs: f.FlowConfig[]): void {
            configs.forEach(config => this.configs.set(config.getId(), config));
        }

        get(flowNameT: t.NameT): f.FlowConfig | undefined {
            return this.configs.get(flowNameT);
        }

        clear(): void {
            this.configs.clear();
        }

        apiRequest(apiRequestE: t.APIRequestE, contextT: t.ContextT): t.ResponseT {
            let actions: t.Action[] = [];
            switch (apiRequestE) {
                case t.APIRequestE.FETCH_FLOW:
                    actions = fetchFlow;
                    break;
                case t.APIRequestE.START_FLOW:
                    actions = startFlow;
                    break;
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
                        "error": [a.AuditReport.toCause(`unknown api call`, {})],
                    };
                    return responseT;
            };
            // execute 
            for (const action of actions) {
                action(context);
                const count = context.response?.error?.length;
                if (!count) {
                    break;
                };
            };
            // TODO, could be undefined - means action is wrong. throw and informed error here
            return context.response!;

        }

    }

    class Context {

        private readonly contextT: t.ContextT;

        private readonly credential: s.Credential;
        private readonly formInstance: n.FormInstance;

        private constructor(contextT: t.ContextT) {
            this.contextT = contextT;
            // checking user-id (emailIdT)
            const credentialEmailIdT: t.EmailT = contextT[t.CredentialPK];
            if (credentialEmailIdT) {
                const temp = s.Credential.getInstance(credentialEmailIdT);
                if (temp) {
                    this.credential = temp;
                };
            } else {
                this.credential = new s.Credential(t.PublicCredential);
            };
            // if no credential generated => abort process
            if (!this.credential) {
                return;
            };
            // fill other context variables
            const formInstanceIdT = contextT[t.FormInstancePK];
            // fill flowName parameter only if formName parameter is absent
            const flowNameIdT = contextT[t.FlowConfigPK];
            if (!this.formInstance) {
                if (!flowNameIdT) {
                    return;
                } else {
                    const flowConfig = f.FlowConfigs.get().get(flowNameIdT);
                    if (!flowConfig) {
                        return;
                    };
                    this.formInstance = new n.FormInstance(flowConfig, contextT[t.FormInstancePK]);
                }
            }
        }

        static get(contextT: t.ContextT): t.AuditCauseT[] {
            const context = new Context(contextT);
            // checking user-id (emailIdT)
            if (!context.getCredential()) {

            }

            const credentialEmailIdT: t.EmailT = contextT[t.CredentialPK];
            if (credentialEmailIdT) {

            }
            const credb = new s.Credential(t.PublicCredential)
            if (!contextT[t.CredentialPK]) {
                creds = new s.Credential(t.PublicCredential);
            } else {
                creds = s.Credential.getInstance(context[t.CredentialPK]);
                if (!credential) {
                    contextPropertyValueNotFound("userEmail", context);
                    return;
                };
            }
            context.credential = credential;

        }

        getCredential(): s.Credential {
            return this.credential;
        }
    }

}