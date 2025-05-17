
import { OceanFlow as t } from "./types";

export namespace OceanFlow {


    export function validateData(dataConfigT: t.DataConfigT, dataItemT: t.DataInstanceT): t.AuditCauseT[] {
        const auditCauses: t.AuditCauseT[] = [];
        // if no validation
        const validations: t.ValidationT | undefined = dataConfigT.validations;
        if (!validations) return auditCauses;
        // the standard payload for validation issues
        const payload: t.JSONObjectT = {
            [t.DataConfigPK]: dataConfigT[t.DataConfigPK],
            dataTypeE: dataConfigT.dataTypeE,
        };
        // data value must exist
        const dataValue = dataItemT.dataValue;
        const required = validations.required ?? false;
        if (!required && !dataValue) {
            return auditCauses;
        };
        if (required && !dataValue) {
            const cause: t.AuditCauseT = {
                descriptionT: `required field`,
                payloadT: payload,
            };
            auditCauses.push(cause);
            return auditCauses;
        };
        // at this point there is dataValue
        const pattern = validations.pattern;
        if (pattern) {
            if (!dataValue.toString().match(pattern)) {
                const cause: t.AuditCauseT = {
                    descriptionT: `pattern [${pattern}] match failed value [${dataValue}]`,
                    payloadT: payload,
                };
                auditCauses.push(cause);
            };
        };
        //     valRange?: { min?: TDecimal, max?: TDecimal },
        const valRange = validations.valRange;
        if (valRange) {
            const min = Number(valRange.min);
            if (!isNaN(min) && min > Number(dataValue)) {
                const cause: t.AuditCauseT = {
                    descriptionT: `min value [${min}] > actual [${dataValue}]`,
                    payloadT: payload,
                };
                auditCauses.push(cause);
            };
            const max = Number(valRange.max);
            if (!isNaN(max) && max <= Number(dataValue)) {
                const cause: t.AuditCauseT = {
                    descriptionT: `max value [${max}] <= actual [${dataValue}]`,
                    payloadT: payload,
                };
                auditCauses.push(cause);
            };
        };
        //     lenRange?: { min?: TInteger, max?: TInteger },
        const lenRange = validations.lenRange;
        if (lenRange) {
            const len = dataValue?.toString().length ?? 0;
            const min = Number(lenRange.min);
            if (!isNaN(min) && min > len) {
                const cause: t.AuditCauseT = {
                    descriptionT: `min length [${min}] > actual [${len}]`,
                    payloadT: payload,
                };
                auditCauses.push(cause);
            };
            const max = Number(lenRange.max);
            if (!isNaN(max) && max <= len) {
                const cause: t.AuditCauseT = {
                    descriptionT: `max length [${max}] <= actual [${len}]`,
                    payloadT: payload,
                };
                auditCauses.push(cause);
            };
        };
        // TODO
        // dateRange?: { min?: t.TInteger, max?: t.TInteger },     // days relative to TODAY()
        // timeRange?: { min?: t.TInteger, max?: t.TInteger },     // in minutes
        return auditCauses;
    }

    

    function validateRegex(value: string, pattern: string): t.AuditCauseT[] | undefined {
        const auditCauses: t.AuditCauseT[] = [];
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
            auditCauses.push(`Value '${value}' does NOT match pattern ${pattern}.`);
        }
        return auditCauses;
    }

    function validatePattern(value: string, vscheme: TValidationScheme): TValidationError[] {
        return validateRegex(value, vscheme.pattern as string);
    }

    export const RegexEmail = "[\\w.+-]+@[\\w.-]+\\.[\\w]{2,4}";
    export const RegexInteger = "[-+]?\\d+";
    export const RegexDecimal = "[-+]?\\d+(\\.\\d+)?";
    export const RegexAlphaNumeric = "\\w+";
    export const RegexIdentity = "A[\\d]{6}";
    export const RegexPhone = "[\\d]{3}[ -]?[\\d]{4}";

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



}
