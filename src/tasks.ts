
import { ETaskType } from "./types";

abstract class AbstractTask {

    private readonly taskName: string;
    private readonly taskInstance: string;
    private readonly taskType: ETaskType;

    constructor(taskName: string, taskType: ETaskType) {
        this.taskName = taskName;
        this.taskInstance = "";
        this.taskType = taskType;
    }

    getName(): string {
        return this.taskName;
    }

    getInstanceId(): string {
        return this.taskInstance;
    }

    getType(): ETaskType {
        return this.taskType;
    }

    start(): void {

    }
    execute(): void {

    }
    end(): void {

    }

} 