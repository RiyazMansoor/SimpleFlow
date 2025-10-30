
import { OceanFlow as t } from "./types";
// import { OceanFlow as c } from "./configs";
// import { OceanFlow as i } from "./instances";


export namespace OceanFlow {


    /**
     * An entity is represented by its primary key and the json object data record.
     * [IdT] the type of the primary key
     */
    export interface Entity<IdT, DataT extends t.EntityT> {

        /**
         * @returns the primary key of this json object data record
         */
        getIdT(): IdT;

        /**
         * @returns the json object data record
         */
        // getDataT(): DataT;

    }

    /**
     * An entity that is savable after edits and updates.
     * @see Entity
     */
    export interface Saveable<DataT extends t.EntityT & t.SaveableT> {

        /**
         * Saves this entity.
         */
        save(descriptionT: t.DescriptionT, userT: t.UserT): void;

    }

    export interface Enableable<DataT extends t.EntityT & t.EnableableT> {


        /**
         * @returns true if this role is enabled
         */
        isEnabled(): boolean;

        /**
         * @param status the new enabled status
         */
        enable(status: boolean): void;

    }

    export interface Closeable<DataT extends t.EntityT & t.CloseableT> {


        /**
         * @returns true if this object is closed for any edits
         */
        isClosed(): boolean;

        /**
         * @param status closes this object for any edits
         */
        close(): void;

        /**
         * @param yes true to freeze the underlying json object
         */
        freeze(yes: boolean): void;

    }

    /**
     * An entity that is securable via access security roles.
     */
    // export interface Securable<DataT extends t.SecurableEntityT> extends Entity<DataT> {
    export interface Securable<DataT extends t.EntityT & t.SecurableT> {

        /**
         * @returns the role names that the entity has
         */
        allowedRoleNamesT(): t.NameT[];

    }

    /**
     * An entity that is secured with access roles.
     */
    // export interface Secured<DataT extends t.SecurableEntityT> extends Securable<DataT> {
    export interface Authoriser<DataT extends t.EntityT & t.AuthorizerT> {

        /**
         * Authenticates for role based access.
         * @returns array of security issues or empty array if access allowed
         */
        isAuthorised(allowedRoleNamesIdT: t.NameT[]): t.AuditCauseT[];

    }


    /**
     * The configuration of a node on a flow graph that has secured access.
     */
    export interface NodeConfig<DataT extends t.EntityT & t.NodeConfigT>
        extends Securable<DataT> {

        // getType(): t.NodeTypeE;

        createNodes(flowInstance: FlowInstance): void;

        // predicatePassed(dataValuesT: t.DataValueT[]): boolean;

    }

    export interface TaskConfig extends NodeConfig<t.TaskConfigT> {


        /**
         * Returns the data configuration map to pull flow data for this task.
         * @returns the data configuration map
         */
        dataMap(): t.DataPropertiesMapT;

    }

    export interface FormConfig extends NodeConfig<t.FormConfigT> {

        /**
         * Returns the json to render this form - except form values.
         * @param withCredential the user credential accessing this form
         * @returns the form rendering data
         */
        form(withCredential: Securable): t.ResponseT;

        /**
         * @param credential the user credential accessing this form
         * @param dataValuesT the data values the user submitted
         * @returns the result of flow start form submission
         */
        // formSubmit(credential: s.Credential, dataValuesT: t.DataValueT[]): t.ResponseT;

        /**
         * @param dataValuesT user data values for this form
         * @returns filtered savable flow data values for this form
         */
        filter(dataValuesT: t.DataValueT[]): t.DataValueT[];

        /**
         * @param dataValuesT user data to validate against this form
         * @returns response of error if validation failed or empty response
         */
        validate(dataValuesT: t.DataValueT[]): t.AuditCauseT[];

    }

    /**
     * 
     */
    export interface FlowConfig extends Entity<t.FlowDesignT> {


        /**
         * Form configurations pull the form specific data configurations to render.
         * @param dataNameIdT the data configurations to return
         */
        // dataConfigT(dataNameIdT: t.NameT): t.DataPropertiesT;

        /**
         * Form configurations pull the form specific html configurations to render.
         * @param htmlNameIdT the html configurations to return
         */
        // htmlConfigT(htmlNameIdT: t.NameT): t.FormWidgetT;

        /**
         * Form configurations pull the form specific html configurations to render.
         * @param nodeNameIdT the html configurations to return
         */
        nodeConfig(nodeNameIdT: t.NameT): NodeConfig<t.NodeConfigT>;

        /**
         * @param credential the user credential accessing this flow
         * @returns the kick start form (data) to start a new flow instance
         */
        startFetch(securable: Securable): t.ResponseT;

        /**
         * @param credential the user credential accessing this flow
         * @param dataValuesT the data values the user submitted
         * @returns response to the submission to start a new flow instance
         */
        startSubmit(securable: Securable, dataValuesT: t.DataValueT[]): t.ResponseT;

        /**
         * Users can only operate on a form instance after picking it from the general queue.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formPicked(securable: Securable, nodeInstanceIdt: t.InstanceIdT): t.ResponseT;

        /**
         * User requests the form. 
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formRequested(securable: Securable, nodeInstanceIdt: t.InstanceIdT): t.ResponseT;

        /**
         * Users can return the form instance back to the general queue.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formReturned(securable: Securable, nodeInstanceIdt: t.InstanceIdT): t.ResponseT;

        /**
         * Users can save the entered form data without submitting. Eg: waiting for more data.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formSaved(securable: Securable, nodeInstanceIdt: t.InstanceIdT, dataInstancesT: t.DataValueT[]): t.ResponseT;

        /**
         * Users can submit the form data. Following logic is built in.
         * 1) data validation on the client and then again on the server
         * 2) only designated data values  will be uploaded to the flow data
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formSubmitted(securable: Securable, nodeInstanceIdt: t.InstanceIdT, dataInstancesT: t.DataValueT[]): t.ResponseT;
    }



    /**
     * An abstract base node instance on the flow graph.
     * 
     */
    export interface NodeInstance<DataT extends t.NodeInstanceT>
        extends Entity<DataT>, Saveable {

        /**
         * @returns the node configuration object for this instance 
         */
        getConfig(): NodeConfig<t.NodeConfigT>;

        /**
         * @returns the flow instance that this node instance belongs to
         */
        getFlowInstance(): FlowInstance;

        /**
         * Nodes will be closed internally by the nodes itself
         * @returns true if this instance has completed
         */
        isClosed(): boolean;


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
        getConfig(): TaskConfig;

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
        getConfig(): FormConfig;

        /**
         * Individual person based access verification.
         * @returns array of security issues or empty array if access allowed
         */
        hasUserAccess(withSecurable: Securable): t.AuditCauseT[];

        /**
         * Users can only operate on a form instance after picking it from the general queue.
         * @param securable the user credential picking this form from general bucket
         * @returns the response
         */
        formPicked(securable: Securable): t.ResponseT;

        /**
         * User requests the form. 
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formRequested(): t.ResponseT;

        /**
         * Users can return the form instance back to the general queue.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formReturned(): t.ResponseT;

        /**
         * Users can save the entered form data without submitting. Eg: waiting for more data.
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formSaved(dataValuesT: t.DataValueT[]): t.ResponseT;

        /**
         * Users can submit the form data. Following logic is built in.
         * 1) data validation on the client and then again on the server
         * 2) only designated data instances will be uploaded to the flow data
         * @param credential the user credential picking this form from general bucket
         * @returns the response
         */
        formSubmitted(dataValuesT: t.DataValueT[]): t.ResponseT;

    }

    /**
     * Savable flow instances for each user generated flow.
     */
    export interface FlowInstance extends Entity<t.FlowInstanceT>, Saveable {

        /**
         * No duplicate data instances are allowed - 
         * a filter on the supplied data instances will be applied
         * @param dataValuesT to add to this flows instance data
         * @returns array of causes that failed or empty array if succeeded
         */
        addData(dataValuesT: t.DataValueT[]): t.AuditCauseT[];

    }

}