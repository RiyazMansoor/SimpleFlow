
import { JSONObjectT } from "./Types.js";

const DefinedErrors: { [code: string]: string } = {
    "1000": "Internally, unknown error code called",
    "2000": "Workflow is NOT active.",
};

export class WorkflowError extends Error {

    static createWorkflowError(code: string, ...context: JSONObjectT[]): WorkflowError {
        if (!DefinedErrors[code]) {
            return new WorkflowError("1000", context);
        };
        return new WorkflowError(code, context);
    };

    private readonly code: string;
    private readonly context: JSONObjectT[];


    private constructor(code: string, context: JSONObjectT[]) {
        super(DefinedErrors[code]);
        this.code = code;
        this.context = context;
    };

};