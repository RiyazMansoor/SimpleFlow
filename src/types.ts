
// This file contains the type definitions for the application
// and the data structures used in the application.



export namespace OceanFlow {

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
    export type AtLeastRole = AtLeast<RoleT, typeof RolePK | "descriptionT">

    // user login access
    export const LoginPK = "loginEmailIdT";
    export type LoginT = {
        [LoginPK]: EmailT,                     // primary key
        passwordT: PasswordT,               // stored in hashed form
    };
    export type AtLeastLogin = AtLeast<LoginT, typeof LoginPK | "passwordT">;

    // active roles a user has
    export const CredentialPK = "credentialEmailIdT";
    export type CredentialT = {
        [CredentialPK]: EmailT,                     // primary key
        [LoginPK]: NameT,                       // from TUser
        hasRoleNamesT: NameT[],             // from TRole
        enabled: boolean,
        updatedT: TimestampT[],             // list of last updated timestamps
    };
    export type AtLeastCredential = AtLeast<CredentialT, typeof CredentialPK | typeof LoginPK>

    // this credential is used for public available services
    export const PublicCredential: CredentialT = {
        [CredentialPK]: "public@flow.com",
        [LoginPK]: "Public User",
        hasRoleNamesT: ["public"],
        enabled: true,
        updatedT: [],
    };
    Object.freeze(PublicCredential);

    // this credential is used for system internal services
    export const SystemCredential: CredentialT = {
        [CredentialPK]: "system@flow.com",
        [LoginPK]: "System User",
        hasRoleNamesT: ["system"],
        enabled: true,
        updatedT: [],
    };
    Object.freeze(SystemCredential);



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
    // possibly multiple related causes
    // possible multiple staff reviews and closure
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
    export type AtLeastAuditReport = AtLeast<AuditReportT, "credentialT">;


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

    //// supported data types 
    export enum DataTypeE {
        INTEGER,
        DECIMAL,
        DATE,
        TIME,
        TIMESTAMP,
        EMAIL,
        PASSWORD,
    }

    //// configuration of data items in the flow
    //// name is used as an unique identifier in flow
    //// data validations are specified here
    export const DataConfigPK = "dataNamePK";
    export type DataConfigT = {
        [DataConfigPK]: NameT,
        dataType: DataTypeE,
        validations?: ValidationT,
    }

    //// a data item used throughout
    //// name must matches respective data-config
    export type DataItemT = {
        [DataConfigPK]: NameT,
        dataValue: string | number | boolean,
    }


    ////// being form render specification

    //// rendering widget - typically html
    export enum WidgetTypeE {
        EMAIL,
        TEXT,
        TEXTAREA,
        DROPDOWN,
        LISTBOX,
        RADIOBUTTONS,
        CHECKBOXES,
    }

    //// the width of the widget - allows multiple widgets on a line
    export enum WidgetWidthE {
        FULL,
        HALF,
        THIRD,
        TWOTHIRD,
        FOURTH,
        THREEFOURTH,
        REST,
    }

    //// how the widget is rendered
    export enum WidgetAccessE {
        ENABLED,
        DISABLED,
        HIDDEN,
    }

    export const WidgetConfigPK = "widgetNameIdT";
    export type WidgetConfigT = {
        [WidgetConfigPK]: NameT,
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
            widgetTypeE: WidgetTypeE,
            widgetWidthE: WidgetWidthE,
            list?: [NameT, string][],
        },
    };
    export const ParagraphWidgetConfigT: WidgetConfigT = {
        [WidgetConfigPK]: "paragraph",
        paragraph: true,
    };

    export type WidgetDisplay = {
        [WidgetConfigPK]: NameT,
        display: WidgetAccessE,
    };
    export type GroupingConfigT = {
        groupingNameT: NameT,
        widgetNamesT: WidgetDisplay[],
    };

    export type FormConfigT = {
        formNameT: NameT,
        groupingNamesT: GroupingConfigT[],
    }



    // every data-item is render settings
    // export type ViewConfigT = {
    //     forms: {
    //         nameT: NameT,                   // same as form-name
    //         accessE: WidgetAccessE,         // if editable is a/are flow saved fields
    //         isFlowData: boolean,            // indicator that this/these are flow saved fields
    //     }[],
    //     // pre built component with multiple widgets that can map multiple fields
    //     component?: {
    //         groupNameT: NameT,              // a grouping flag when displayed
    //         componentNameT: NameT,          // name of the pre-built component
    //         dataNames: NameT[],             // todo - how to match component fields
    //     },
    //     // a single widget for a single field
    //     custom?: {
    //         groupNameT: NameT,
    //         dataName: NameT,                // name of the data-item
    //         defaultValue?: string,          // a default value to render
    //         labelT: NameT,                  // label displayed for this field
    //         widgetTypeE: WidgetTypeE,
    //         widgetWidthE: WidgetWidthE,
    //         //        list?: KeyValue[],
    //     },
    // }


    ////// nodes on the flow graph

    // there could be many types of nodes
    export enum NodeTypeE {
        FORM,
        JOB,
    };

    export const NodeConfigPK = "nodeNameIdT";
    export type NodeConfigT = {
        [NodeConfigPK]: NameT,              // name of node - eg: form-name or job-name
        flowNameIdT: NameT,
        nodeTypeE: NodeTypeE,               // type of node
        predExpressionT: ExpressionT,       // boolean expression to proceed or not    
        roleNamesT: NameT[],                // authorised roles for this node
        nextNodesT: NodeConfigT[],          // multpe nodes may follow
    };

    ////// Jobs - a node type executed by the system


    //// the status of a job
    export enum JobStatusE {
        OPEN,           // job has been created - an active state
        CLOSED,         // job has been completed and closed normally
        SKIPPED,        // a human intervention - skips the job and moves next
    }

    export type JobAttemptsT = {
        timestamped: TimestampT,
        result: DescriptionT,
    }

    export const JobInstancePK = "jobInstanceIdT";
    export type JobInstanceT = {
        timestampedT: TimestampT,
        [NodeConfigPK]: NameT,
        [JobInstancePK]: InstanceIdT,
        flowInstanceIdT: InstanceIdT,       // flow-instance this form belongs to
        flowNameT: NameT,                   // quick access flow-name
        attemptsT: JobAttemptsT[],           // users access form
        statusE: JobStatusE,
    };
    export type AtLeastJobInstance = AtLeast<JobInstanceT, typeof NodeConfigPK | "flowInstanceIdT">;


    //// begin form specification
    //// a form is a unit of work that a user performs part of a workflow
    //// a form definition defines the work to be done

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
    export const FormInstancePK = "formInstanceIdT";
    export type FormInstanceT = {
        timestampedT: TimestampT,
        [FormInstancePK]: InstanceIdT,
        flowInstanceIdT: InstanceIdT,       // flow-instance this form belongs to
        flowNameT: NameT,                   // quick access flow-name
        nodeConfigT: NodeConfigT,           // a copy of form-config hardcorded on creation
        formNameT: NameT,
        accessesT: FormAccessT[],           // users access form
        statusE: FormStatusE,
        currentUserEmailT: EmailT,          // easy access to last user (db filtering)
        tempDataItemsT: DataItemT[],        // when user saves form for later
    }
    export type AtLeastFormInstance = AtLeast<FormInstanceT, "nodeConfigT" | "flowInstanceIdT" | "flowNameT">;


    ////// the flow configuration

    //// configuration settings for a flow type
    export type FlowConfigT = {
        flowNameT: NameT,                       // flow name
        roleNamesT: NameT[],                // roles that can start the flow
        start: {
            formNameT: NameT,              // kick start data input as contained in form
            nextNodesT: NodeConfigT[],
        },
        dataConfigsT: DataConfigT[],        // every data item has its own data/validation
        // viewConfigsT: ViewConfigT[],        // every data item has its won view/rendering
        nodeConfigsT: NodeConfigT[],        // user input tasks 
    }

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
            formData: DataItemT[],          // data received from a form
        },
    }

    //// flow-instance spawned by respective flow-config
    export type FlowInstanceT = {
        instanceIdT: InstanceIdT,
        nameT: NameT,                        // form-config name that spawned this instance
        timestamps: {
            createdT: TimestampT,
            closedT?: TimestampT,
            abortedT?: TimestampT,
        },
        logItemsT: LogItemT[],
        dataItemsT: DataItemT[],
        statusE: FlowStatusE,
    }


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
        dataItems?: DataItemT[],            // needed for all form submissions
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
        data?: {                            // of if screen rendering
            // viewConfigs: ViewConfigT[],
            dataConfigs: DataConfigT[],
            dataItems: DataItemT[],
        },
    }




}
