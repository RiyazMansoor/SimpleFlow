
import { OceanFlow as t } from "./types";
import { OceanFlow as s } from "./security";
import { OceanFlow as c } from "./configs";

export namespace OceanFlow {

    /**
     * An entity is represented by its primary key and the json object data record.
     * <IdT> the type of the primary key
     * <DataT> the type of the json object data record
     */
    export interface Entity<IdT, DataT extends {}> {

        /**
         * @returns the primary key of this json object data record
         */
        getIdT(): IdT;

        /**
         * @returns the json object data record
         */
        getDataT(): DataT;

    }

    /**
     * An entity that is savable after edits and updates.
     * @see Entity
     */
    export interface SavableEntity<IdT, DataT extends {}> extends Entity<IdT, DataT> {

        /**
         * @param yes true to freeze the underlying json object
         */
        freeze(yes: boolean): void;

        /**
         * Saves this entity.
         */
        save(): void;

    }

    /**
     * An entity that is securable via access security roles.
     */
    export interface Securable<IdT, DataT extends {}> extends Entity<IdT, DataT> {

        /**
         * @return the role names that the entity has
         */
        hasRoles(): t.NameT[];

    }

    /**
     * An entity that is secured with access roles.
     */
    export interface Secured<IdT, DataT extends {}> extends Securable<IdT, DataT> {

        /**
         * Authenticates for role based access.
         * @returns array of security issues or empty array if access allowed
         */
        hasRolesAccess(credential: s.Credential): t.AuditCauseT[];

    }

    /**
     * The configuration of a node on a flow graph that has secured access.
     */
    export interface NodeConfig<DataT extends t.NodeConfigT> extends Secured<t.NameT, DataT> {

        /**
         * @returns the type of the node
         */
        type(): t.NodeTypeE;

        /**
         * Evaluates the nodes' predicate expression on current flow data.
         * @returns false if further execution is to be stopped 
         */
        canProceed(): boolean;

        /**
         * @returns the parent flow configuration object
         */
        // flowConfig(): FlowConfig;

        /**
         * @returns next names of node confugaration objects to execute
         */
        next(): t.NameT[];

    }

    export interface FormConfig extends NodeConfig<t.FormConfigT> {

        /**
         * In addition to super class role based access,
         * individual person based access can be also conditionally applied.
         * @returns array of security issues or empty array if access allowed
         */
        hasUserAccess(credential: s.Credential): t.AuditCauseT[];

        /**
         * Returns the json clone to render this form - except form values.
         * @returns the form rendering data
         */
        formResponse(): t.ResponseT;

        /**
         * @param dataInstancesT user data instances for this form
         * @returns filtered savable data instances for this form
         */
        formDataInstances(dataInstancesT: t.DataInstanceT[]): t.DataInstanceT[];

        /**
         * @param dataInstancesT user data to validate against this form
         * @returns response of error if validation failed or empty response
         */
        formValidate(dataInstancesT: t.DataInstanceT[]): t.ResponseT | undefined;

    }


    export interface TaskConfig extends NodeConfig<t.TaskConfigT> {


        /**
         * Returns the data configuration map to pull flow data for this task.
         * @returns the data configuration map
         */
        dataMap(): t.DataConfigMapT;

    }


    /**
     * 
     */
    export interface FlowConfig extends Entity<t.NameT, t.FlowConfigT> {


        /**
         * Form configurations pull the form specific data configurations to render.
         * @param dataNameIdT the data configurations to return
         */
        dataConfig(dataNameIdT: t.NameT): c.DataConfig;

        /**
         * Form configurations pull the form specific html configurations to render.
         * @param htmlNameIdT the html configurations to return
         */
        htmlConfig(htmlNameIdT: t.NameT): c.HTMLConfig;

        /**
         * Form configurations pull the form specific html configurations to render.
         * @param nodeNameIdT the html configurations to return
         */
        nodeConfig(nodeNameIdT: t.NameT): c.NodeConfig<t.NodeConfigT>;

        /**
         * @returns the kick start form (data) to start a new flow instance
         */
        start(): t.ResponseT;

    }




    /**
     * External data sent to flows. 
     * This instance is not saved individually but as part of other classes 
     */
    // export interface DataInstance extends Entity<t.NameT, t.DataInstanceT> {

    // }


    /**
     * An abstract base node instance on the flow graph.
     * 
     */
    export interface NodeInstance<DataT extends t.AtLeastNodeInstance> extends SavableEntity<t.NameT, DataT> {

        /**
         * @returns the node configuration object for this instance 
         */
        getConfig(): c.NodeConfig<t.NodeConfigT>;

        /**
         * @returns the flow instance that this node instance belongs to
         */
        getFlowInstance(): FlowInstance;

        /**
         * @returns true if this instance has completed
         */
        isClosed(): boolean;

        /**
         * @param credential the user whose action triggered closing this low
         * @returns this instance for chaining
         */
        // close(credential: s.Credential): NodeInstance<DataT>;


    }


    /**
     * A task is process executed by the system.
     * This sytem does NOT execute any tasks, but uploads the required data 
     * to the specified web-service. 
     * A successful upload is considered the task successfully completed.
     * TODO: strategy to re-attempt failures for a number of times.
     */
    export interface TaskInstance extends NodeInstance<t.TaskInstanceT> {

        /**
         * Overrides the parent method by returning the correct type.
         * @returns the task configuration object for this instance 
         */
        getConfig(): c.TaskConfig;

        /**
         * Uploads the required information to its web service for execution.
         * A successful web service call is a successful execution of this task.
         */
        taskUpload(): void;

    }


    /**
     * A form is a user data entry point. The flow will wait until data is received.
     */
    export interface FormInstance extends NodeInstance<t.FormInstanceT> {

        /**
         * Overrides the parent method by returning the correct type.
         * @returns the form configuration object for this instance 
         */
        getConfig(): c.FormConfig;

        /**
         * Users can only operate on a form instance after picking it from the general queue.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formPicked(credential: s.Credential): t.ResponseT;

        /**
         * User requests the form. 
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formRequested(credential: s.Credential): t.ResponseT;

        /**
         * Users can return the form instance back to the general queue.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formReturned(credential: s.Credential): t.ResponseT;

        /**
         * Users can save the entered form data without submitting. Eg: waiting for more data.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formSaved(credential: s.Credential, dataInstancesT: t.DataInstanceT[]): t.ResponseT;

        /**
         * Users can submit the form data. Following logic is built in.
         * 1) data validation on the client and then again on the server
         * 2) only designated data instances will be uploaded to the flow data
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formSubmitted(credential: s.Credential, dataInstancesT: t.DataInstanceT[]): t.ResponseT;

    }


    /**
     * Savable flow instances for each user generated flow.
     */
    export interface FlowInstance extends SavableEntity<t.InstanceIdT, t.FlowInstanceT> {

        /**
         * No duplicate data instances are allowed - 
         * a filter on the supplied data instances will be applied
         * @param dataInstancesT to add to this flows instance data
         * @returns array of causes that failed or empty array if succeeded
         */
        receiveData(dataInstancesT: t.DataInstanceT[]): t.AuditCauseT[];

    }

}