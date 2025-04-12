import { TCredential, TRole, TUser } from "./access";
import { KeyValue, TEmail, TTimestamp } from "./types";
import { hasUserRole, loadFlowSpec } from "./store";


export type TValidationSpec = {
    required?: boolean,
    pattern?: string,
    valRange?: { min?: number, max?: number },
    lenRange?: { min?: number, max?: number },
    dateRange?: { min?: number, max?: number },     // relative to TODAY()
    timeRange?: { min?: number, max?: number },     // in minutes
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

export type TDatumInstance = {
    type: EDatumType,
    datumValue: string | number,
}
export type TDataInstance = {
    [datumName: DatumName]: TDatumInstance | TDataInstance
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

export enum ERenderLevel {
    ENABLED,
    DISABLED,
    HIDDEN,
}

export type OptGroup = {
    label: string,
    keyvalues: KeyValue[],
}

export type TRenderSpec = {
    forms: {
        formName: string,
        renderLevel: ERenderLevel,
    }[],
    // pre built component with multiple widgets that can map multiple fields
    component?: {
        componentName: string,
        [datumName: string]: DatumName, 
    },
    // a single widget for a dingle field
    custom?: {
        datumName: DatumName,
        label: string,
        widget: EHtmlWidget,
        width: EHtmlWidth,
        placeholder?: string
        hint?: string,
        list?: KeyValue[] | OptGroup[],
    }
}



export type TFlowSpec = {
    flowName: string,
    flowInitRole: TRole,
    flowData: TDataSpec,
    formFields: TRenderSpec,
}

export enum EFlowStatus {
    OPEN,
    CLOSED
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
    // htmlcontrols: THtmlControlSpec[],
    // htmlforms: TUserInputSpec[],
    // workunits: TWorkUnitSpec[],
}


function cannotStartFlow(flowSpec: TFlowSpec, userEmailId: TEmail): boolean {
    // return !hasUserRole(userEmailId, flowSpec.flowInitRole);
}

export function flowStartFetch(flowName: string, userName: string): any {
    // load flow spec
    const flowSpec: TFlowSpec = loadFlowSpec(flowName);
    // if (!hasUserRole(userName, flowSpec.flowInitRole)) {
    //     throw ``;
    // }
    // check user has role
    // return form
}

export function flowStartInit(): any {

}

export function flowSystemInit(): any {

}


