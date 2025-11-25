
import { IntegerT, DecimalT, NameT } from "./types.js";

export enum DataTypeE {
    INTEGER,
    DECIMAL,
    DATE,
    TIME,
    TIMESTAMP,
    EMAIL,
    PASSWORD,
    TEXT,
    PARAGRAPH,
};

export enum DataUiE {
    ENABLED,
    DISABLED,
    HIDDEN,
};

export type ValidationT = {
    required?: boolean,
    pattern?: string,
    valRange?: { min?: DecimalT, max?: DecimalT },
    lenRange?: { min?: IntegerT, max?: IntegerT },
    dateRange?: { min?: IntegerT, max?: IntegerT },     // days relative to TODAY()
    timeRange?: { min?: IntegerT, max?: IntegerT },     // in minutes
};

//// configuration of data items in the flow
//// name is used as an unique identifier in flow
//// data validations are specified here
export type DataItemT = {
    dataTypeE: DataTypeE,
    dataValueT: string | number | boolean,
    validations?: ValidationT,          // validations can be optional
    uiE?: DataUiE,
};

export type DataObjectT = { [key: string]: DataValueT };
export type DataArrayT = DataValueT[];
export type DataValueT = DataItemT | DataObjectT | DataArrayT;


