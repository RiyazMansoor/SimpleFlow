
import { TTaskSpecName, TTaskSpec } from "./tasks"

export type THumanTaskSpec = TTaskSpec & {
    taskRoles: string[],
    taskFormName: string,
}

export type THumanTaskInstance = {
    taskSpecName: TTaskSpecName,
    taskInstanceId: string,
    flowInstanceId: string,
    taskStatus: ETaskStatus,
    adminData?: {
        credential: TCredential,
        timestamps: {
            fetched: TTimestamp,
            returned?: TTimestamp,
            submitted?: TTimestamp,
        }
    }
}

