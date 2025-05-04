

// fetchFlow :: exists-flowConfig | has-Access | exec-function  

import { TCredential } from "./access";
import { TFlowConfig, TFlowInstance } from "./flows";
import { TTaskInstance } from "./task";
import { TEmail, TInstanceId, TName } from "./types";

// startFlow :: exists-flowConfig | has-Access | editableDataInstances | validateDataInstances | exec-function  
abstract class ExecChain {


}
/**
 * Standard context created for all work flow operations.
 */
export type TContext = {
    userEmail?: TEmail,                 // optional calling user, maybe a public user
    taskInstanceId?: TInstanceId,       // needed for task specific actions
    flowName?: TName,                   // needed for flow start actions
    credential?: TCredential,           // created 
    flowConfig?: TFlowConfig,           // created if needed 
    flowInstance?: TFlowInstance,       // created if needed
    taskInstance?: TTaskInstance,       // created if needed
}


interface ExecAction {

    execute(context: TContext): void;

}