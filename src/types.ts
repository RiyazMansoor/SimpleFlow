
// This file contains the type definitions for the application
// and the data structures used in the application.

import { OceanFlow as f } from "./functions";

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
    // export type HtmlT = string;
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


    ////// shared properties

    export const PropTitled = "titledT";
    // the property name for user identity
    export const PropUser = "userT";
    // the property name for timestamped log items
    export const PropLogs = "logsT";
    export const PropSaved = "savesT";
    // the property name for a closeable entity
    export const PropClosed = "closedT";
    // the property name for a enableable entity
    export const PropEnabled = "enabledT";
    // an entity that has security roles to access it
    export const PropSecured = "securedRoleNamesT";
    // an entity that has security roles to access it
    export const PropAuthorized = "authorizedRoleNamesT";

    export const RoleNamePK = "roleNameIdT";
    export const LoginEmailPK = "emailIdT";
    export const AuditReportPK = "auditReportInstanceIdT";

    export const DataNamePK = "dataNameIdT";
    export const FlowNamePK = "flowNameIdT";
    export const FlowInstancePK = "flowInstanceIdT";
    export const NodeNamePK = "nodeNameIdT";
    export const NodeInstancePK = "nodeInstanceIdT";

    ////// shared types

    // commonly used title and description for different entities
    export type TitleT = {
        titleT: LabelT,
        descriptionT: DescriptionT,
    };

    // user identity for identification and logging
    export type UserT = {
        emailIdT: EmailT,
        nameT: NameT,
    };

    // log item for auditing and logging
    export type LogT = {
        timestampedT: TimestampT,
        descriptionT: DescriptionT,
        [PropUser]: UserT,
        payloadT?: JSONObjectT,         // relevant data payload for this item
    };


    // the base type for all data objects with 
    export type EntityT = {
    };

    // an entity that is closeable to further edits
    export type CloseableT = {
        [PropClosed]: boolean,
    };

    // an entity that can be enabled or disabled
    export type EnableableT = {
        [PropEnabled]: boolean,
    };

    export type LoggableT = {
        [PropLogs]: LogT[],
    };

    export type SaveableT = {
        [PropSaved]: TimestampT[],
    };

    export type TitledT = {
        [PropTitled]: TitleT,
    };

    export type SecurableT = {
        [PropSecured]: NameT[],
    };

    export type AuthorizerT = {
        [PropAuthorized]: NameT[],
    };


    // export type SecurableEntityT = EntityT & SecurableT;


    ////// security - roles, logins, credentials and audits

    // roles that provide access to the system
    export type RoleT = EntityT & SaveableT & EnableableT & {
        [RoleNamePK]: NameT,
        descriptionT: DescriptionT,
    };
    export type AtLeastRoleT = AtLeast<RoleT, typeof RoleNamePK | "descriptionT">
    export function defRoleT(atLeastRoleT: AtLeastRoleT): RoleT {
        const dataT: RoleT = {
            [RoleNamePK]: atLeastRoleT[RoleNamePK],
            descriptionT: atLeastRoleT.descriptionT,
            [PropSaved]: atLeastRoleT[PropSaved] ?? [],
            [PropEnabled]: atLeastRoleT[PropEnabled] ?? true,
        };
        return dataT;
    };

    // user login access - passwords must be hashed securely
    export type LoginT = EntityT & SaveableT & {
        [LoginEmailPK]: EmailT,
        passwordT: PasswordT,
        oldPasswordsT: PasswordT[],
    };
    export type LeastLoginT = AtLeast<LoginT, typeof LoginEmailPK | "passwordT">;
    export function defLoginT(atLeastLoginT: LeastLoginT): LoginT {
        const dataT: LoginT = {
            [LoginEmailPK]: atLeastLoginT[LoginEmailPK],
            passwordT: atLeastLoginT.passwordT,
            oldPasswordsT: atLeastLoginT.oldPasswordsT ?? [],
            [PropSaved]: atLeastLoginT[PropSaved] ?? [],
        };
        return dataT;
    };


    // user access credentials/roles to perform authorized functions
    export type CredentialT = EntityT & EnableableT & SaveableT & AuthorizerT & {
        [LoginEmailPK]: NameT,
        userNameT: NameT,
    };
    export type LeastCredentialT = AtLeast<CredentialT, typeof LoginEmailPK | "userNameT">
    export function defCredentialT(atLeastCredentialT: LeastCredentialT): CredentialT {
        const dataT: CredentialT = {
            [LoginEmailPK]: atLeastCredentialT[LoginEmailPK],
            userNameT: atLeastCredentialT.userNameT,
            [PropAuthorized]: atLeastCredentialT[PropAuthorized] ?? [],
            [PropEnabled]: atLeastCredentialT[PropEnabled] ?? true,
            [PropSaved]: atLeastCredentialT[PropSaved] ?? [],
        };
        return dataT;
    };

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
        descriptionT: DescriptionT,         // short description of this review
        [PropUser]: UserT,
    };

    // an audit report - comprises of
    // stack trace
    // one or more  related causes
    // one or more staff reviews and closure
    export type AuditReportT = EntityT & CloseableT & SaveableT & {
        timestampedT: TimestampT,
        [AuditReportPK]: InstanceIdT,
        [PropUser]: UserT,
        typeE: AuditTypeE,
        stack: DescriptionT,
        causesT: AuditCauseT[],
        reviewsT: AuditReviewT[],
    };
    export type LeastAuditReportT = AtLeast<AuditReportT, typeof PropUser>;
    export function defAuditReportT(atLeastAuditReportT: LeastAuditReportT): AuditReportT {
        const auditReportT: AuditReportT = {
            timestampedT: atLeastAuditReportT.timestampedT ?? f.timestampStr(),
            [AuditReportPK]: atLeastAuditReportT[AuditReportPK] ?? f.randomStr(),
            [PropUser]: atLeastAuditReportT[PropUser],
            typeE: atLeastAuditReportT.typeE ?? AuditTypeE.ERROR,
            stack: atLeastAuditReportT.stack ?? "",
            causesT: atLeastAuditReportT.causesT ?? [],
            reviewsT: atLeastAuditReportT.reviewsT ?? [],
            [PropClosed]: atLeastAuditReportT[PropClosed] ?? false,
            [PropSaved]: atLeastAuditReportT[PropSaved] ?? [],
        };
        return auditReportT;
    };


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
    export type DataConfigT = {
        [DataNamePK]: NameT,
        dataTypeE: DataTypeE,
        validations?: ValidationT,          // validations can be optional
    };

    //// a user data entry - used throughout this application
    //// name must match respective data-config
    export type DataValueT = {
        [DataNamePK]: NameT,
        dataValue: string | number | boolean,
    };


    ////// nodes on the flow graph

    // there could be many types of nodes
    export enum NodeTypeE {
        FORM,                                   // a form node - user input
        TASK,                                   // a task node - system work
    };

    // a node configuration on the flow graph
    export type NodeConfigT = EntityT & SecurableT & {
        [NodeNamePK]: NameT,                  // name of node - eg: form-name or job-name
        [FlowNamePK]: NameT,                  // name of flow-config that spawned this node
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
    export type NodeInstanceT = EntityT & CloseableT & {
        timestampedT: TimestampT,
        [NodeInstancePK]: InstanceIdT,          // unique id for this node instance
        [NodeNamePK]: NameT,
        [FlowInstancePK]: InstanceIdT,
        [PropSaved]: TimestampT[],              // when this node was saved
    };
    export type AtLeastNodeInstanceT = AtLeast<NodeInstanceT, typeof NodeNamePK | typeof FlowInstancePK>;

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
    export type AtLeastTaskInstanceT = AtLeast<TaskInstanceT, typeof NodeNamePK | typeof FlowInstancePK>;
    export function defTaskInstanceT(atLeastTaskInstanceT: AtLeastTaskInstanceT): TaskInstanceT {
        const taskInstanceT: TaskInstanceT = {
            timestampedT: atLeastTaskInstanceT.timestampedT ?? f.timestampStr(),
            [NodeInstancePK]: atLeastTaskInstanceT[NodeInstancePK] ?? f.randomStr(),
            [NodeNamePK]: atLeastTaskInstanceT[NodeNamePK],
            [FlowInstancePK]: atLeastTaskInstanceT[FlowInstancePK],
            [PropClosed]: atLeastTaskInstanceT[PropClosed] ?? false,
            [PropSaved]: atLeastTaskInstanceT[PropSaved] ?? [],
            attemptsT: atLeastTaskInstanceT.attemptsT ?? [],
            statusE: atLeastTaskInstanceT.statusE ?? TaskStatusE.OPEN,
        };
        return taskInstanceT;
    };



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
    export type AtLeastFormInstanceT = AtLeast<FormInstanceT, typeof NodeNamePK | typeof FlowInstancePK>; // TODO keyof NodeInstanceT
    export function defFormInstanceT(atLeastFormInstanceT: AtLeastFormInstanceT): FormInstanceT {
        const formInstanceT: FormInstanceT = {
            timestampedT: atLeastFormInstanceT.timestampedT ?? f.timestampStr(),
            [NodeInstancePK]: atLeastFormInstanceT[NodeInstancePK] ?? f.randomStr(),
            [NodeNamePK]: atLeastFormInstanceT[NodeNamePK],
            [FlowInstancePK]: atLeastFormInstanceT[FlowInstancePK],
            [PropClosed]: atLeastFormInstanceT[PropClosed] ?? false,
            [PropSaved]: atLeastFormInstanceT[PropSaved] ?? [],
            accessesT: atLeastFormInstanceT.accessesT ?? [],
            currentUserEmailT: atLeastFormInstanceT.currentUserEmailT ?? "",
            tempDataItemsT: atLeastFormInstanceT.tempDataItemsT ?? [],
            statusE: atLeastFormInstanceT.statusE ?? FormStatusE.CREATED,
        };
        return formInstanceT;
    };


    ////// the flow configuration

    //// configuration settings for a flow type
    export type FlowDesignT = EntityT & {
        [FlowNamePK]: NameT,                  // flow name
        startFormNameT: NameT,                  // kick start data input as contained in form
        dataConfigsT: DataConfigT[],        // every data item has its own data/validation
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


    export type FlowConfigT = {
        [FlowNamePK]: NameT,                    // flow name
        startFormNameT: NameT,                  // kick start data input as contained in form
        dataConfigsT: {
            [dataNamePK: NameT]: DataConfigT
        },
        nodeConfigsT:  {
            [nodeNamePK: NameT]: NodeConfigT
        }, 
    };
    export const FlowConfigs: { [flowNamePK: NameT]: FlowConfigT } = {};


    //// activity and other notes occuring on a flow instance
    // export type LogItemT = {
    //     timestamp: TimestampT,
    //     description: DescriptionT,
    //     credential: CredentialT,                // who was active when log generated
    //     form?: {
    //         instanceId: InstanceIdT,
    //         formData: DataValueT[],          // data received from a form
    //     },
    // };

    //// flow-instance spawned by respective flow-config
    export type FlowInstanceT = EntityT & {
        [FlowInstancePK]: InstanceIdT,      // unique id for this flow instance
        [FlowNamePK]: NameT,                        // form-config name that spawned this instance
        timestamps: {
            createdT: TimestampT,
            closedT?: TimestampT,
            abortedT?: TimestampT,
        },
        [PropLogs]: LogT[],
        dataItemsT: DataValueT[],
        statusE: FlowStatusE,
    };
    export type AtLeastFlowInstanceT = AtLeast<FlowInstanceT, typeof FlowNamePK>;


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
            dataPropertiesT: DataConfigT[], // the forms data elements and data validation
            dataValuesT: DataValueT[],          // forms data values if available
        },
    };

}
