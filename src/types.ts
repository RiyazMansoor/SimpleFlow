
export enum EFieldType {

}


export enum EHtmlWidget {
    EMAIL,
    TEXT,
    TEXTAREA,
    DROPDOWN,
    LISTBOX,
    RADIOBUTTONS,
    CHECKBOXES
}

export enum EHtmlWidth {
    FULL,
    HALF,
    THIRD,
    TWOTHIRD,
    FOURTH,
    THREEFOURTH,
    REST,
}

export enum EAccessMode {
    ENABLED,
    LOCKED,
    HIDDEN,
}

export enum ETaskType {
    SYSTEM,
    USER
}
export enum ETaskStatus {
    INACTIVE,
    ACTIVE,
    CLOSED,
}

export type TInteger = number;
export type TDecimal = number;
export type THtml = string;
export type TAlphaNumeric = string;
export type TEmail = string;
export type TPhone = string;
export type TNIN = string;
export type TDate = string;
export type TTime = string;
export type TTimestamp = string;
export type TPostcode = string;

export type TRole = string;
export type TUser = string;


export enum EDatumType {

}

export type TDatumSpec = {
    datumType: EDatumType,
    defValue?: string,
}
export type TDataSpec = {
    [name: string]: TDatumSpec | TDataSpec
}

export type TDatumInstance = {
    type: EDatumType,
    value: string | number,
}
export type TDataInstance = {
    [name: string]: TDatumInstance | TDataInstance
}

export type TValidationSpec = {
    required: boolean,
    pattern?: string,
    valRange?: { min?: number, max?: number },
    lenRange?: { min?: number, max?: number },
    relDateRange?: { min?: number, max?: number },
    timeRange?: { min?: number, max?: number }, // in minutes
}

export type THtmlControlSpec = {
    name: string,
    component?: string,
    custom?: {
        label: string,
        widget: EHtmlWidget,
        width: EHtmlWidth,
        placeholder?: string
        hint?: string,
        list?: { key: string, value: string }[]
    }
}

export type TUserInputSpec = {
    name: string, // unique to the array of TFormSpec
    role: string,
    datafields: {
        name: string,
        mode: EAccessMode,
    }
}

export type TWorkUnitSpec = {
    name: string, // unique in spec
    type: ETaskType,
    workname: string,
    next: {
        workunitName: string,
        predicateExpr: string,
    }[]
}

export type TTaskSpec = {
    name: string,
    role: TRole,

}

export enum EFlowStatus {
    OPEN,
    CLOSED
}
export enum EUserTaskStatus {
    WAITING,
    OPEN,
    CLOSED
}

export type TFlowSpec = {
    name: string,
    role: TRole,
    data: TDataSpec
}

export type TFlowInstance = {
    nameId: string,
    instanceId: string,
    created: {
        role: TRole,
        user: TUser,
        timestamp: TTimestamp,
    },
    iterations: {
        role: TRole,
        user: TUser,
        timestamp: TTimestamp,
        taskName: string,
        taskInstance: string,
        data: TDataInstance,
    },
    status: EFlowStatus,
    closed: TTimestamp,
}

export type TSimpleFlow = {
    datafields: TDatumSpec[],
    validations: TValidationSpec[],
    htmlcontrols: THtmlControlSpec[],
    htmlforms: TUserInputSpec[],
    workunits: TWorkUnitSpec[],
}
