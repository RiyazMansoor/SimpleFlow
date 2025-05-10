
import { OceanFlow as u } from "./utils";
import { OceanFlow as t } from "./types";
import { OceanFlow as s } from "./security";
import { OceanFlow as c } from "./core";
import { OceanFlow as db } from "./store";


export namespace OceanFlow {


    export class AuditReport extends c.Instance<t.InstanceIdT, t.AuditReportT> {


        constructor(auditReportT: t.AtLeastAuditReport) {
            const dataT: t.AuditReportT = {
                timestampedT: auditReportT.timestampedT ?? u.TimestampStr(),
                [t.AuditReportPK]: auditReportT[t.AuditReportPK] ?? u.RandomStr(),
                auditTypeE: auditReportT.auditTypeE ?? t.AuditTypeE.INFO,
                credentialT: auditReportT.credentialT,
                stack: auditReportT.stack ?? "",
                auditCausesT: auditReportT.auditCausesT ?? [],
                auditReviewsT: auditReportT.auditReviewsT ?? [],
                closed: auditReportT.closed ?? false,
            };
            if (!dataT.stack) {
                Error.captureStackTrace(dataT, AuditReport);
            }
            super(t.AuditReportPK, db.dbSaveAuditReport, dataT);
            this.freeze(this.isClosed());
        }

        static getInstance(instanceId: t.InstanceIdT): AuditReport | undefined {
            return super.loadInstance(instanceId, db.dbLoadAuditReport, AuditReport);
        }

        addCauses(...auditCausesT: t.AuditCauseT[]): AuditReport {
            this.dataT.auditCausesT.push(...auditCausesT);
            return this;
        }

        addReveiw(auditReveiwT: t.AuditReviewT): AuditReport {
            this.dataT.auditReviewsT.push(auditReveiwT);
            return this;
        }

        isClosed(): boolean {
            return this.dataT.closed;
        }

        close(): AuditReport {
            this.dataT.closed = true;
            this.freeze(this.isClosed());
            return this;
        }

        static toCause(descriptionT: t.DescriptionT, payloadT: t.JSONObjectT): t.AuditCauseT {
            const causeT: t.AuditCauseT = {
                descriptionT: descriptionT,
                payloadT: payloadT,
            };
            return causeT;
        }

        static toReview(credentialT: t.CredentialT, descriptionT: t.DescriptionT): t.AuditReviewT {
            const reviewT: t.AuditReviewT = {
                timestampedT: u.TimestampStr(),
                credentialT: credentialT,
                descriptionT: descriptionT,
            };
            return reviewT;
        }

        static saveReport(credential: s.Credential, ...auditCausesT: t.AuditCauseT[]): void {
            const payload = { credentialT: null };
            new AuditReport(credential.loadPayload(payload)).addCauses(...auditCausesT).save();
        }

    }

}