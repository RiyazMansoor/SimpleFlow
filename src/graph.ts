
import { OceanFlow as t } from "./types";
import { OceanFlow as i } from "./interfaces";
import { OceanFlow as f } from "./functions";

export namespace OceanFlow {


    export abstract class NodeConfig<ConfigT extends t.NodeConfigT>
        implements i.NodeConfig<ConfigT> {

        protected readonly dataT: ConfigT;
        protected readonly flowConfig: FlowConfig;

        /**
         * @param configT the base json object
         * @param flowConfig the work-flow configuration object 
         */
        constructor(configT: ConfigT, flowConfig: FlowConfig) {
            this.dataT = configT;
            this.flowConfig = flowConfig;
        }


        allowedRoleNamesT(): t.NameT[] {
            return f.allowedRoleNamesT(this.dataT);
        }

        createNodes(nodeInstance: i.NodeInstance ): void {
            // f.createGraphNodes();
        }


    }
}