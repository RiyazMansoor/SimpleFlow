
export type JSONPrimitiveT = string | number | boolean;
export type JSONObjectT = { [key: string]: JSONValueT };
export type JSONArrayT = JSONValueT[];
export type JSONValueT = JSONPrimitiveT | JSONObjectT | JSONArrayT;

export type InstanceKeyT = string;
export type IntegerT = number;
export type NameT = string;
export type HtmlT = string;
export type EmailT = string;
export type TimestampStrT = string;
export type ExpressionT = string;
export type UserIdT = string;
export type RoleNameT = string;

export type SpecIdT = {
    specName: NameT,
    specVersion: IntegerT,
};

export type SpecDefT = SpecIdT & {
    specActive: boolean,
    nextSteps: SpecIdT[],
    prevSteps: NameT[],     // to be filled during loading from nextSteps
};

export type HasDataInputT = {
    inputDataNames: NameT[],
    submitRoles: RoleNameT[],
};

export type WfSpecT = SpecDefT & HasDataInputT & {
    dataSpecs: DataSpecT[],
    // startData: NameT[],
};

export type WsInputSpecT = SpecDefT & HasDataInputT & {
    guardExpression?: ExpressionT,  
};

export type WsSystemExecuteF = (data: JSONObjectT) => boolean;

export type WsSystemSpecT = SpecDefT & {
    systemExec: WsSystemExecuteF, 
};

export enum DataType {
    STRING, 
    INTEGER, 
    FLOAT, 
    DATESTR, 
    BOOLEAN
};

export type DataSpecT = {
    name: NameT,
    description: HtmlT,
    type: DataType,
    defaultValue?: JSONPrimitiveT,
    validationExpression?: ExpressionT,
};

export enum WfStatusE {
    RUNNABLE, 
    SUSPENDED, 
    TERMINATED, 
    COMPLETED_SUCCESS, 
    COMPLETED_FAIL
};

export type AdminDataT = {
    startTimestampT: TimestampStrT,
    stopTimestampT?: TimestampStrT,
};

export type InstanceDefT = SpecIdT & {
    instanceKey: InstanceKeyT,
    adminData: AdminDataT,
};

export type LogItemT = {
    timstamp: TimestampStrT,
    message: HtmlT,
};

export type HasLogItemsT = {
    logItems: LogItemT[],
};

export type WfInstanceT = InstanceDefT & HasLogItemsT & {
    data: JSONObjectT,
    status: WfStatusE,
    stepsData: {
        [specName: NameT]: IntegerT[], 
    },
};


export enum WsInputStatusE {
    WAITING,          
    SELECTED,
    PROCESSED,    
    TERMINATED,        
    READY
};

export type WsInputInstanceT = InstanceDefT & {
    flowInstanceKey: InstanceKeyT,        
    prevStepsCompleted: { [stepname: NameT]: boolean }, 
    status: WsInputStatusE, 
    dataTmp: JSONObjectT,               
    userActive: NameT,
};

export enum WsSystemStatusE {
    EXECUTE_READY,    
    EXECUTE_SUCCESS,  
    EXECUTE_FAIL,     
    SKIPPED,
    TERMINATED,        
    WAITING
};

export type WsSystemInstanceT = InstanceDefT & {
    flowInstanceKey: InstanceKeyT,        
    prevStepsCompleted: { [stepname: NameT]: boolean }, 
    attempts: TimestampStrT[], 
    status: WsSystemStatusE,
};
