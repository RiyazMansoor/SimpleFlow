
import * as t from "./types";
import * as u from "./utils";
import { EDataType, TDataInstance, TFlowConfig } from "./flows";
import { TCredential } from "./access";
import { OAuditReport, TAuditCause } from "./audit";
import { ViewConfigs } from "./view";


export type TValidation = {
    required?: boolean,
    pattern?: string,
    valRange?: { min?: t.TDecimal, max?: t.TDecimal },
    lenRange?: { min?: t.TInteger, max?: t.TInteger },
    dateRange?: { min?: t.TInteger, max?: t.TInteger },     // days relative to TODAY()
    timeRange?: { min?: t.TInteger, max?: t.TInteger },     // in minutes
}

export type TDataConfig = {
    name: t.TName,
    type: EDataType,
    validations?: TValidation,
}


export class DataConfigs {


    static configs: DataConfigs = new DataConfigs();

    private cache: Map<t.TName, TDataConfig[]> = new Map();

    private constructor() {
        // empty private constructor - this is a singleton class
    }

    static getInstance(): DataConfigs {
        return DataConfigs.configs;
    }

    clearCache(): void {
        this.cache.clear();
    }

    parse(flowConfig: TFlowConfig): void {
        const flowName: t.TName = flowConfig.name;
        for (const viewConfigs of flowConfig.viewConfigs) {
            const dataNames: t.TName[] = [];
            dataNames.push(...(viewConfigs.component?.datumNames ?? []));
            dataNames.push(...(viewConfigs.custom?.datumName ?? []));
            for (const form of viewConfigs.forms) {
                const key = u.Key(flowName, form.name);
                let dataConfigs = this.cache.get(key);
                if (!dataConfigs) {
                    dataConfigs = [];
                    this.cache.set(key, dataConfigs);
                };
                dataNames.forEach(dataName => {
                    // should never be undefined
                    const dataConfig = flowConfig.dataConfigs.find(dataConfig => dataConfig.name == dataName);
                    dataConfigs.push(dataConfig as TDataConfig);
                });
            };
        };

    }

    allConfigs(flowName: t.TName, formName: t.TName): TDataConfig[] {
        return this.cache.get(u.Key(flowName, formName)) as TDataConfig[];
    }

    validateForm(flowName: t.TName, formName: t.TName, instances: TDataInstance[]): TAuditCause[] {
        const editableFieldNames = ViewConfigs.getInstance().editableFieldNames(flowName, formName);
        const dataConfigs = this.allConfigs(flowName, formName)
            .filter(config => config.validations)
            .filter(config => editableFieldNames.includes(config.name));
        const causes: TAuditCause[] = [];
        dataConfigs.forEach(dataConfig => causes.push(...validateData(dataConfig, instances)));
        return causes;
    }

}



// export type TValidationSpec = {
function validateData(dataConfig: TDataConfig, instances: TDataInstance[]): TAuditCause[] {
    const violations: TAuditCause[] = [];
    const validations: TValidation = dataConfig.validations!;
    const payload = {
        dataName: dataConfig.name,
        dataType: dataConfig.type,
    };
    // data value must exist
    const dataValue = instances.find(instance => instance.name = dataConfig.name)?.value;
    if (!dataValue) {
        const cause: TAuditCause = {
            description: `expected data value [${dataConfig.name}] missing`,
            payload: payload,
        };
        violations.push(cause);
        return violations;
    };
    //     required?: boolean,
    const required = validations.required ?? false;
    if (required) {
        if (!dataValue) {
            const cause: TAuditCause = {
                description: `required field`,
                payload: payload,
            };
            violations.push(cause);
            return violations;
        }
    }
    //     pattern?: string,
    const pattern = validations.pattern;
    if (pattern) {
        if (!dataValue.toString().match(pattern)) {
            violations.push({
                description: `pattern [${pattern}] match failed`,
                payload: payload,
            });
        }
    }
    //     valRange?: { min?: TDecimal, max?: TDecimal },
    const valRange = validations.valRange;
    if (valRange) {
        const min = Number(valRange.min);
        if (!isNaN(min) && min > Number(dataValue)) {
            violations.push({
                description: `min value [${min}] > actual [${dataValue}]`,
                payload: payload,
            });
        }
        const max = Number(valRange.max);
        if (!isNaN(max) && max <= Number(dataValue)) {
            violations.push({
                description: `max value [${max}] <= actual [${dataValue}]`,
                payload: payload,
            });
        }
    }
    //     lenRange?: { min?: TInteger, max?: TInteger },
    const lenRange = validations.lenRange;
    if (lenRange) {
        const len = dataValue?.toString().length ?? 0;
        const min = Number(lenRange.min);
        if (!isNaN(min) && min > len) {
            violations.push({
                description: `min length [${min}] > actual [${len}]`,
                payload: payload,
            });
        }
        const max = Number(lenRange.max);
        if (!isNaN(max) && max <= len) {
            violations.push({
                description: `max length [${max}] <= actual [${len}]`,
                payload: payload,
            });
        }
    }
    // TODO
    // dateRange?: { min?: t.TInteger, max?: t.TInteger },     // days relative to TODAY()
    // timeRange?: { min?: t.TInteger, max?: t.TInteger },     // in minutes
    return violations;
}

