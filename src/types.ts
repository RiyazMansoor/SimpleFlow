

// This file contains the type definitions for the application
// and the data structures used in the application.


import { TCredential } from "./access";
import { TFlowInstance } from "./flows";


// The basic types used in the application
export type TInteger = number;
export type TDecimal = number;
export type TLabel = string;
export type TName = string;
export type TDescription = string;
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


////// json data

export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

// export type TJsonValue = string | number | boolean | TJsonValue[];

// export type TJsonData = {
//     [key: string]: TJsonValue | TJsonData,
// }


// a generic type to pick only certain properties as requried properties
// type Sample = AtLeast<T, 'model' | 'rel'>
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>








export type TStaffContext = {
}



