
import { OceanFlow as t } from "./types";
import { OceanFlow as a } from "./audit";
import { OceanFlow as s } from "./security";


export namespace OceanFlow {

    export function TimestampStr(): t.TimestampT {
        return new Date().toISOString();
    }

    export function RandomStr(len: t.IntegerT = 40): string {
        return "";
    }

    export function ArrayIntersection(array1: string[], array2: string[]): string[] {
        return array1.filter(x => array2.includes(x));
    }


    export function assertAuthorized(credential: s.Credential, rolesT: t.NameT[], payloadT: t.JSONObjectT): t.AuditCauseT[] {
        const result: t.AuditCauseT[] = [];
        const commonRoles = ArrayIntersection(rolesT, credential.hasRoles());
        if (commonRoles.length == 0) {
            const auditCause: t.AuditCauseT = {
                descriptionT: "unauthorized user",
                payloadT: credential.loadPayload(payloadT),
            };
            a.AuditReport.saveReport(credential, auditCause);
            result.push(auditCause);
        };
        return result;
    }

}
