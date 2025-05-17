
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
    export type TLabel = string;
    export type NameT = string;
    export type DescriptionT = string;
    export type THtml = string;
    export type TNumeric = string;
    export type TAlphatic = string;
    export type TAlphaNumeric = string;
    export type PasswordT = string;
    export type EmailT = string;
    export type TPhone = string;
    export type TNIN = string;
    export type TDate = string;
    export type TTime = string;
    export type TimestampT = string;
    export type TPostcode = string;
    export type ExpressionT = string;
    export type InstanceIdT = string;

    export type TitleT = {
        titleT: NameT,
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


    ////// security - roles, logins and credentials

    // roles that provide access to the system
    export const RolePK = "roleNameIdT";
    export type RoleT = {
        [RolePK]: NameT,                       // primary key
        descriptionT: DescriptionT,
        enabled: boolean,
    };
    export type AtLeastRoleT = AtLeast<RoleT, typeof RolePK | "descriptionT">

    // user login access
    export const LoginPK = "loginEmailIdT";
    export type LoginT = {
        [LoginPK]: EmailT,                     // primary key
        passwordT: PasswordT,               // stored in hashed form
    };
    export type AtLeastLoginT = AtLeast<LoginT, typeof LoginPK | "passwordT">;

    // active roles a user has
    export const RoleNamesProperty = "roleNamesT";
    export type SecureRoleT = {
        [RoleNamesProperty]: NameT[],             // from TRole
    };

    export type CredentialT = SecureRoleT & {
        [LoginPK]: NameT,                       // from TUser
        userNameT: NameT,                  // from TUser
        enabled: boolean,
        updatedT: TimestampT[],             // list of last updated timestamps
    };
    export type AtLeastCredentialT = AtLeast<CredentialT, typeof LoginPK | "userNameT">

    // this credential is used for public available services
    export const PublicCredentialT: CredentialT = {
        [LoginPK]: "public@flow.com",
        userNameT: "Public User",
        [RoleNamesProperty]: ["public"],
        enabled: true,
        updatedT: [],
    };
    Object.freeze(PublicCredentialT);

    // this credential is used for system internal services
    export const SystemCredentialT: CredentialT = {
        [LoginPK]: "system@flow.com",
        userNameT: "System User",
        [RoleNamesProperty]: ["system"],
        enabled: true,
        updatedT: [],
    };
    Object.freeze(SystemCredentialT);


    //// instance class signature
    export type Constructor<Class, DataT> = new (dataT: DataT) => Class;

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
    export type AuditReportT = {
        timestampedT: TimestampT,
        [AuditReportPK]: InstanceIdT,
        auditTypeE: AuditTypeE,
        credentialT: CredentialT,
        stack: DescriptionT,
        auditCausesT: AuditCauseT[],
        auditReviewsT: AuditReviewT[],
        closed: boolean,
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
    export const DataConfigPK = "dataNameIdT";
    export type DataConfigT = {
        [DataConfigPK]: NameT,
        dataTypeE: DataTypeE,
        validations?: ValidationT,          // validations can be optional
    };

    //// a user data entry - used throughout this application
    //// name must match respective data-config
    export type DataInstanceT = {
        [DataConfigPK]: NameT,
        dataValue: string | number | boolean,
    };


    ////// nodes on the flow graph

    // there could be many types of nodes
    export enum NodeTypeE {
        FORM,
        JOB,
    };

    // a node configuration on the flow graph
    export const NodeConfigPK = "nodeNameIdT";
    export type NodeConfigT = {
        [NodeConfigPK]: NameT,              // name of node - eg: form-name or job-name
        [FlowConfigPK]: NameT,
        nodeTypeE: NodeTypeE,               // type of node
        predExpressionT: ExpressionT,       // boolean expression to proceed or not    
        roleNamesT: NameT[],                // authorised roles for this node
        nextNodesT: NameT[],          // multpe nodes may follow
    };


    export type DataConfigMapT = {
        [taskDataNameT: NameT]: NameT,
    };

    export type DataInstanceMapT = {
        [taskDataNameT: NameT]: DataInstanceT,
    };

    //// a specific node type - system work/job 
    export type TaskConfigT = NodeConfigT & {
        // this is map to  extract the data values from the flow
        // every data name required by the work/job => mapped to the data name of the flow
        taskFunction: "",
        dataMapT: DataConfigMapT,
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
    //// the configuration will contain one of three (paragraph, component, custom) 
    export const HTMLConfigPK = "htmlNameIdT";
    export type HTMLConfigT = {
        [HTMLConfigPK]: NameT,
        // force a new line widget
        paragraph?: boolean,
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
    //// a constant ctrl for new line/para during rendering
    export const ParagraphHTMLConfigT: HTMLConfigT = {
        [HTMLConfigPK]: "paragraph",
        paragraph: true,
    };

    //// how a ctrl will be rendered
    export type FormComponentT = {
        [HTMLConfigPK]: NameT,
        enabled: boolean,                   // control is enabled, else disabled
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

    export type FormRenderingT = {
        titleT: TitleT,
        segmentsT: FormSegmentT[],
        hmtlConfigNamesT: NameT[],
        dataConfigNamesT: NameT[],
    };


    //// node-instance is an "abstract" type.
    //// extension like job/form have the implementation
    export const NodeInstancePK = "nodeInstanceIdT";
    export type NodeInstanceT = {
        timestampedT: TimestampT,
        [NodeInstancePK]: InstanceIdT,
        [NodeConfigPK]: NameT,
        [FlowInstancePK]: NameT,
    };
    export type AtLeastNodeInstance = AtLeast<NodeInstanceT, typeof NodeConfigPK | typeof FlowInstancePK>;

    //// the status of a job
    export enum TaskStatusE {
        OPEN,           // job has been created - an active state
        CLOSED,         // job has been completed and closed normally
        SKIPPED,        // a human intervention - skips the job and moves next
    }

    export type TaskAttemptT = AuditCauseT & {
        timestampedT: TimestampT,
    }

    export type TaskInstanceT = NodeInstanceT & {
        attemptsT: TaskAttemptT[],           // users access form
        statusE: TaskStatusE,
    };
    export type AtLeastTaskInstanceT = AtLeast<TaskInstanceT, typeof NodeConfigPK | typeof FlowInstancePK>;



    //// the status of a form-instance
    export enum FormStatusE {
        CREATED,        // task created by system, waiting queue - an active state
        SELECTED,       // task has been picked from queue - an active state - HUMAN task only
        RETURNED,       // task returned to queue - this is an end state - HUMAN task only
        EXECUTED,       // task executed - this is an end state
        ABORTED,        // task aborted - by a supervisor/admin - this is an end state
    }

    //// record for form accesses
    export type FormAccessT = {
        credentialT: CredentialT,
        selectedTimestampT: TimestampT,
        requestedTimestampT?: TimestampT,
        savedTimestampT?: TimestampT,
        returnedTimestampT?: TimestampT,
        executedTimestampT?: TimestampT,
        abortedTimestampT?: TimestampT,
    }

    // 
    export type FormInstanceT = NodeInstanceT & {
        accessesT: FormAccessT[],           // users access form
        statusE: FormStatusE,
        currentUserEmailT: EmailT,          // easy access to last user (db filtering)
        tempDataItemsT: DataInstanceT[],        // when user saves form for later
    };
    export type AtLeastFormInstanceT = AtLeast<FormInstanceT, typeof NodeConfigPK | typeof FlowInstancePK>;


    ////// the flow configuration

    //// configuration settings for a flow type
    export const FlowConfigPK = "flowNameIdT";
    export type FlowConfigT = {
        [FlowConfigPK]: NameT,              // flow name
        startFormNameT: NameT,                  // kick start data input as contained in form
        dataConfigsT: DataConfigT[],        // every data item has its own data/validation
        htmlConfigsT: HTMLConfigT[],        // 
        formConfigsT: FormConfigT[],        // all the forms in this flow
        taskConfigsT: TaskConfigT[],        // all the form widgets in this flow
    };

    //// status of a flow instance
    export enum FlowStatusE {
        OPEN,                               // flow is active
        CLOSED,                             // normal closing of flow
        ABORTED,                            // flow (sub everything) can be aborted by a supervisor/admin
    }

    //// activity and other notes occuring on a flow instance
    export type LogItemT = {
        timestamp: TimestampT,
        description: DescriptionT,
        credential: CredentialT,            // who was active when log generated
        form?: {                           // for form related logs
            instanceId: InstanceIdT,        // for instance id
            formData: DataInstanceT[],          // data received from a form
        },
    }

    //// flow-instance spawned by respective flow-config
    export const FlowInstancePK = "flowInstanceIdT";
    export type FlowInstanceT = {
        [FlowInstancePK]: InstanceIdT,
        [FlowConfigPK]: NameT,                        // form-config name that spawned this instance
        timestamps: {
            createdT: TimestampT,
            closedT?: TimestampT,
            abortedT?: TimestampT,
        },
        logItemsT: LogItemT[],
        dataItemsT: DataInstanceT[],
        statusE: FlowStatusE,
    };
    export type AtLeastFlowInstance = AtLeast<FlowInstanceT, typeof FlowConfigPK>;


    //// this part defines the execution pipeline for user service requests

    export enum APIRequestE {
        FETCH_FLOW,
        START_FLOW,
        ABORT_FLOW,
        SELECT_FORM,
        RETURN_FORM,
        SAVE_FORM,
        SUBMIT_FORM,
    }

    //// context created for all work flow operations
    //// required objects are created here as required and the response as well
    export type ContextT = {
        userEmail?: EmailT,                 // optional calling user, maybe a public user
        // one of these two must be present
        formInstanceId?: InstanceIdT,       // needed for task specific actions
        flowName?: NameT,                   // needed for flow start actions

        formName?: NameT,
        dataItems?: DataInstanceT[],            // needed for all form submissions
        credential?: Credential,            // created 
        // flowConfig?: FlowConfig,            // created if needed 
        // flowInstance?: FlowInstance,        // created if needed
        // formInstance?: FormInstance,        // created if needed
        response?: ResponseT,
    }

    //// pipeline executes sequence of functions of type Action
    //// at each action conclusion, if the response contains an "error" => abort
    export type Action = (context: ContextT) => void;


    ////// response object received by clients
    export type ResponseT = {
        error?: AuditCauseT[],              // if errors occurred
        form?: {
            formTitleT: TitleT,
            formSegmentsT: FormSegmentT[],   // provides form structure and elements
            htmlConfigsT: HTMLConfigT[],     // element structure to render
            dataConfigsT: DataConfigT[],     // the forms data elements and data validation
            dataInstancesT: DataInstanceT[], // forms data values if available
        },
    }



}
