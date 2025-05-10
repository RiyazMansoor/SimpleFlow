
import * as u from "./utils";
import * as t from "./types";
import { Base } from "./core";
import { dbLoadFormInstance, dbSaveFormInstance } from "./store";


export class FormInstance extends Base<t.InstanceIdT, t.FormInstanceT> {


    constructor(formInstanceT: t.AtLeastFormInstance) {
        const dataT: t.FormInstanceT = {
            instanceIdT: formInstanceT.instanceIdT ?? u.RandomStr(),
            flowInstanceIdT: formInstanceT.flowInstanceIdT,
            flowNameT: formInstanceT.flowNameT,
            nodeConfigT: formInstanceT.nodeConfigT,
            formNameT: formInstanceT.nodeConfigT.nameT,
            timestampedT: formInstanceT.timestampedT ?? u.TimestampStr(),
            accessesT: formInstanceT.accessesT ?? [],
            statusE: formInstanceT.statusE ?? t.FormStatusE.CREATED,
            tempDataItemsT: formInstanceT.tempDataItemsT ?? [],
            currentUserEmailT: formInstanceT.currentUserEmailT ?? "",
        };
        super("instanceId", dbSaveFormInstance, dataT);
    }

    static getInstance(roleName: t.NameT): FormInstance | undefined {
        return super.loadInstance(roleName, dbLoadFormInstance, FormInstance);
    }

    assertAuthorised(credentialT: t.CredentialT): t.AuditCauseT[] {
        const jsonObjectT: t.JSONObjectT = {
            flowName: this.dataT.flowNameT,
            flowInstanceId: this.dataT.flowInstanceIdT,
            formName: this.dataT.formNameT,
            formInstanceId: this.dataT.instanceIdT,
            neededFormRoles: this.dataT.nodeConfigT.roleNamesT,
        };
        return u.assertAuthorized(credentialT, this.dataT.nodeConfigT.roleNamesT, jsonObjectT);
    }

    flowInstanceId(): t.InstanceIdT {
        return this.dataT.flowInstanceIdT;
    }

    selected(credentialT: t.CredentialT): FormInstance {
        this.dataT.statusE = t.FormStatusE.SELECTED;
        const accessed: t.FormAccessT = {
            credentialT: credentialT,
            selectedTimestampT: u.TimestampStr(),
        }
        this.dataT.accessesT.push(accessed);
        this.update();
        return this;
    }

    returned(credentialT: t.CredentialT): FormInstance {
        this.dataT.statusE = t.FormStatusE.CREATED;
        const accessedT: t.FormAccessT = this.dataT.accessesT.slice(-1)[0];
        accessedT.returnedTimestampT = u.TimestampStr();

        return this;
    }

    requested(credentialT: t.CredentialT): FormInstance {
        this.dataT.accessesT.slice(-1)[0].requestedTimestampT = u.TimestampStr();
        // TODO
        return this;
    }

    submitted(credentialT: t.CredentialT): FormInstance {

        return this;
    }

    aborted(credentialT: t.CredentialT): FormInstance {
        this.dataT.statusE = t.FormStatusE.ABORTED;
        const accessedT: t.FormAccessT = {
            credentialT: credentialT,
            selectedTimestampT: u.TimestampStr(),
            abortedTimestampT: u.TimestampStr(),
        };
        this.dataT.accessesT.push(accessedT);
        return this;
    }

    private update(): void {
        this.dataT.accessesT = this.dataT.accessesT.slice(-10);
        this.dataT.currentUserEmailT = this.dataT.accessesT.slice(-1)[0].credentialT.emailT;
    }

}



