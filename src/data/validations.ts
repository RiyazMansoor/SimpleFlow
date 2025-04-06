import { TDataTypes } from "./types";

export type TValidationError = string;

export type TValidationScheme = {
    required: boolean,
    pattern?: string,
    valRange?: { min?: number, max?: number },
    lenRange?: { min?: number, max?: number },
    relDateRange?: { min?: number, max?: number },
    timeRange?: { min?: number, max?: number }, // in minutes
}

function validate(value: string, dtype: TDataTypes, vscheme, TValidationScheme): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    value = value.trim();
    // if required but no value
    if (vscheme.required && !value.length) {
        validationErrors.push(`Value is required.`);
        return validationErrors;
    }
    // if not required and no value
    if (!value) return [];
    //
    function validationsMore() {
        for (const validationKey of Object.keys(vscheme)) {
            if (validationKey == "required") continue;
            switch (validationKey) {
                case "pattern":
                    validationErrors.push(...validatePattern(value, vscheme));
                    break;
                case "length":
                    validationErrors.push(...validateLength(value, vscheme));
                    break;
                case "bounds":
                    validationErrors.push(...validateBounds(value, vscheme));
                    break;
                case "date":
                    validationErrors.push(...validateDateRange(value, vscheme));
                    break;
            }
        }
    }
    // first check by data type
    switch (dtype) {
        case "integer":
            validationErrors.push(...validateInteger(value));
            validationsMore();
            break;
        case "decimal":
            validationErrors.push(...validateDecimal(value));
            validationsMore();
            break;
        case "email":
            validationErrors.push(...validateEmail(value));
            validationsMore();
            break;
        case "identity":
            validationErrors.push(...validateIdentity(value));
            validationsMore();
            break;
        case "phone":
            validationErrors.push(...validatePhone(value));
            validationsMore();
            break;
        case "alphanumeric":
            validationErrors.push(...validateAlphaNumeric(value));
            validationsMore();
            break;
        case "phone":
            validationErrors.push(...validatePhone(value));
            validationsMore();
            break;
        default:
            validationsMore();
    }
    return validationErrors;
}

function validateRegex(value: string, pattern: string): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
        validationErrors.push(`Value '${value}' does NOT match pattern ${pattern}.`);
    }
    return validationErrors;
}

function validatePattern(value: string, vscheme: TValidationScheme): TValidationError[] {
    return validateRegex(value, vscheme.pattern as string);
}

function validateEmail(value: string): TValidationError[] {
    return validateRegex(value, "[\\w.+-]+@[\\w.-]+\\.[\\w]{2,4}");
}

function validateInteger(value: string): TValidationError[] {
    return validateRegex(value, "[-+]?\\d+");
}

function validateDecimal(value: string): TValidationError[] {
    return validateRegex(value, "[-+]?\\d+(\\.\\d+)?");
}

function validateAlphaNumeric(value: string): TValidationError[] {
    return validateRegex(value, "\\w+");
}

function validateIdentity(value: string): TValidationError[] {
    return validateRegex(value, "A[\\d]{6}");
}

function validatePhone(value: string): TValidationError[] {
    return validateRegex(value, "[\\d]{3}[ -]?[\\d]{4}");
}

function validateDate(value: string): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    const somedate = new Date(value);
    if (!isNaN(somedate)) {
        validationErrors.push(`Value '${value}' is not a valid date.`);
    }
    return validationErrors;
}

function validateLength(value: string, vscheme: TValidationScheme): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    const MIN = vscheme.lenRange?.min ?? NaN;
    const MAX = vscheme.lenRange?.max ?? NaN;
    if (!isNaN(MIN) && value.length < MIN) {
        validationErrors.push(`Length of '${value}' must be >= ${MIN}.`);
    }
    if (!isNaN(MAX) && value.length < MAX) {
        validationErrors.push(`Length of '${value}' must be < ${MAX}.`);
    }
    return validationErrors;
}

function validateBounds(value: string, vscheme: TValidationScheme): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    const MIN = vscheme.valRange?.min ?? NaN;
    const MAX = vscheme.valRange?.max ?? NaN;
    validationErrors.push(...validateDecimal(value));
    if (validationErrors.length) {
        const numValue = parseFloat(value);
        if (!isNaN(MIN) && numValue < MIN) {
            validationErrors.push(`Lower bound of '${value}' must be >= ${MIN}.`);
        }
        if (!isNaN(MAX) && numValue < MAX) {
            validationErrors.push(`Upper bound of '${value}' must be < ${MAX}.`);
        }
    }
    return validationErrors;
}


function validateDateRange(value: string, vscheme: TValidationScheme): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (vscheme.relDateRange?.min) {
        validationErrors.push(...validateDate(value));
        if (validationErrors) {
            const MIN = new Date(today);
            MIN.setDate(MIN.getDate() + vscheme.relDateRange?.min);
            if (new Date(value) < MIN) {
                validationErrors.push(`Lower bound of '${value}' must be >= ${MIN}.`);
            }
        }
    }
    if (vscheme.relDateRange?.max) {
        validationErrors.push(...validateDate(value));
        if (validationErrors) {
            const MAX = new Date(today);
            MAX.setDate(MAX.getDate() + vscheme.relDateRange?.max);
            if (new Date(value) < MAX) {
                validationErrors.push(`Upper bound of '${value}' must be < ${MAX}.`);
            }
        }
    }
    return validationErrors;
}

function validateTimeRange(value: Date, vscheme: TValidationScheme): TValidationError[] {
    const validationErrors: TValidationError[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (vscheme.timeRange?.min) {
        const MIN = vscheme.timeRange?.min;
        if ((value.getHours() * 60 + value.getMinutes()) < MIN) {
            validationErrors.push(`Lower bound of '${value}' must be >= ${MIN}.`);
        }
    }
    if (vscheme.timeRange?.max) {
        const MAX = vscheme.timeRange?.max;
        if ((value.getHours() * 60 + value.getMinutes()) < MAX) {
            validationErrors.push(`Upper bound of '${value}' must be < ${MAX}.`);
        }
    }
    return validationErrors;
}


/*

import { StrNum, DataMap, DataValidationMap, DataValidator, DataValidatorMap } from "./../Types" ;

function validate( dataMap: DataMap, validations: DataValidationMap, validators: DataValidatorMap = new Map() ) {
    const result: Map<string, string[]> = new Map() ;
    const cValidators : Map<string, function> = coreValidators() ;
    const paramKeys: string[] = validations.keys() ;
    for ( let pi = 0 ; pi < paramKeys.length ; pi++ ) {
        const param: string = paramKeys[pi] ;
        const paramValidations = validations.get( param ) ;
        const errors: string[] = [] ;
        for ( let vi = 0 ; vi < paramValidations.length ; vi++ ) {
            const validation: string = paramValidations[vi][0].toLowerCase() ;
            const arg1: StrNum = paramValidations[vi][1] ;
            const arg2: StrNum = paramValidations[vi][2] ;
            const validator = validators.get( validation ) || cValidators.get( validation ) ;
            if ( !validator ) {
                errors.push( `No validator specified for param ${param}` ) ;
                continue ;
            }
            const validationErrors: string[] = validator.call( null, dataMap, param, arg1, arg2 ) ;
            errors.push( ...validationErrors ) ;
        }
        if ( errors.length > 0 ) result.set( param, errors ) ;
    }
    return result ;
}

function coreValidators() : DataValidatorMap {
    const validators: DataValidatorMap = new Map() ;
    validators.set( "pattern", validatePattern ) ;
    validators.set( "email", validateEmail ) ;
    validators.set( "numeric", validateNumeric ) ;
    validators.set( "alphanumeric", validateAlphaNumeric ) ;
    validators.set( "stringlength", validateStringLength ) ;
    validators.set( "numberrange", validateNumberRange ) ;
    validators.set( "daterange", validateDateRange ) ;
    // validators.set( "timerange", validateTimeRange ) ;
    return validators ;
}

/**
 * Abstract class to validate parameters.
 * Contains a single <code>validate</code> method.
 * /
abstract class ParamValidator {
    
    /**
     * 
     * @param dataMap Map of parameter name and its value.
     * @param param Name of parameter.
     * @param args Any other arguments to pass into validation method.
     * /
    abstract validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) ;

}

class PatternValidator extends ParamValidator {

    private Pattern: string ;

    constructor( pattern: string ) {
        this.Pattern = pattern ;
    }

    validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) {
        const value = dataMap.get( param ) ;
        const regex = new RegExp( this.Pattern ) ;
        if ( !regex.test( value ) ) {
            throw `Parameter '${param}' with value '${value}' does NOT match pattern ${this.Pattern}.` ;
        }
    }

}

class EmailValidator extends PatternValidator {

    constructor() {
        super( "[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,4}" ) ;
    }

}

class NumericValidator extends PatternValidator {

    constructor() {
        super( "[0-9]+" ) ;
    }

}

class AlphaNumericValidator extends PatternValidator {

    constructor() {
        super( "[A-Za-z0-9]+" ) ;
    }

}

class RequiredValidator extends ParamValidator {

    validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) {
        const value = dataMap.get( param ) ;
        if ( !value ) {
            throw `Parameter '${param}' with value '${value}' is required.` ;
        }
    }

}

/**
 * Validates string length if it exists.
 * For existance call the RequiredValidator
 * /
class StringLengthValidator extends ParamValidator {

    /**
     * call method eg: validate( dataMap: Map<string, any>, param: string, minlen: number, maxlen: number ) 
     * @param minlen optional minimum length of string.
     * @param maxlen optional maximum length of string.
     * /
    validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) {
        const str = dataMap.get( param ) ;
        const minlen: number = ( args && args.length > 0 ? args[0] : undefined ) ;
        const maxlen: number = ( args && args.length > 1 ? args[1] : undefined ) ;
        if ( str && minlen && str.length < minlen ) {
            throw `String parameter '${param}' with value '${str}' minimum length ${minlen} - FAILED.` ;
        }
        if ( str && maxlen && str.length > maxlen ) {
            throw `String parameter '${param}' with value '${str}' maximum length ${maxlen} - FAILED.` ;
        }
    }
    
}

class DateRangeValidator extends ParamValidator {

    /**
     * call method eg: validate( dataMap: Map<string, StrNum>, param: string, before: number, after: number )
     * @param before validate date is before (today+before) 
     * @param after validate date is after (today+after)
     * /
    validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) {
        if ( args.length === 0 ) {
            throw `DateRangeValidator :: missing rest arguments.` ;
        }
        const today = (new Date()).setHours( 0, 0, 0, 0 ) ;
        const date : number = dataMap.get( param ) ;
        const daysBefore: number = args[0] ; // required
        const beforeDate: number = today + daysBefore*1000*3600*24 ;
        const daysAfter: number = ( args && args.length > 1 ? args[1] : undefined ) ;
        const afterDate: number =  today + daysAfter*1000*3600*24 ;
        if ( date && daysBefore && date > beforeDate ) {
            throw `Date parameter '${param}' with value '${new Date( date ) }' before ${daysBefore} (${new Date( beforeDate )}) - FAILED.` ;
        }
        if ( date && daysAfter && date < afterDate  ) {
            throw `Date parameter '${param}' with value '${new Date( date ) }' after ${daysAfter} (${new Date( afterDate )}) - FAILED.` ;
        }
    }
    
}

class TimeRangeValidator extends ParamValidator {

    /**
     * call method eg: validate( dataMap: Map<string, StrNum>, param: string, before: number, after: number )
     * @param before validate date is before (today+before) 
     * @param after validate date is after (today+after)
     * /
    validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) {
        if ( args.length === 0 ) {
            throw `TimeRangeValidator :: missing rest arguments.` ;
        }
        const time : number = dataMap.get( param ) % ( 1000*3600*24 ) ;
        let before: number, after: number ;
        const hoursBefore: number = ( args && args.length > 0 ? args[0] : undefined ) ;
        if ( hoursBefore ) {
            const minutesBefore: number = ( args && args.length > 1 ? args[1] : 0 ) ;
            before = 1000*60*minutesBefore + 1000*60*60*hoursBefore ;
        }
        const hoursAfter: number = ( args && args.length > 2 ? args[2] : undefined ) ;
        if ( hoursAfter ) {
            const minutesAfter: number = ( args && args.length > 0 ? args[0] : 0 ) ;
            after = 1000*60*minutesAfter + 1000*60*60*hoursAfter ;
        }
        if ( time && before != undefined && time > before ) {
            throw `Time parameter '${param}' with value '${new Date( time ) }' NOT before (${new Date( before )}) - FAILED.` ;
        }
        if ( time && after && time < after  ) {
            throw `Date parameter '${param}' with value '${new Date( time ) }' NOT after (${new Date( after )}) - FAILED.` ;
        }
    }
    
}

class NumberRangeValidator extends ParamValidator {

    /**
     * call method eg: validate( dataMap: Map<string, StrNum>, param: string, min: number, max: number )
     * @param min validate date is before (today+before) 
     * @param max validate date is after (today+after)
     * /
    validate( dataMap: Map<string, StrNum>, param: string, ...args: StrNum[] ) {
        if ( args.length === 0 ) {
            throw `NumberRangeValidator :: missing rest arguments.` ;
        }
        const num : number = dataMap.get( param ) ;
        const min: number = ( args && args.length > 0 ? args[0] : undefined ) ;
        const max: number = ( args && args.length > 1 ? args[1] : undefined ) ;
        if ( num && min != undefined && num < min ) {
            throw `Number parameter '${param}' with value '${num}' NOT >= ${min} - FAILED.` ;
        }
        if ( num && max != undefined && num > max ) {
            throw `Number parameter '${param}' with value '${num}' NOT <= ${max} - FAILED.` ;
        }
    }
    
}

// types
export { StrNum } ;
// abstract classes
export { ParamValidator } ;
//  classes that validate string patterns
export { PatternValidator, EmailValidator, NumericValidator, AlphaNumericValidator } ;
// classes that do general validation
export { RequiredValidator, StringLengthValidator, NumberRangeValidator, DateRangeValidator, Time } ;
*/