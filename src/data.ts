
import { OceanFlow as t } from "./types";
import { OceanFlow as c } from "./core";

export namespace OceanFlow {

    export class DataConfig extends c.Base<t.NameT, t.DataConfigT>  {

        constructor(dataConfigT: t.DataConfigT) {
            super("dataNameT", dataConfigT);
        }

        getDataType(): t.DataTypeE {
            return this.dataT.dataType;
        }

        validate(dataItemT: t.DataItemT): t.AuditCauseT[] {
            const causes: t.AuditCauseT[] = [];
            if (!this.dataT.validations) {
                return causes;
            }
            // validate
            return causes;
        }

    }


    export function validateData(dataConfigT: t.DataConfigT, dataItemsT: t.DataItemT[]): t.AuditCauseT[] {
        const violations: t.AuditCauseT[] = [];
        const validations: t.ValidationT | undefined = dataConfigT.validations;
        if (!validations) return violations;
        const payload: t.JSONObjectT = {
            dataName: dataConfigT.dataName,
            dataType: dataConfigT.dataType,
        };
        // data value must exist
        const dataValue = dataItemsT.find(instance => instance.name = dataConfigT.name)?.value;
        if (!dataValue) {
            const cause: t.AuditCauseT = {
                descriptionT: `expected data value [${dataConfigT.name}] missing`,
                payloadT: payload,
            };
            violations.push(cause);
            return violations;
        };
        //     required?: boolean,
        const required = validations.required ?? false;
        if (required) {
            if (!dataValue) {
                const cause: t.AuditCauseT = {
                    descriptionT: `required field`,
                    payloadT: payload,
                };
                violations.push(cause);
                return violations;
            };
        };
        //     pattern?: string,
        const pattern = validations.pattern;
        if (pattern) {
            if (!dataValue.toString().match(pattern)) {
                const cause: t.AuditCauseT = {
                    descriptionT: `pattern [${pattern}] match failed`,
                    payloadT: payload,
                };
                violations.push(cause);
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
                violations.push(cause);
            };
            const max = Number(valRange.max);
            if (!isNaN(max) && max <= Number(dataValue)) {
                const cause: t.AuditCauseT = {
                    descriptionT: `max value [${max}] <= actual [${dataValue}]`,
                    payloadT: payload,
                };
                violations.push(cause);
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
                violations.push(cause);
            };
            const max = Number(lenRange.max);
            if (!isNaN(max) && max <= len) {
                const cause: t.AuditCauseT = {
                    descriptionT: `max length [${max}] <= actual [${len}]`,
                    payloadT: payload,
                };
                violations.push(cause);
            };
        };
        // TODO
        // dateRange?: { min?: t.TInteger, max?: t.TInteger },     // days relative to TODAY()
        // timeRange?: { min?: t.TInteger, max?: t.TInteger },     // in minutes
        return violations;
    }

}
