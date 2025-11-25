
export type JSONPrimitiveT = string | number | boolean | null;
export type JSONObjectT = { [key: string]: JSONValueT };
export type JSONArrayT = JSONValueT[];
export type JSONValueT = JSONPrimitiveT | JSONObjectT | JSONArrayT;

export type InstanceIdT = string;

export type IntegerT = number;
export type NameT = string;
export type HtmlT = string;
export type TimestampStrT = string;

export type SpecIdT = {
    name: NameT,
    version: IntegerT,
};


export type AdminDataT = {
    startTimestampT: TimestampStrT,
    stopTimestampT?: TimestampStrT,
};
