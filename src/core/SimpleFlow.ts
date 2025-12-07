
import { writeBatch } from "firebase/firestore";
import { User } from "firebase/auth";

import { DB } from "./Firebase.js";
import * as t from "./Types.js";
import * as e from "./Errors.js";
import { exprIsTrue } from "./Expressions.js";
import { currentUser, hasRole } from "./Auth.js";
import { getJsonValue, mergeJsonObjects, randomStr, setJsonValue, timestampStr } from "./Utils.js";
import { WfSpecCache, WsSpecCache, WfInstanceCache, WsInstanceCache } from "./Cache.js";



export function wfCreate(flowSpecIdT: t.SpecIdT, dataInput: t.JSONObjectT): e.SimpleflowError[] {
    // validations
    const wfSpecT: t.WfSpecT = validateWfSpec(flowSpecIdT);
    validateCanAccess(wfSpecT);
    validateSpecActive(wfSpecT);
    validateDataInput(wfSpecT, wfSpecT.inputDataNames, dataInput);
    const wsSpecs: t.SpecDefT[] = wfSpecT.nextSteps.map(specId => WsSpecCache.getSpec(specId));
    validateSpecActive(...wsSpecs);
    validateStepEntry(undefined, wfSpecT, dataInput, ...wsSpecs);
    // business logic
    {
        // create workflow
        const wfInstance: t.WfInstanceT = {
            instanceKey: randomStr(40),
            specName: flowSpecIdT.specName,
            specVersion: flowSpecIdT.specVersion,
            status: t.WfStatusE.RUNNABLE,
            data: dataInput,
            adminData: { startTimestampT: timestampStr() },
            stepsData: {},
            logItems: [],
        };
        // create next steps
        const wsNewInstanceKeys: t.InstanceDefT[] = doCreateNextSteps(wsSpecs, wfInstance);
        // batch write new workflow and new next steps
        if (wsNewInstanceKeys.length > 0) {
            const message = `workflow created with [${wsNewInstanceKeys.length}] new worksteps`;
            doProgressLog(wfInstance, message);
            const batch = writeBatch(DB);
            WfInstanceCache.dbBatchWrite(batch, wfInstance);
            wsNewInstanceKeys.forEach(wsInstance => WsInstanceCache.dbBatchWrite(batch, wsInstance));
            batch.commit();
            wsNewInstanceKeys.forEach(wsInstanceKey => WsInstanceCache.add(wsInstanceKey));
        } else {
            return [e.wfCreatedHasNoWorkSteps(flowSpecIdT, dataInput)];
        };
    };
    return [];
};

async function wsSystemExecute(wfInstance: t.WfInstanceT, wsInstances: t.InstanceDefT[]): Promise<void> {
    const wfSpec = WfSpecCache.getSpec(wfInstance);
    do {
        const wsSystemInstances: t.WsSystemInstanceT[] = wsInstances
            .filter(wsInstance => isWsSystemInstance(wsInstance))
            .map(wsInstance => wsInstance as t.WsSystemInstanceT);
        if (!wsSystemInstances.length) break;
        for (const wsSystemInstance of wsSystemInstances) {
            wsSystemInstance.attempts.push(timestampStr());
            const wsSystemSpec: t.WsSystemSpecT = WsSpecCache.getSpec(wsSystemInstance) as t.WsSystemSpecT;
            const success: boolean = wsSystemSpec.systemExec(wfInstance.data);
            const wsNewInstanceKeys: t.InstanceDefT[] = [];
            if (success) {
                wsSystemInstance.status = t.WsSystemStatusE.EXECUTE_SUCCESS;
                // create next steps
                const wsSpecDefs: t.SpecDefT[] = wsSystemSpec.nextSteps.map(specId => WsSpecCache.getSpec(specId));
                wsNewInstanceKeys.push(...doCreateNextSteps(wsSpecDefs, wfInstance));
            };
            const message = `System Workstep executed successfully [${success}] witn new [${wsNewInstanceKeys.length}] worksteps`;
            doProgressLog(wfInstance, message);
            const batch = writeBatch(DB);
            WfInstanceCache.dbBatchWrite(batch, wfInstance);
            WsInstanceCache.dbBatchWrite(batch, wsSystemInstance);
            wsNewInstanceKeys.forEach(wsInstanceKey => WsInstanceCache.dbBatchWrite(batch, wsInstanceKey));
            batch.commit();
            wsNewInstanceKeys.forEach(wsInstanceKey => WsInstanceCache.add(wsInstanceKey));
            wsInstances = wsNewInstanceKeys;
        };
    } while (true);
};

async function wsSelect(wsInstanceKey: t.InstanceKeyT): Promise<e.SimpleflowError[]> {
    // validations
    const wsInstanceKeyO: t.InstanceDefT = await WsInstanceCache.get(wsInstanceKey);
    const wsInputInstance = validateWsInputInstance(wsInstanceKeyO);
    const wsInputSpecT: t.WsInputSpecT = validateWsInputSpec(wsInputInstance);
    validateCanAccess(wsInputSpecT);
    const user: User = currentUser();
    validateCanSelect(wsInputInstance, user);
    // business
    {
        wsInputInstance.userActive = user.email;
        const wfInstance: t.WfInstanceT = await WfInstanceCache.get(wsInputInstance.flowInstanceKey);
        const message = `Workstep [${wsInputInstance.instanceKey}] of type [${wsInputInstance.specName}] selected by user [${user.email}]`;
        doProgressLog(wfInstance, message);
        const batch = writeBatch(DB);
        WfInstanceCache.dbBatchWrite(batch, wfInstance);
        WsInstanceCache.dbBatchWrite(batch, wsInputInstance);
        batch.commit();
    };
    return [];
};

async function wsReturn(wsInstanceKey: t.InstanceKeyT): Promise<e.SimpleflowError[]> {
    // validations
    const wsInstanceKeyO: t.InstanceDefT = await WsInstanceCache.get(wsInstanceKey);
    const wsInputInstance = validateWsInputInstance(wsInstanceKeyO);
    const wsInputSpecT: t.WsInputSpecT = validateWsInputSpec(wsInputInstance);
    validateCanAccess(wsInputSpecT);
    const user: User = currentUser();
    validateCanReturn(wsInputInstance, user);
    // business
    {
        wsInputInstance.userActive = "";
        const wfInstance: t.WfInstanceT = await WfInstanceCache.get(wsInputInstance.flowInstanceKey);
        const message = `Workstep [${wsInputInstance.instanceKey}] of type [${wsInputInstance.specName}] returned by user [${user.email}]`;
        doProgressLog(wfInstance, message);
        const batch = writeBatch(DB);
        WfInstanceCache.dbBatchWrite(batch, wfInstance);
        WsInstanceCache.dbBatchWrite(batch, wsInputInstance);
        batch.commit();
    };
    return [];
};


async function wsSubmit(wsInstanceKey: t.InstanceKeyT, dataInput: t.JSONObjectT): Promise<e.SimpleflowError[]> {
    // validations
    const wsInstanceKeyO: t.InstanceDefT = await WsInstanceCache.get(wsInstanceKey);
    const wsInputInstance: t.WsInputInstanceT = validateWsInputInstance(wsInstanceKeyO);
    const wsInputSpec: t.WsInputSpecT = validateWsInputSpec(wsInputInstance);
    validateCanAccess(wsInputSpec);
    const user: User = currentUser();
    validateCanSubmit(wsInputInstance, user); 
    const wfInstance: t.WfInstanceT = await WfInstanceCache.get(wsInputInstance.flowInstanceKey);
    const wfSpec = validateWfSpec(wfInstance);
    validateDataInput(wfSpec, wfSpec.inputDataNames, dataInput);
    const wsSpecs: t.SpecDefT[] = wsInputSpec.nextSteps.map(specId => WsSpecCache.getSpec(specId));
    validateSpecActive(...wsSpecs);
    validateStepEntry(wfInstance, wsInputSpec, dataInput, ...wsSpecs);
    // business
    {
        const wsInstances: t.InstanceDefT[] = doCreateNextSteps(wsSpecs, wfInstance);
        doMergeDataInput(wfInstance, wsInputSpec, dataInput);
        wsInputInstance.status = t.WsInputStatusE.READY;
        const message = `Workstep [${wsInputInstance.instanceKey}] submitted data by user [${user.email}] accepted.`;
        doProgressLog(wfInstance, message);
        const batch = writeBatch(DB);
        WfInstanceCache.dbBatchWrite(batch, wfInstance);
        WsInstanceCache.dbBatchWrite(batch, wsInputInstance);
        wsInstances.forEach(wsInstance => WsInstanceCache.dbBatchWrite(batch, wsInstance));
        batch.commit();
        wsInstances.forEach(wsInstanceKey => WsInstanceCache.add(wsInstanceKey));
    };
    return [];
};

function validateWfSpec(flowSpecIdT: t.SpecIdT): t.WfSpecT {
    const wfSpec: t.WfSpecT = WfSpecCache.getSpec(flowSpecIdT);
    if (!wfSpec) {
        throw [e.wfSpecNotFound(flowSpecIdT)];
    };
    return wfSpec;
};

function validateWsSpec(wsSpecIdT: t.SpecIdT): t.SpecDefT {
    const wsSpecDef: t.SpecDefT = WsSpecCache.getSpec(wsSpecIdT);
    if (!wsSpecDef) {
        throw [e.wsSpecNotFound(wsSpecIdT)];
    };
    return wsSpecDef;
};

function validateWsInputSpec(wsSpecIdT: t.SpecIdT): t.WsInputSpecT {
    const wsSpecDef: t.SpecDefT = validateWsSpec(wsSpecIdT);
    if (!isWsInputSpec(wsSpecDef)) {
        throw [e.expectedWsInputSpec(wsSpecDef)];
    };
    return wsSpecDef as t.WsInputSpecT;
};

function validateWsSystemSpec(wsSpecIdT: t.SpecIdT): t.WsSystemSpecT {
    const wsSpecDef: t.SpecDefT = validateWsSpec(wsSpecIdT);
    if (!isWsSystemSpec(wsSpecDef)) {
        throw [e.expectedWsSystemSpec(wsSpecDef)];
    };
    return wsSpecDef as t.WsSystemSpecT;
};

function validateWsInputInstance(wsInstanceKey: t.InstanceDefT): t.WsInputInstanceT {
    if (!isWsInputInstance(wsInstanceKey)) {
        throw [e.expectedWsInputInstanceKey(wsInstanceKey)];
    };
    return wsInstanceKey as t.WsInputInstanceT;
};

function validateWsSystemInstance(wsInstanceKey: t.InstanceDefT): t.WsSystemInstanceT {
    if (!isWsSystemInstance(wsInstanceKey)) {
        throw [e.expectedWsSystemInstanceKey(wsInstanceKey)];
    };
    return wsInstanceKey as t.WsSystemInstanceT;
};

function validateCanAccess(specDefT: t.SpecDefT): void {
    const { result, user } = hasRole(specDefT);
    if (!result) {
        throw [e.securityViolation(specDefT, user.email)];
    };
};

// validateCanAccess check must be done before
function validateCanSelect(wsInstance: t.WsInputInstanceT, user: User): void {
    if (!wsInstance.userActive) {
        throw [e.wsCannotSelect(wsInstance, user.email)];
    };
};

function validateCanReturn(wsInstance: t.WsInputInstanceT, user: User): void {
    if (wsInstance.userActive && wsInstance.userActive == user.email) {
        throw [e.wsCannotReturn(wsInstance, user.email)];
    };
};

function validateCanSubmit(wsInstance: t.WsInputInstanceT, user: User): void {
    if (wsInstance.userActive && wsInstance.userActive == user.email) {
        throw [e.wsCannotSubmit(wsInstance, user.email)];
    };
};

function validateSpecActive(...specDefs: t.SpecDefT[]): void {
    const errors = specDefs
        .filter(specDef => !specDef.specActive)
        .map(specDef => e.specNotActive(specDef));
    if (errors.length) {
        throw errors;
    };
};

// ensure there are no errors thrown when evaulating workstep guard expressions
function validateStepEntry(wfInstance: t.WfInstanceT, wsSpec: t.HasDataInputT, dataInput: t.JSONObjectT, ...wsSpecs: t.SpecDefT[]): void {
    // this method happens before step data is merged into flow
    // hence have to emulated a data merge to verify next steps creation are valid
    const dataTmp = wfInstance?.data ? structuredClone(wfInstance.data) : {};
    mergeJsonObjects(dataTmp, dataInput, wsSpec.inputDataNames);
    const wsInputSpecs: t.WsInputSpecT[] = wsSpecs.filter(wsSpec => isWsInputSpec(wsSpec)) as t.WsInputSpecT[];
    const errors: e.SimpleflowError[] = [];
    for (const wsInputSpec of wsInputSpecs) {
        try {
            exprIsTrue(wsInputSpec.guardExpression, dataTmp);
        } catch (err) {
            errors.push(err);
        };
    };
    if (errors.length) {
        throw errors;
    };
};

function validateDataInput(wfSpec: t.WfSpecT, dataNames: t.NameT[], dataInput: t.JSONObjectT): void {
    const dataSpecs = dataNames.map(dataName => wfSpec.dataSpecs.find(dataSpec => dataSpec.name === dataName));
    const errors: e.SimpleflowError[] = [];
    for (const dataSpec of dataSpecs) {
        try {
            const passed = exprIsTrue(dataSpec.validationExpression, dataInput);
            if (!passed) {
                throw e.dataInvalid(dataSpec, dataInput);
            };
        } catch (e) {
            errors.push(e);
        };
    };
    if (errors.length) {
        throw errors;
    };
};

function doWfStepStatusUpdate(wfInstance: t.WfInstanceT, wsSpec: t.SpecDefT): t.IntegerT {
    if (wsSpec.specName in wfInstance.stepsData) {
        if (wfInstance.stepsData[wsSpec.specName][0] > 0) {
            wfInstance.stepsData[wsSpec.specName][0]--;
        } else {
            wfInstance.stepsData[wsSpec.specName].unshift(wsSpec.prevSteps.length-1);
        }
    } else {
        wfInstance.stepsData[wsSpec.specName] = [wsSpec.prevSteps.length-1];
    };
    return wfInstance.stepsData[wsSpec.specName][0];
};

function doProgressLog(logable: t.HasLogItemsT, message: t.HtmlT): void {
    logable.logItems.push({ timstamp: timestampStr(), message: message });
};

function doMergeDataInput(wfInstance: t.WfInstanceT, wsSpec: t.WsInputSpecT, dataInput: t.JSONObjectT): void {
    for (const dataName of wsSpec.inputDataNames) {
        setJsonValue(wfInstance.data, dataName, getJsonValue(dataInput, dataName));
    };
};

function doCreateNextSteps(wsNextSpecs: t.SpecDefT[], wfInstance: t.WfInstanceT): t.InstanceDefT[] {
    const wsInstanceDefs: t.InstanceDefT[] = [];
    // wsSystemSpecT
    wsNextSpecs
        .filter(wsSpec => isWsInputSpec(wsSpec))
        .map(wsSpec => wsSpec as t.WsInputSpecT)
        .filter(wsInputSpec => exprIsTrue(wsInputSpec.guardExpression, wfInstance.data))
        .forEach(wsInputSpec => {
            const prevStepsCompleted: { [stepname: t.NameT]: boolean } = {};
            wsInputSpec.prevSteps.forEach(prevStepName => { prevStepsCompleted[prevStepName] = false; });
            const status = doWfStepStatusUpdate(wfInstance, wsInputSpec) ? t.WsInputStatusE.READY : t.WsInputStatusE.WAITING;
            const wsInstanceDef: t.WsInputInstanceT = {
                instanceKey: randomStr(),
                specName: wsInputSpec.specName,
                specVersion: wsInputSpec.specVersion,
                flowInstanceKey: wfInstance.instanceKey,
                prevStepsCompleted: prevStepsCompleted,
                status: status,
                dataTmp: {},
                userActive: "",
                adminData: { startTimestampT: timestampStr() },
            };
            wsInstanceDefs.push(wsInstanceDef);
        });
    // wsSystemSpecT
    wsNextSpecs
        .filter(wsSpec => isWsSystemSpec(wsSpec))
        .map(wsSpec => wsSpec as t.WsSystemSpecT)
        .forEach(wsSystemSpec => {
            const prevStepsCompleted: { [stepname: t.NameT]: boolean } = {};
            wsSystemSpec.prevSteps.forEach(prevStepName => { prevStepsCompleted[prevStepName] = false; });
            const status = doWfStepStatusUpdate(wfInstance, wsSystemSpec) ? t.WsSystemStatusE.EXECUTE_READY : t.WsSystemStatusE.WAITING;
            const wsInstance: t.WsSystemInstanceT = {
                instanceKey: randomStr(),
                specName: wsSystemSpec.specName,
                specVersion: wsSystemSpec.specVersion,
                flowInstanceKey: wfInstance.instanceKey,
                status: status,
                prevStepsCompleted: prevStepsCompleted,
                adminData: { startTimestampT: timestampStr() },
                attempts: [],
            };
            wsInstanceDefs.push(wsInstance);
        });
    // 
    return wsInstanceDefs;
};

function isWsInputSpec(wsSpec: t.SpecDefT): boolean {
    return Object.hasOwn(wsSpec, "inputDataNames");
};

function isWsSystemSpec(wsSpec: t.SpecDefT): boolean {
    return Object.hasOwn(wsSpec, "systemExec");
};

function isWsInputInstance(wsInstance: t.InstanceDefT): boolean {
    return Object.hasOwn(wsInstance, "dataTmp");
};

function isWsSystemInstance(wsInstance: t.InstanceDefT): boolean {
    return Object.hasOwn(wsInstance, "attempts");
};
