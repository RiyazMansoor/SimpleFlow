
import { IntegerT, DecimalT, NameT, HtmlT } from "./types.js";

//// html rendering widget
export enum HTMLTypeE {
    EMAIL,
    TEXT,
    TEXTAREA,
    DROPDOWN,
    LISTBOX,
    RADIOBUTTON,
    CHECKBOX,
};

//// width of the html widget - allows multiple widgets on a line
export enum HTMLWidthE {
    FULL,
    HALF,
    THIRD,
    TWOTHIRD,
    FOURTH,
    THREEFOURTH,
    REST,
};

//// rendering of a control or component
//// a control represents a single field
//// a component represents multiple fields
export const FormControlPK = "controlNameIdT";
export const FormComponentPK = "componentNameIdT";


export type ValidationT = {
    required?: boolean,
    pattern?: string,
    valRange?: { min?: DecimalT, max?: DecimalT },
    lenRange?: { min?: IntegerT, max?: IntegerT },
    relDateRange?: { min?: IntegerT, max?: IntegerT },     // days relative to TODAY()
};


//// the configuration will contain one of (component, custom) or neither.
//// where it is neither, the component renders a newline 

export type FormControlT = {
    [FormControlPK]: NameT,
    dataItemName: NameT,            // the data item key
    isEnabled: boolean,             // control enabled status
    isFlowData: boolean,            // data that will be uploaded flow data
    defaultValueT?: string,          // a default value to render
    labelT: NameT,                  // label displayed for this field
    toolTypeE: HTMLTypeE,
    toolWidthE: HTMLWidthE,
    list?: [NameT, string][],
    validations?: ValidationT,
};

// pre built component with multiple widgets that can map multiple fields
export type FormComponentT = {
    [FormComponentPK]: NameT,
    controlMapping: {
        componentControlName: NameT,
        dataItemName: NameT,            // the data item key
        isEnabled: boolean,             // control enabled status
        isFlowData: boolean,            // data that will be uploaded flow data
    }[],
};


//// rendering a related controls in a segments of a form
export type FormSectionT = {
    titleT: NameT,
    itemsT: (FormControlT|FormComponentT)[],
};

//// a specific node type - user input form-config as a node on the work flow tree
export type FormConfigT = {
    titleT: NameT,
    descriptionT?: HtmlT,
    formSegmentsT: FormSectionT[],
};

