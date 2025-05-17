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

