/**
 * Defines common data types used throughout the application.
 * These types provide a consistent structure for data, ensuring type safety and clarity.
 * @author Riyaz Mansoor <riyaz.mansoor@gmail.com>
 * @version 1.0
 */

/**
 * Represents the primitive JSON data types: string, number, or boolean.
 * These are the basic building blocks of JSON data.
 */
export type JSONPrimitiveT = string | number | boolean;

/**
 * Represents a JSON object, which is a collection of key-value pairs.
 * The keys are strings, and the values can be any valid JSON value.
 */
export type JSONObjectT = { [key: string]: JSONValueT };

/**
 * Represents a JSON array, which is an ordered list of JSON values.
 */
export type JSONArrayT = JSONValueT[];

/**
 * Represents any valid JSON value.
 * This can be a primitive, an object, or an array.
 */
export type JSONValueT = JSONPrimitiveT | JSONObjectT | JSONArrayT;

/**
 * Represents a unique identifier for an instance, typically a string.
 */
export type InstanceIdT = string;

/**
 * Represents an integer value.
 * While TypeScript's `number` type includes both integers and floating-point numbers,
 * this type alias is used to indicate that the value should be an integer.
 */
export type IntegerT = number;

/**
 * Represents a name, typically a string.
 * This is used for identifiers, labels, and other named entities.
 */
export type NameT = string;

/**
 * Represents an HTML string.
 * This type is used to indicate that the string contains HTML content.
 */
export type HtmlT = string;

/**
 * Represents a timestamp as a string.
 * This is typically in a standardized format like ISO 8601.
 */
export type TimestampStrT = string;

/**
 * Represents an expression as a string.
 * This could be a mathematical formula, a logical condition, or a scripting expression.
 */
export type ExpressionT = string;

/**
 * Represents the unique identifier for a specification.
 * This includes the name, version, and an active status.
 */
export type SpecIdT = {
    /** The name of the specification. */
    specName: NameT,
    /** The version of the specification. */
    specVersion: IntegerT,
    /** A boolean indicating whether the specification is currently active. */
    specActive: boolean,
};

/**
 * Represents administrative data associated with an object.
 * This includes start and optional stop timestamps.
 */
export type AdminDataT = {
    /** The timestamp when the object was created or started. */
    startTimestampT: TimestampStrT,
    /** An optional timestamp indicating when the object was stopped or archived. */
    stopTimestampT?: TimestampStrT,
};
