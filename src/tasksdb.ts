
import { TInstanceId, TTaskInstance, TTaskSpecName, TTaskSpec } from "./tasks";


const { FSDB } = require("file-system-db");

const dbTaskSpecs = new FSDB("./dbTaskSpecs.json", false);

export function dbSaveTaskSpec(taskSpec: TTaskSpec): void {
    dbTaskSpecs.set(taskSpec.taskSpecName, taskSpec);
}
export function dbLoadTaskSpec(taskSpecName: TTaskSpecName): TTaskSpec {
    return dbTaskSpecs.get(taskSpecName);
}

const dbTaskInstances = new FSDB("./dbTaskInstances.json", false);

export function dbSaveTaskInstance(taskInstance: TTaskInstance): void {
    dbTaskInstances.set(taskInstance.taskInstanceId, taskInstance);
}

export function dbLoadTaskInstance(taskInstanceId: TInstanceId): TTaskInstance {
    return dbTaskInstances.get(taskInstanceId);
}


