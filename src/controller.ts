
import { TDataInstance, TFlowInstance } from "./flows";
import { dbAsCredential, dbAsFlowSpec } from "./store";
import { TTaskInstance } from "./tasks";
import { ETaskAction, TBusinessContext, TCredential, TEmail, TFlowSpec, TInstanceId, TName, TUser } from "./types";


// must be logged in

///FlowStartForm/<flowSpecName>/
// export function FlowStartForm(flowSpecName: TFlowSpec) {

// }

/**
 * if taskInstanceId is supplied then flowSpecName will not be used
 * @param userEmailId 
 * @param userAction 
 * @param flowSpecName 
 * @param taskInstanceId 
 * @returns 
 */
function CreateContext(userEmailId: TEmail, userAction: ETaskAction, flowSpecName?: TName, taskInstanceId?: TInstanceId): TBusinessContext {
    const credential: TCredential = dbAsCredential(userEmailId);
    // validate parameters
    if (!flowSpecName && !taskInstanceId) {
        const errData = {
            userEmailId: userEmailId,
            userAction: userAction,
            flowSpecName: flowSpecName ?? "",
            taskInstanceId: taskInstanceId ?? "",
        }
        const errMessage = `Context creation error - flowSpecName or taskInstanceId must be supplied`;
        throw log(JSON.stringify(errData), credential, errMessage);
    }
    // create context from here
    // taskInstanceId takes precedence of flowSpecName
    if (taskInstanceId) {
        const taskInstance: TTaskInstance = dbAsTaskInstance(taskInstanceId);
        const flowInstance: TFlowInstance = dbAsFlowInstance(taskInstance.flowInstanceId);
        const flowSpec: TFlowSpec = dbAsFlowSpec(flowInstance.flowSpecName);
        const context: TBusinessContext = {
            credential: credential,
            action: userAction,
            flowSpec: flowSpec,
            flowInstance: flowInstance,
            taskInstance: taskInstance,
        }
        return context;
    }
    // if taskInstanceId is invalid then flowSpecName must be valid
    const flowSpec: TFlowSpec = dbAsFlowSpec(flowSpecName as TName);
    const context: TBusinessContext = {
        credential: credential,
        action: userAction,
        flowSpec: flowSpec,
    }
    return context;
}

function flowController(userEmailId: TEmail, userAction: ETaskAction, flowSpecName: TName, data?: TDataInstance): void {

}

