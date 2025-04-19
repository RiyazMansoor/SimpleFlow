
export type TTaskSpecName = string;

export enum ETaskStatus {
    CREATED,
    PICKED,
    CLOSED,
}

export type TTaskSpec = {
    taskName: TTaskSpecName,
    taskNext: {
        taskName: TTaskSpecName,
        predicateExpr: string,
    }[],
}


