

// This file contains the type definitions for the application
// and the data structures used in the application.

// The basic types used in the application
export type TInteger = number;
export type TDecimal = number;
export type TLabel = string;
export type TName = string;
export type THtml = string;
export type TNumeric = string;
export type TAlphatic = string;
export type TAlphaNumeric = string;
export type TPassword = string;
export type TEmail = string;
export type TPhone = string;
export type TNIN = string;
export type TDate = string;
export type TTime = string;
export type TTimestamp = string;
export type TPostcode = string;
export type TExpression = string;
export type TInstanceId = string;

export type KeyValue = {
    key: string,
    value: string,
}

export type TAuditLog = {
    logEntityClass: TLabel,
    logEntityInstance: TLabel,
    logTimestamp: TTimestamp,
    logCredential: TCredential,
    logMessage: TLabel,
}


//// The types used for security access

export type TRoleName = string;

export type TRole = {
    // must be unique
    name: TRoleName,
    description: string,
    active: boolean,
}

export type TUser = {
    // must be unique
    emailId: TEmail,
    password: TPassword,
    name: TName,
    active: boolean,
}

// active roles a user has
export type TCredential = {
    emailId: TEmail,
    activeRoleNames: TRoleName[]
}

export type TValidationSpec = {
    required?: boolean,
    pattern?: string,
    valRange?: { min?: TDecimal, max?: TDecimal },
    lenRange?: { min?: TInteger, max?: TInteger },
    dateRange?: { min?: TInteger, max?: TInteger },     // days relative to TODAY()
    timeRange?: { min?: TInteger, max?: TInteger },     // in minutes
}

export enum EDatumType {
    INTEGER,
    DECIMAL,
    DATE,
    TIME,
    TIMESTAMP,
    EMAIL,
    MALDIVIAN_PHONE,
    MALDIVIAN_ID,
    NUMERIC,
    ALPHABETIC,
    ALPHANUMERIC,
    PASSWORD,
}

export type DatumName = string;

export type TDatumSpec = {
    datumType: EDatumType,
    defValue?: string,
    validations?: TValidationSpec,
}
export type TDataSpec = {
    [datumName: DatumName]: TDatumSpec | TDataSpec
}


export enum EWidgetType {
    EMAIL,
    TEXT,
    TEXTAREA,
    DROPDOWN,
    LISTBOX,
    RADIOBUTTONS,
    CHECKBOXES
}

export enum EWidgetWidth {
    FULL,
    HALF,
    THIRD,
    TWOTHIRD,
    FOURTH,
    THREEFOURTH,
    REST,
}

export enum EWidgetAccess {
    ENABLED,
    DISABLED,
    HIDDEN,
}


export type TRenderSpec = {
    forms: {
        formName: TLabel,
        renderLevel: EWidgetAccess,
    }[],
    // pre built component with multiple widgets that can map multiple fields
    component?: {
        renderGroup: TLabel,
        componentName: TLabel,
        datumNames: DatumName[], 
    },
    // a single widget for a dingle field
    custom?: {
        renderGroup: TLabel,
        datumName: DatumName,
        label: TLabel,
        widget: EWidgetType,
        width: EWidgetWidth,
        placeholder?: string
        hint?: string,
        list?: KeyValue[],
    }
}

//// begin task specification
//// a task is a unit of work that is part of a workflow
//// a task is a specification of a task instance

// must be unique withing the same workflow
export type TTaskSpecName = string;

// two types of tasks (as yet)
export enum ETaskType {
    HUMAN,
    SYSTEM
}

// the status of a task
export enum ETaskStatus {
    CREATED,        // task create, waiting queue - an active state
    SELECTED,       // task has been picked from queue - an active state - HUMAN task only
    RETURNED,       // task returned to queue - this is an end state - HUMAN task only
    EXECUTED,       // task executed - this is an end state
}

// common properties for a task specification
export type TTaskSpec = {
    taskSpecName: TTaskSpecName,
    taskType: ETaskType,
    // the multiple tasks that follow this task
    taskNext: {
        // boolean expression must be true to execute this following task
        predicateExpr: TExpression,
        // name of the following task
        taskName: TTaskSpecName,
    }[],
    // -- human input tasks --
    // authorised roles for this task
    taskRoles?: TRoleName[],
    // the form to load for this task
    taskFormName?: string,
}


export type TFlowSpec = {
    flowSpecName: TLabel,
    flowInitRoles: TRoleName[],
    flowInitForm: TLabel,
    flowDataSpec: TDataSpec,
    flowRendering: TRenderSpec[],
}


export type TError = {
    errorTimestamp: TTimestamp,
    errorMessages: TLabel,
    errorMethodName: TLabel,
    errorPayload: Record<string, unknown>,
}

/*
export type TFlowSecurityError = {
    flowNameSpec: TLabel,
    flowRoles: TRoleName[],
    userCredential: TCredential,
    errorDetail: string,
    methodName: TLabel,
}

export type TFlowValidationError = {
    flowNameSpec: TLabel,
    userEmailId: TEmail,
    datumName: TLabel,
    errorMessages: string[],
}

export type TResponse = {
    securityError: TFlowSecurityError,
    validationErrors: TFlowValidationError[],
    flowRendering: TRenderSpec[],
    flowDataInstance: string,
}
*/
