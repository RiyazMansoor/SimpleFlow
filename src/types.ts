

// The basic types used in the application

export type EntityIdT = string;
export type EntityTypeT = string;
export type UserIdT = string;

export type InstanceIdT = string;
export type NameT = string;
export type HtmlT = string;
export type TimestampT = string;


export type IntegerT = number;
export type DecimalT = number;
export type LabelT = string;
export type DescriptionT = string;
// export type HtmlT = string;
// export type TNumeric = string;
// export type TAlphatic = string;
// export type TAlphaNumeric = string;
export type PasswordT = string;
export type EmailT = string;
// export type TPhone = string;
// export type TNIN = string;
// export type TDate = string;
// export type TTime = string;
// export type TPostcode = string;
export type ExpressionT = string;

////// json data

export type JSONPrimitiveT = string | number | boolean | null;
export type JSONObjectT = { [key: string]: JSONValueT };
export type JSONArrayT = JSONValueT[];
export type JSONValueT = JSONPrimitiveT | JSONObjectT | JSONArrayT;

