
import { SpecCache } from "./Cache.js";
import { SimpleflowError } from "./Errors.js";
import { validateData } from "./Data.js";
import { IntegerT, JSONObjectT, JSONValueT, NameT, SpecIdT } from "./Types.js";
import { DataSpecT, validateActiveWorkflow, WorkflowInstanceT, WorkflowSpecT } from "./Workflows.js";
import { WorkstepSpecT } from "./Worksteps.js";




function isDataValid(dataNamesT: NameT, data: JSONObjectT, dataSpecsT?: DataSpecT[]): boolean {
    for (const dataNameT of dataNamesT) {
        // ignore if there is no data validation
        const dataConditions: ConditionT[] = dataSpecsT.find((ds) => ds.dataNameT == dataNameT)?.dataConditions;
        if (!dataConditions ||dataConditions.length == 0) continue;
        // get data value
        conditionResult(dataConditions, data);
    };
    return true;
};

const WorkflowsActiveCache: Map<string, WorkflowInstanceT> = new Map();


export function createWorkflow(flowSpecIdT: SpecIdT, startData: JSONObjectT): SimpleflowError[] {
    try {
    // fetch flow specification
    const wfSpec: WorkflowSpecT = WorkflowCache.get(flowSpecIdT);
    // check spec is active
    validateActiveWorkflow(wfSpec);
    // check data is valid
    validateData(wfSpec.dataSpecs, startData);
    // validate start data
    // execute: create flow and next steps, save as a batch.
    // return empty array on success
    // return errors if unsuccessful
    } catch (error) {
        return [error];
    }
    return [];
};








export interface WorkflowService {

    start(): Promise<IntegerT>;
    
    stop(): Promise<IntegerT>;

    registerWorkflow(workflowSpec: WorkflowSpecT): Promise<boolean>;
    unregisterWorkflow(workflowSpecId: SpecIdT): Promise<boolean>;

    suspendWorkflow(workflowSpecId: SpecIdT): Promise<boolean>;
    resumeWorkflow(workflowSpecId: SpecIdT): Promise<boolean>;

    startWorkflow(workflowSpecId: SpecIdT, data: any): Promise<boolean>; // workflow info    
    terminateWorkflow(workflowSpecId: SpecIdT): Promise<boolean>;

    publishEvent(eventName: string, eventKey: string, eventData: any, eventTime: Date): Promise<void>;
    
};






/*
export class WorkflowServiceImpl implements WorkflowService {

    private logger: Logger = new ConsoleLogger("[Workflow Service]");

    public start(): Promise<IntegerT> {        
        this.logger.log("Starting workflow host...");
        // for (let worker of this.workers) {
        //     worker.start();
        // }
        // this.registerCleanCallbacks();
        // return Promise.resolve(undefined);
        return Promise.resolve(0);
    };

    public stop(): Promise<IntegerT> {
        this.logger.log("Stopping workflow host...");
        // for (let worker of this.workers) {
        //     worker.stop();
        // }
        return Promise.resolve(0);
    };
    
    public registerWorkflow(workflowSpec: WorkflowSpecT): Promise<boolean> {
        const result = WorkflowCache.add(workflowSpec);
        return Promise.resolve(result);
    };

    public unregisterWorkflow(specIdT: SpecIdT): Promise<boolean> {
        const result = WorkflowCache.remove(CacheKey(specIdT ));
        return Promise.resolve(result);
    };

    startWorkflow(workflowSpecId: SpecIdT, data: any): Promise<boolean> {
        
    };
    
/*
    public async startWorkflow(id: string, version: number, data: any = {}): Promise<string> {
        let self = this;
        let def = self.registry.getDefinition(id, version);
        let wf = new WorkflowInstance();
        wf.data = data;
        wf.description = def.description;
        wf.workflowDefinitionId = def.id;
        wf.version = def.version;
        wf.nextExecution = 0;
        wf.createTime = new Date();
        wf.status = WorkflowStatus.Runnable;
        
        let ep = this.pointerFactory.buildGenesisPointer(def);
        wf.executionPointers.push(ep);
        
        let workflowId = await self.persistence.createNewWorkflow(wf);
        self.queueProvider.queueForProcessing(workflowId, QueueType.Workflow);

        return workflowId;
    }
    
    
    public async publishEvent(eventName: string, eventKey: string, eventData: any, eventTime: Date): Promise<void> {
        //todo: check host status        

        this.logger.info("Publishing event %s %s", eventName, eventKey);

        let evt = new Event();
        evt.eventData = eventData;
        evt.eventKey = eventKey;
        evt.eventName = eventName;
        evt.eventTime = eventTime;
        evt.isProcessed = false;
        let id = await this.persistence.createEvent(evt);
        this.queueProvider.queueForProcessing(id, QueueType.Event);        
    }

    
    public async suspendWorkflow(id: string): Promise<boolean> {
        let self = this;
        try {        
            let result = false;
            let gotLock = await self.lockProvider.aquireLock(id);
            
            if (gotLock) {              
                try {
                    let wf = await self.persistence.getWorkflowInstance(id);
                    if (wf.status == WorkflowStatus.Runnable) {
                        wf.status = WorkflowStatus.Suspended;
                        await self.persistence.persistWorkflow(wf);
                        result = true;
                    }
                }   
                finally {
                    self.lockProvider.releaseLock(id);
                }            
            }
            return result;
        }
        catch (err) {
            self.logger.error("Error suspending workflow: " + err);
            return false;
        }
    }

    public async resumeWorkflow(id: string): Promise<boolean> {
        let self = this;
        try {        
            let result = false;
            let gotLock = await self.lockProvider.aquireLock(id);
            
            if (gotLock) {              
                try {
                    let wf = await self.persistence.getWorkflowInstance(id);
                    if (wf.status == WorkflowStatus.Suspended) {
                        wf.status = WorkflowStatus.Runnable;
                        await self.persistence.persistWorkflow(wf);
                        result = true;
                    }
                }   
                finally {
                    self.lockProvider.releaseLock(id);
                }            
            }
            return result;
        }
        catch (err) {
            self.logger.error("Error resuming workflow: " + err);
            return false;
        }
    }

    public async terminateWorkflow(id: string): Promise<boolean> {
        let self = this;
        try {        
            let result = false;
            let gotLock = await self.lockProvider.aquireLock(id);
            
            if (gotLock) {              
                try {
                    let wf = await self.persistence.getWorkflowInstance(id);                    
                    wf.status = WorkflowStatus.Terminated;
                    await self.persistence.persistWorkflow(wf);
                    result = true;                    
                }   
                finally {
                    self.lockProvider.releaseLock(id);
                }            
            }
            return result;
        }
        catch (err) {
            self.logger.error("Error terminating workflow: " + err);
            return false;
        }
    }
    
    private registerCleanCallbacks() {
        let self = this;

        if (typeof process !== 'undefined' && process) {
            process.on('SIGINT', () => {
                self.stop();
            });
        }
    }

};
*/

