
import { TFlowConfig } from "./flows";
import * as t from "./types";
import * as u from "./utils";

export enum EWidgetType {
    EMAIL,
    TEXT,
    TEXTAREA,
    DROPDOWN,
    LISTBOX,
    RADIOBUTTONS,
    CHECKBOXES
}

export enum EWidgetWidth {
    FULL,
    HALF,
    THIRD,
    TWOTHIRD,
    FOURTH,
    THREEFOURTH,
    REST,
}

export enum EWidgetAccess {
    ENABLED,
    DISABLED,
    HIDDEN,
}


// every datum is rendered if it is contained the requested form to the render level
export type TViewConfig = {
    forms: {
        name: t.TName,
        access: EWidgetAccess,
    }[],
    // pre built component with multiple widgets that can map multiple fields
    component?: {
        renderGroup: t.TName,
        componentName: t.TName,
        datumNames: t.TName[],
    },
    // a single widget for a dingle field
    custom?: {
        renderGroup: t.TName,
        datumName: t.TName,
        defValue?: string,
        label: t.TName,
        widget: EWidgetType,
        width: EWidgetWidth,
        //        list?: KeyValue[],
    },
}



export class ViewConfigs {


    private static configs: ViewConfigs = new ViewConfigs();

    // cached forms; formName => fieldDefinition[]
    private cacheForms: Map<t.TName, TViewConfig[]> = new Map();
    // cached editable field names; formName => fieldName[]
    private cacheFields: Map<t.TName, t.TName[]> = new Map();

    private constructor() {
        // empty private constructor - this is a singleton class
    }

    static getInstance(): ViewConfigs {
        return ViewConfigs.configs;
    }

    clearCache(): void {
        this.cacheForms.clear();
        this.cacheFields.clear();
    }

    parse(flowConfig: TFlowConfig): void {
        const flowName = flowConfig.name;
        const viewConfigs = flowConfig.viewConfigs;
        for (const viewConfig of viewConfigs) {
            for (const form of viewConfig.forms) {
                const key = u.Key(flowName, form.name);
                let cachedForm = this.cacheForms.get(key);
                if (!cachedForm) {
                    cachedForm = [];
                    this.cacheForms.set(key, cachedForm);
                }
                cachedForm.push(viewConfig);
                // only editable fields for field validation and data update
                if (form.access == EWidgetAccess.ENABLED) {
                    let cachedFields = this.cacheFields.get(key);
                    if (!cachedFields) {
                        cachedFields = [];
                        this.cacheFields.set(key, cachedFields);
                    }
                    if (viewConfig.component) {
                        cachedFields.push(...viewConfig.component.datumNames);
                    }
                    if (viewConfig.custom) {
                        cachedFields.push(viewConfig.custom.datumName);
                    }
                }
            }
        }
    }

    allConfigs(flowName: t.TName, formName: t.TName): TViewConfig[] {
        const key = u.Key(flowName, formName);
        // TODO null return?
        return this.cacheForms.get(key) as TViewConfig[];
    }

    editableFieldNames(flowName: t.TName, formName: t.TName): t.TName[] {
        const key = u.Key(flowName, formName);
        // TODO null return?
        return this.cacheFields.get(key) as t.TName[];
    }

}

