import * as t from "./types";
import * as u from "./utils";
import { TCredential } from "./access";
import { OBaseInstance, TResponse } from "./base";
import { DataConfigs, TDataConfig } from "./data";
import { ViewConfigs, TViewConfig } from "./view";
import { TTaskConfig, TTaskInstance } from "./task";
import { dbLoadFlowInstance, dbSaveFlowInstance, dbSaveFlowSpecification } from "./store";
import { MissingFlow, MissingRole, OAuditReport } from "./audit";



export enum EDataType {
    INTEGER,
    DECIMAL,
    DATE,
    TIME,
    TIMESTAMP,
    EMAIL,
    MALDIVIAN_PHONE,
    MALDIVIAN_ID,
    NUMERIC,
    ALPHABETIC,
    ALPHANUMERIC,
    PASSWORD,
}

export enum EFlowStatus {
    OPEN,
    CLOSED,
    ABORTED,
}


export type TFlowConfig = {
    name: t.TName,
    roles: t.TName[],
    formName: t.TName,                  // kick start data input as contained in form
    dataConfigs: TDataConfig[],         // every data item has its own config
    viewConfigs: TViewConfig[],         // every data item has its won view/rendering
    taskConfigs: TTaskConfig[],         // user input tasks 
}

export type TDataInstance = {
    name: t.TName,
    value: string | number | boolean,
}

export type TLogItem = {
    timestamp: t.TTimestamp,
    description: t.TDescription,
    credential: TCredential,
    taskInstanceId?: t.TInstanceId,
    taskData?: TDataInstance[],
}

export type TFlowInstance = {
    name: t.TName,
    instanceId: t.TInstanceId,
    timestamps: {
        created: t.TTimestamp,
        closed?: t.TTimestamp,
        aborted?: t.TTimestamp,
    }
    logItems: TLogItem[],
    dataInstances: TDataInstance[],
    status: EFlowStatus,
}



/**
 * Singleton class that stores all the flow configs.
 */
export class FlowConfigs {

    private static configs: FlowConfigs = new FlowConfigs();

    private flowConfigs: Map<t.TName, TFlowConfig> = new Map();

    private viewConfigs: ViewConfigs = ViewConfigs.getInstance();
    private dataConfigs: DataConfigs = DataConfigs.getInstance();

    private constructor() {
        // empty private constructor - this is a singleton class
    }

    static getInstance(): FlowConfigs {
        return FlowConfigs.configs;
    }

    clearCache(): void {
        this.flowConfigs.clear();
    }

    parse(flowConfig: TFlowConfig): void {
        this.viewConfigs.parse(flowConfig);
    }


    fetchFlow(credential: TCredential, flowName: t.TName): TResponse {
        const flowConfig = this.flowConfigs.get(flowName);
        const response: TResponse = {};
        // check for valid flow
        if (!flowConfig) {
            const payload: t.JSONObject = {
                flowName: flowName,
            };
            response.error = MissingFlow(credential, payload);
            return response;
        };
        // check for valid role
        if (u.ArrayIntersection(flowConfig.roles, credential.roleNames).length == 0) {
            const payload: t.JSONObject = {
                flowName: flowName,
                userName: credential.userName,
                haveRoles: credential.roleNames,
                needRoles: flowConfig.roles,
            };
            response.error = MissingRole(credential, payload);
            return response;
        };
        // prepare response
        const viewConfigs = ViewConfigs.getInstance().allConfigs(flowName, flowConfig.formName);
        const dataConfigs = DataConfigs.getInstance().allConfigs(flowName, flowConfig.formName);
        response.data = {
            viewConfigs: viewConfigs,
            dataConfigs: dataConfigs,
            dataInstances: []
        };
        return response;
    }

    startFlow(credential: TCredential, flowName: t.TName, dataInstances: TDataInstance[]): TResponse {
        const flowConfig = this.flowConfigs.get(flowName);
        const response: TResponse = {};
        // check for valid flow
        if (!flowConfig) {
            const payload: t.JSONObject = {
                flowName: flowName,
            };
            response.error = MissingFlow(credential, payload);
            return response;
        };
        // check for valid role
        if (u.ArrayIntersection(flowConfig.roles, credential.roleNames).length == 0) {
            const payload: t.JSONObject = {
                flowName: flowName,
                userName: credential.userName,
                haveRoles: credential.roleNames,
                needRoles: flowConfig.roles,
            };
            response.error = MissingRole(credential, payload);
            throw response;
        };
        // reduce the supplied data to editable fields only
        const editableFieldNames = ViewConfigs.getInstance().editableFieldNames(flowName, flowConfig.name);
        dataInstances = dataInstances.filter(dataInstance => editableFieldNames.includes(dataInstance.name));
        // validate relevant data and throw if validation errors
        const causes = DataConfigs.getInstance().validateForm(flowName, flowConfig.name, dataInstances);
        if (!causes.length) {
            const auditReport: OAuditReport = new OAuditReport({ "credential": credential });
            causes.forEach(cause => auditReport.addCause(cause));
            // auditReport.save();
            response.error = causes;
            return response;
        }
        // submission is valid
        const flowInstance: OFlowInstance = new OFlowInstance({ "name": flowName });
        flowInstance.log(credential, "flow created");
        flowInstance.update(dataInstances);
        flowInstance.save();
        return response;
    }

}


export class OFlowInstance extends OBaseInstance<t.TInstanceId, TFlowInstance> {


    constructor(flowInstance: t.AtLeast<TFlowInstance, "name">) {
        const data: TFlowInstance = {
            name: flowInstance.name,
            instanceId: flowInstance.instanceId ?? u.RandomStr(),
            logItems: flowInstance.logItems ?? [],
            dataInstances: flowInstance.dataInstances ?? [],
            status: flowInstance.status ?? EFlowStatus.OPEN,
            timestamps: {
                created: u.TimestampStr(),
            },
        };
        super("instanceId", dbSaveFlowInstance, data);
        this.freeze(this.isClosed());
    }

    public static getInstance(flowInstanceId: t.TInstanceId): OFlowInstance | undefined {
        return OBaseInstance.loadInstance(flowInstanceId, dbLoadFlowInstance, OFlowInstance);
    }

    isClosed(): boolean {
        return this.data.status != EFlowStatus.OPEN;
    }

    close(credential: TCredential): OFlowInstance {
        this.data.status = EFlowStatus.CLOSED;
        this.data.timestamps.closed = u.TimestampStr();
        this.freeze(this.isClosed());
        // TODO
        return this;
    }

    log(credential: TCredential, description: t.TDescription): TLogItem {
        const logItem: TLogItem = {
            timestamp: u.TimestampStr(),
            credential: credential,
            description: description,
        };
        this.data.logItems.push(logItem);
        return logItem;
    }

    update(dataInstances: TDataInstance[]): OFlowInstance {
        // iterate flowForm data fields and update from taskData
        for (const dataInstance of dataInstances) {
            const foundInstance = this.data.dataInstances.find(dI => dI.name == dataInstance.name);
            if (!foundInstance) {
                this.data.dataInstances.push(dataInstance);
            };
        };
        return this;
    }


}




