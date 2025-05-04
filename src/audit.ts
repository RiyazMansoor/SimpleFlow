
import * as u from "./utils";
import * as t from "./types";
import { OBaseInstance } from "./base";
import { TCredential } from "./access";
import { dbLoadError, dbSaveError } from "./store";


////// system audit management => includes logs and errors

// levels of audit
export enum EAuditType {
    INFO = "info",                      // for info - reviews are not required
    ERROR = "error",                    // staff must review and the close
}

// a single audit can contain may related auditable items
export type TAuditCause = {
    description: t.TDescription,        // short description of this item
    payload: t.JSONObject,              // relevant data payload for this item
}

// an audit generally requires staff review and closure
export type TAuditReview = {
    timestamp: t.TTimestamp,
    credential: TCredential,            // user making the followup
    description: t.TDescription,        // short description of this review
}

// an audit report - comprises of
// possibly multiple related causes
// possible multiple staff reviews and closure
export type TAuditReport = {
    timestamp: t.TTimestamp,
    instanceId: t.TInstanceId,
    type: EAuditType,
    credential: TCredential,
    causes: TAuditCause[],
    reviews: TAuditReview[],
    closed: boolean,
}


export class OAuditReport extends OBaseInstance<t.TInstanceId, TAuditReport> {


    constructor(auditReport: t.AtLeast<TAuditReport, "credential">) {
        const etype = auditReport.type ?? EAuditType.INFO;
        const data: TAuditReport = {
            instanceId: auditReport.instanceId ?? u.RandomStr(20),
            type: auditReport.type ?? EAuditType.INFO,
            timestamp: auditReport.timestamp ?? u.TimestampStr(),
            credential: auditReport.credential,
            causes: auditReport.causes ?? [],
            reviews: auditReport.reviews ?? [],
            closed: auditReport.closed ?? false,
        };
        super("instanceId", dbSaveError, data);
        this.freeze();
    }

    setCredential(credential: TCredential): void {
        this.data.credential = credential;
    }

    addCause(errorIssue: TAuditCause): OAuditReport {
        this.data.causes.push(errorIssue);
        return this;
    }

    getCauses(): TAuditCause[] {
        return this.data.causes;
    }

    addFollowup(errorFollowup: TAuditReview): OAuditReport {
        this.data.reviews.push(errorFollowup);
        return this;
    }

    isClosed(): boolean {
        return this.data.closed;
    }

    setClosed(): OAuditReport {
        this.data.closed = true;
        this.freeze();
        return this;
    }

    public static getInstance(errorId: t.TInstanceId): OAuditReport | undefined {
        return super.loadInstance(errorId, dbLoadError, OAuditReport);
    }

}

function missing(credential: TCredential, payload: t.JSONObject, description: t.TDescription): TAuditCause[] {
    const auditCause: TAuditCause = {
        description: description,
        payload: {},
    };
    Error.captureStackTrace(auditCause.payload, missing);
    const auditReport: OAuditReport = new OAuditReport({ credential: credential }).addCause(auditCause);
    auditReport.save();
    return auditReport.getCauses();

}

export function MissingFlow(credential: TCredential, payload: t.JSONObject): TAuditCause[] {
    const description: t.TDescription = `flow [${payload.flowName}] not found`;
    return missing(credential, payload, description);
}

export function MissingRole(credential: TCredential, payload: t.JSONObject): TAuditCause[] {
    const description: t.TDescription = `required user role is missing in flow [${payload.flowName}]`;
    return missing(credential, payload, description);
}
