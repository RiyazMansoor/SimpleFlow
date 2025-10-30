
import { OceanFlow as t } from "./types";
import { OceanFlow as b } from "./business";
import { OceanFlow as db } from "./store";


export namespace OceanFlow {

    /**
     * Convenient generic static method to save json objects.
     * @fsdb the database to query
     * @idT the value of the primary key the json data object
     * @dataT the json data object
     */
    function saveData<IdT, DataT>(fsdb: any, idT: IdT, dataT: DataT): void {
        db.dbSave(fsdb, idT, dataT);
    }

    /**
     * Convenient generic static method to load json objects.
     * @fsdb the database to query
     * @idT the value of the primary key the json data object
     * @returns the json data object
     */
    function loadData<IdT, DataT>(fsdb: any, id: IdT): DataT | undefined {
        const dataT: DataT | undefined = db.dbLoad(fsdb, id);
        return dataT;
    }

    /**
     * Convenient generic static method to load class objects.
     * @fsdb the database to query
     * @idT the value of the primary key the json data object
     * @returns the class object representing the json data object
     */
    export function loadInstance<TId, DataT, Class>(fsdb: any, id: TId, clazz: t.Constructor<Class, DataT>): Class | undefined {
        const dataT: DataT | undefined = loadData(fsdb, id);
        if (dataT) {
            return new clazz(dataT);
        }
        return undefined;
    }


    //// interface for type LoggableT

    export function log(loggableT: t.LoggableT, descriptionT: t.DescriptionT, userT: t.UserT, payloadT: t.JSONObjectT = {}): void {
        const logT: t.LogT = {
            timestampedT: timestampStr(),
            descriptionT: descriptionT,
            [t.PropUser]: userT,
            payloadT: payloadT,
        };
        loggableT[t.PropLogs].push(logT);
    }

    //// interface for type SaveableT

    export function save(fsdb: any, saveableT: t.SaveableT, saveKey: string): void {
        saveableT[t.PropSaved].push(timestampStr());
        saveData(fsdb, saveKey, saveableT);
    }

    //// interface for type CloseableT

    export function isClosed(closeable: t.CloseableT): boolean {
        return closeable[t.PropClosed];
    }

    export function close(closeable: t.CloseableT,): void {
        closeable[t.PropClosed] = true;
    }

    export function freeze(closeable: t.CloseableT): void {
        if (isClosed(closeable)) {
            Object.freeze(closeable);
        };
    }

    //// interface for type EnableableT

    export function isEnabled(enableable: t.EnableableT): boolean {
        return enableable[t.PropEnabled];
    }

    export function enable(enableable: t.EnableableT, status: boolean): void {
        enableable[t.PropEnabled] = status;
    }

    //// interface for type SecurableT

    export function allowedRoleNamesT(securableT: t.SecurableT): t.NameT[] {
        return securableT[t.PropSecured];
    }

    //// interface for type SecurableT

    export function availableRoleNamesT(AuthorizerT: t.AuthorizerT): t.NameT[] {
        return AuthorizerT[t.PropAuthorized];
    }

    //// interface for type AuthorizerT

    export function addauthorisedRole(AuthorizerT: t.AuthorizerT, roleNameIdT: t.NameT): void {
        const index = AuthorizerT[t.PropAuthorized].indexOf(roleNameIdT);
        if (index < 0) {
            AuthorizerT[t.PropAuthorized].push(roleNameIdT);
        };
    }

    export function removeSecureRole(AuthorizerT: t.AuthorizerT, roleNameIdT: t.NameT): void {
        const index = AuthorizerT[t.PropAuthorized].indexOf(roleNameIdT);
        if (index >= 0) {
            AuthorizerT[t.PropAuthorized].splice(index, 1);
        };
    }

    export function isAuthorised(authorizerT: t.AuthorizerT, allowedRoleNamesIdT: t.NameT[]): boolean {
        const availableRoleNamesT: t.NameT[] = authorizerT[t.PropAuthorized];
        for (const roleName of allowedRoleNamesIdT) {
            if (availableRoleNamesT.includes(roleName)) {
                return true;
            };
        };
        return false;
    }



    //// interface for type NodeConfigT

    export function createGraphNodes(nodeInstanceT: t.NodeInstanceT, allNodeConfigsT: t.NodeConfigT[], flowDataValuesT: t.DataValueT[]): void {
        // if node is not closed - it must not create nodes
        if (!isClosed(nodeInstanceT)) {
            return;
        };
        // find this node config for this node instance
        // startup diagnostics should ensure that this node config exists
        const thisNodeConfigT: t.NodeConfigT = allNodeConfigsT.find((aNodeConfigT) => {
            return aNodeConfigT[t.NodeNamePK] === nodeInstanceT[t.NodeNamePK];
        }) as t.NodeConfigT;
        // spawning process beings here
        for (const nextNodeNameT of thisNodeConfigT.nextNodeNameIdsT) {
            // find next node config for this node instance
            // startup diagnostics should ensure that this node config exists
            const nextNodeConfigT: t.NodeConfigT = allNodeConfigsT.find((aNodeConfigT) => {
                return aNodeConfigT[t.NodeNamePK] === thisNodeConfigT[t.NodeNamePK];
            }) as t.NodeConfigT;
            // if predicate fails - stop this branch execution here
            if (nodePredicateSuccess(nextNodeConfigT, flowDataValuesT)) {
                // TODO: log this ?
                continue;
            };
            switch (nextNodeConfigT.nodeTypeE) {
                case t.NodeTypeE.FORM:
                    const atLeastFormInstanceT: t.AtLeastFormInstanceT = {
                        [t.NodeNamePK]: nextNodeConfigT[t.NodeNamePK],
                        [t.FlowInstancePK]: nodeInstanceT[t.FlowInstancePK],
                    };
                    const formInstanceT: t.FormInstanceT = t.defFormInstanceT(atLeastFormInstanceT);
                    saveData(db.dbFormInstances, formInstanceT[t.NodeInstancePK], formInstanceT);
                    break;
                case t.NodeTypeE.TASK:
                    const atLeastTaskInstanceT: t.AtLeastTaskInstanceT = {
                        [t.NodeNamePK]: nextNodeConfigT[t.NodeNamePK],
                        [t.FlowInstancePK]: nodeInstanceT[t.FlowInstancePK],
                    };
                    const taskInstanceT: t.TaskInstanceT = t.defTaskInstanceT(atLeastTaskInstanceT);
                    saveData(db.dbTaskInstances, taskInstanceT[t.NodeInstancePK], taskInstanceT);
                    // immediate task execution (upload) and create next nodes if successful
                    b.actionTaskUpload(taskInstanceT);
                    if (isClosed(taskInstanceT)) {
                        createGraphNodes(taskInstanceT, allNodeConfigsT, flowDataValuesT);
                    };
                    break;
                default:
                // error
            };
        };
    }

    // private graph-node function
    function nodePredicateSuccess(nodeConfigT: t.NodeConfigT, flowDataValuesT: t.DataValueT[]): boolean {
        // TODO : implement predicate evaluation
        return true;
    }

    //// support/convenience functions

    export function toAuditCause(descriptionT: t.DescriptionT, payloadT: t.JSONObjectT): t.AuditCauseT {
        const causeT: t.AuditCauseT = {
            descriptionT: descriptionT,
            payloadT: payloadT,
        };
        return causeT;
    }

    export function toAuditReview(userT: t.UserT, descriptionT: t.DescriptionT): t.AuditReviewT {
        const reviewT: t.AuditReviewT = {
            timestampedT: timestampStr(),
            [t.PropUser]: userT,
            descriptionT: descriptionT,
        };
        return reviewT;
    }

    //// common/util functions

    /**
     * @returns the ISO formatted current timestamp
     */
    export function timestampStr(): t.TimestampT {
        return new Date().toISOString();
    }

    /**
     * @param len length of the random string - default 40
     * @returns random string
     */
    export function randomStr(len: t.IntegerT = 40): string {
        let rstr = "";
        while (rstr.length < len) {
            rstr += Math.random().toString(36).substring(2, 12);
        };
        return rstr.substring(0, 40);
    }


}
