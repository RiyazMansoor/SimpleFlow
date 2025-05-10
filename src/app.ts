
import { OceanFlow as t } from "./types";
import { OceanFlow as f } from "./flows";


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

        }

    }

}