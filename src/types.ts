
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

export type KeyValue = {
    key: string,
    value: string,
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

