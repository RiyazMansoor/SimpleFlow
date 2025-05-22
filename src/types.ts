
// This file contains the type definitions for the application
// and the data structures used in the application.



export namespace OceanFlow {

    // Regex expressions
    export const RegexEmail = "[\\w.+-]+@[\\w.-]+\\.[\\w]{2,4}";
    export const RegexInteger = "[-+]?\\d+";
    export const RegexDecimal = "[-+]?\\d+(\\.\\d+)?";
    export const RegexAlphaNumeric = "\\w+";
    export const RegexIdentity = "A[\\d]{6}";
    export const RegexPhone = "[\\d]{3}[ -]?[\\d]{4}";

    // The basic types used in the application
    export type IntegerT = number;
    export type DecimalT = number;
    export type LabelT = string;
    export type NameT = string;
    export type DescriptionT = string;
    // export type THtml = string;
    // export type TNumeric = string;
    // export type TAlphatic = string;
    // export type TAlphaNumeric = string;
    export type PasswordT = string;
    export type EmailT = string;
    // export type TPhone = string;
    // export type TNIN = string;
    // export type TDate = string;
    // export type TTime = string;
    export type TimestampT = string;
    // export type TPostcode = string;
    export type ExpressionT = string;
    export type InstanceIdT = string;

    export type TitleT = {
        labelT: LabelT,
        descriptionT: DescriptionT,
    };

    ////// json data

    export type JSONPrimitiveT = string | number | boolean | null;
    export type JSONObjectT = { [key: string]: JSONValueT };
    export type JSONArrayT = JSONValueT[];
    export type JSONValueT = JSONPrimitiveT | JSONObjectT | JSONArrayT;


    // a generic type to pick only certain properties as requried properties
    // type Sample = AtLeast<T, 'model' | 'rel'>
    export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

    //// instance class signature
    export type Constructor<Class, DataT> = new (dataT: DataT) => Class;


    ////// some shared types

    // the base type for all data objects with 
    export type EntityT = {
    };

    // an entity that is closeable to further edits
    export const PropClosed = "closed";
    export type CloseableT = {
        [PropClosed]: boolean,
    };

    // an entity that can be enabled or disabled
    export const PropEnabled = "enabled";
    export type EnableableT = {
        [PropEnabled]: boolean,
    };

    // an entity that has security roles to access it
    export const PropRoleNames = "roleNamesT";
    export type SecurableT = {
        [PropRoleNames]: NameT[],
    };

    // and entity that is saveable
    export type SaveLog = {
        note: DescriptionT,
        saved: TimestampT,
        login: EmailT,
    };
    export const PropSaved = "saved";
    export type SaveableT = {
        [PropSaved]: SaveLog[],
    };

    export type SecurableEntityT = EntityT & SecurableT;

    ////// security - roles, logins and credentials

    // roles that provide access to the system
    export const RolePK = "roleNameIdT";
    export type RoleT = EntityT & EnableableT & {
        [RolePK]: NameT,
        descriptionT: DescriptionT,
    };
    export type AtLeastRoleT = AtLeast<RoleT, typeof RolePK | "descriptionT">

    // user login access - passwords must be hashed securely
    export const LoginPK = "loginEmailIdT";
    export type LoginT = EntityT & {
        [LoginPK]: EmailT,
        passwordT: PasswordT,
    };
    export type AtLeastLoginT = AtLeast<LoginT, typeof LoginPK | "passwordT">;

    // user access credentials/roles to perform authorized functions
    export type CredentialT = EntityT & EnableableT & SecurableT & {
        [LoginPK]: NameT,
        userNameT: NameT,
        updatedT: TimestampT[],                 // list of last updated timestamps
    };
    export type AtLeastCredentialT = AtLeast<CredentialT, typeof LoginPK | "userNameT">

    // this credential is used for public available services
    // export const PublicCredentialT: CredentialT = {
    //     [PriKeyT]: 
    //     [LoginSK]: "public@flow.com",
    //     userNameT: "Public User",
    //     [RoleNamesProperty]: ["public"],
    //     [EnabledProperty]: true,
    //     updatedT: [],
    // };
    // Object.freeze(PublicCredentialT);

    // // this credential is used for system internal services
    // export const SystemCredentialT: CredentialT = {
    //     [LoginSK]: "system@flow.com",
    //     userNameT: "System User",
    //     [RoleNamesProperty]: ["system"],
    //     [EnabledProperty]: true,
    //     updatedT: [],
    // };
    // Object.freeze(SystemCredentialT);


    ////// system audit management => includes logs and errors

    // levels of audit
    export enum AuditTypeE {
        INFO = "info",                      // for info - reviews are not required
        ERROR = "error",                    // staff must review and the close
    };

    // a single audit can contain may related auditable items
    export type AuditCauseT = {
        descriptionT: DescriptionT,         // short description of this item
        payloadT: JSONObjectT,              // relevant data payload for this item
    };

    // an audit generally requires staff review and closure
    export type AuditReviewT = {
        timestampedT: TimestampT,
        credentialT: CredentialT,           // user making the followup
        descriptionT: DescriptionT,         // short description of this review
    };

    // an audit report - comprises of
    // stack trace
    // one or more  related causes
    // one or more staff reviews and closure
    export const AuditReportPK = "auditReportInstanceIdT";
    export type AuditReportT = EntityT & CloseableT & {
        timestampedT: TimestampT,
        [AuditReportPK]: InstanceIdT,
        auditTypeE: AuditTypeE,
        auditCausesT: AuditCauseT[],
        auditReviewsT: AuditReviewT[],
        credentialT: CredentialT,
        stack: DescriptionT,
    };
    export type AtLeastAuditReportT = AtLeast<AuditReportT, "credentialT">;


    ////// data configuration and data entry

    //// supported data types 
    export enum DataTypeE {
        INTEGER,
        DECIMAL,
        DATE,
        TIME,
        TIMESTAMP,
        EMAIL,
        PASSWORD,
        TEXT,
        PARAGRAPH,
    };



    //// data validtion parameters
    //// any compbination accepted and all validations will applied on data items
    export type ValidationT = {
        required?: boolean,
        pattern?: string,
        valRange?: { min?: DecimalT, max?: DecimalT },
        lenRange?: { min?: IntegerT, max?: IntegerT },
        dateRange?: { min?: IntegerT, max?: IntegerT },     // days relative to TODAY()
        timeRange?: { min?: IntegerT, max?: IntegerT },     // in minutes
    };

    //// configuration of data items in the flow
    //// name is used as an unique identifier in flow
    //// data validations are specified here
    export const DataPropertiesPK = "dataNameIdT";
    export type DataPropertiesT = {
        [DataPropertiesPK]: NameT,
        dataTypeE: DataTypeE,
        validations?: ValidationT,          // validations can be optional
    };

    //// a user data entry - used throughout this application
    //// name must match respective data-config
    export type DataValueT = {
        [DataPropertiesPK]: NameT,
        dataValue: string | number | boolean,
    };


    ////// nodes on the flow graph

    // there could be many types of nodes
    export enum NodeTypeE {
        FORM,                                   // a form node - user input
        TASK,                                   // a task node - system work
    };

    // a node configuration on the flow graph
    export const NodeConfigSK = "nodeNameIdT";
    export type NodeConfigT = EntityT & SecurableT & {
        [NodeConfigSK]: NameT,                  // name of node - eg: form-name or job-name
        [FlowConfigSK]: NameT,                  // name of flow-config that spawned this node
        nodeTypeE: NodeTypeE,                   // type of node
        predExpressionT: ExpressionT,           // boolean expression to proceed or not    
        nextNodeNameIdsT: NameT[],                    // multpe nodes may follow
    };


    export type DataPropertiesMapT = {
        [dataNameT: NameT]: NameT,
    };

    export type DataValuesMapT = {
        [dataNameT: NameT]: DataValueT,
    };

    //// a specific node type - system work/job 
    export type TaskConfigT = NodeConfigT & {
        // this is map to  extract the data values from the flow
        // every data name required by the work/job => mapped to the data name of the flow
        taskFunction: "",
        dataMapT: DataPropertiesMapT,
    };



    ////// being form render specification

    //// rendering widget - typically html
    export enum HTMLTypeE {
        EMAIL,
        TEXT,
        TEXTAREA,
        DROPDOWN,
        LISTBOX,
        RADIOBUTTON,
        CHECKBOX,
    };

    //// the width of the widget - allows multiple widgets on a line
    export enum HTMLWidthE {
        FULL,
        HALF,
        THIRD,
        TWOTHIRD,
        FOURTH,
        THREEFOURTH,
        REST,
    };

    //// rendering of a control or component
    //// the configuration will contain one of (component, custom) or neither.
    //// where it is neither, the component renders a newline 
    export const FormWidgetPK = "widgetNameIdT";
    export type FormWidgetT = {
        [FormWidgetPK]: NameT,
        // pre built component with multiple widgets that can map multiple fields
        component?: {
            componentNameT: NameT,          // name of the pre-built component
            dataNamesT: NameT[],             // todo - how to match component fields
        },
        // a single widget for a single field
        custom?: {
            dataNameT: NameT,                // name of the data-item
            defaultValueT?: string,          // a default value to render
            labelT: NameT,                  // label displayed for this field
            toolTypeE: HTMLTypeE,
            toolWidthE: HTMLWidthE,
            list?: [NameT, string][],
        },
    };

    //// how a ctrl will be rendered
    export type FormComponentT = EnableableT & {
        [FormWidgetPK]: NameT,
        isFlowData: boolean,                // data that will be uploaded flow data
    };

    //// rendering a related controls in a segments of a form
    export type FormSegmentT = {
        titleT: TitleT,
        formCompnentsT: FormComponentT[],
    };

    //// a specific node type - user input form-config as a node on the work flow tree
    export type FormConfigT = NodeConfigT & {
        titleT: TitleT,
        formSegmentsT: FormSegmentT[],
    };


    //// node-instance is an "abstract" type.
    //// extension like job/form have the implementation
    export const FlowInstancePK = "nodeInstanceIdT";
    export type NodeInstanceT = EntityT & {
        timestampedT: TimestampT,
        [NodeConfigSK]: NameT,
        [FlowInstancePK]: InstanceIdT,
    };
    export type AtLeastNodeInstance = AtLeast<NodeInstanceT, typeof NodeConfigSK | typeof FlowInstancePK>;

    //// the status of a job
    export enum TaskStatusE {
        OPEN,           // job has been created - an active state
        CLOSED,         // job has been completed and closed normally
        SKIPPED,        // a human intervention - skips the job and moves next
    };

    export type TaskAttemptT = AuditCauseT & {
        timestampedT: TimestampT,
    };

    export type TaskInstanceT = NodeInstanceT & {
        attemptsT: TaskAttemptT[],           // users access form
        statusE: TaskStatusE,
    };
    export type AtLeastTaskInstanceT = AtLeast<TaskInstanceT, typeof NodeConfigSK | typeof FlowInstancePK>;



    //// the status of a form-instance
    export enum FormStatusE {
        CREATED,        // task created by system, waiting queue - an active state
        SELECTED,       // task has been picked from queue - an active state - HUMAN task only
        RETURNED,       // task returned to queue - this is an end state - HUMAN task only
        EXECUTED,       // task executed - this is an end state
        ABORTED,        // task aborted - by a supervisor/admin - this is an end state
    };

    //// record for form accesses
    export type FormAccessT = {
        credentialT: CredentialT,
        selectedTimestampT: TimestampT,
        requestedTimestampT?: TimestampT,
        savedTimestampT?: TimestampT,
        returnedTimestampT?: TimestampT,
        executedTimestampT?: TimestampT,
        abortedTimestampT?: TimestampT,
    };

    // 
    export type FormInstanceT = NodeInstanceT & {
        accessesT: FormAccessT[],               // users access form
        statusE: FormStatusE,
        currentUserEmailT: EmailT,              // easy access to last user (db filtering)
        tempDataItemsT: DataValueT[],           // when user saves form for later
    };
    export type AtLeastFormInstanceT = AtLeast<FormInstanceT, typeof NodeConfigSK | typeof FlowInstancePK>;


    ////// the flow configuration

    //// configuration settings for a flow type
    export const FlowConfigSK = "flowNameIdT";
    export type FlowConfigT = EntityT & {
        [FlowConfigSK]: NameT,                  // flow name
        startFormNameT: NameT,                  // kick start data input as contained in form
        dataConfigsT: DataPropertiesT[],        // every data item has its own data/validation
        taskConfigsT: TaskConfigT[],            // all the form widgets in this flow
        formConfigsT: FormConfigT[],            // all the forms in this flow
        formWidgetsT: FormWidgetT[],            // 
    };

    //// status of a flow instance
    export enum FlowStatusE {
        OPEN,                                   // flow is active
        CLOSED,                                 // normal closing of flow
        ABORTED,                                // flow (sub everything) can be aborted by a supervisor/admin
    };

    //// activity and other notes occuring on a flow instance
    export type LogItemT = {
        timestamp: TimestampT,
        description: DescriptionT,
        credential: CredentialT,                // who was active when log generated
        form?: {
            instanceId: InstanceIdT,
            formData: DataValueT[],          // data received from a form
        },
    };

    //// flow-instance spawned by respective flow-config
    export type FlowInstanceT = EntityT & {
        [FlowConfigSK]: NameT,                        // form-config name that spawned this instance
        timestamps: {
            createdT: TimestampT,
            closedT?: TimestampT,
            abortedT?: TimestampT,
        },
        logItemsT: LogItemT[],
        dataItemsT: DataValueT[],
        statusE: FlowStatusE,
    };
    export type AtLeastFlowInstanceT = AtLeast<FlowInstanceT, typeof FlowConfigSK>;


    //// this part defines the execution pipeline for user service requests

    export enum APIRequestE {
        FETCH_FLOW,
        START_FLOW,
        ABORT_FLOW,
        SELECT_FORM,
        RETURN_FORM,
        SAVE_FORM,
        SUBMIT_FORM,
    };

    //// context created for all work flow operations
    //// required objects are created here as required and the response as well
    export type ContextT = {
        userEmailIdT?: EmailT,                    // optional calling user, maybe a public user
        // when taking an action on a form
        formInstanceIdT?: InstanceIdT,          // needed for task specific actions
        formDataValuesT?: DataValueT[],         // values submitted for the user action
        // when starting a work flow
        flowNameIdT?: NameT,                      // needed for flow start actions
    };


    ////// response object received by clients
    // an empty response is a success
    export type ResponseT = {
        error?: AuditCauseT[],                  // if errors occurred
        form?: {
            formTitleT: TitleT,
            formSegmentsT: FormSegmentT[],      // provides form structure and elements
            htmlConfigsT: FormWidgetT[],        // element structure to render
            dataPropertiesT: DataPropertiesT[], // the forms data elements and data validation
            dataValuesT: DataValueT[],          // forms data values if available
        },
    };

}
