

import { OceanFlow as t } from "./types";
import { OceanFlow as s } from "./security";

export namespace OceanFlow {

    type FLoad<IdT, DataT> = (idT: IdT) => DataT | undefined;
    type FSave<IdT, DataT> = (idT: IdT, DataT: DataT) => void;
    type Constructor<Class, DataT> = new (dataT: DataT) => Class;


    export abstract class Base<IdT, DataT extends {}> {

        protected readonly idPropertyName: string;
        protected readonly dataT: DataT;

        constructor(idPropertyName: string, dataT: DataT) {
            this.idPropertyName = idPropertyName;
            this.dataT = dataT;
        }

        getId(): IdT {
            return this.dataT[this.idPropertyName];
        }

        // TODO - should not be used
        protected getData(): DataT {
            return this.dataT;
        }

        freeze(yes: boolean): void {
            if (yes) {
                Object.freeze(this);
            };
        }

    }

    export abstract class Instance<IdT, DataT extends {}> extends Base<IdT, DataT> {

        protected readonly fnSave: FSave<IdT, DataT>;

        constructor(idPropertyName: string, fnSave: FSave<IdT, DataT>, dataT: DataT) {
            super(idPropertyName, dataT);
            this.fnSave = fnSave;
        }

        save(): void {
            this.fnSave(this.getId(), this.dataT);
        }

        static loadData<IdT, DataT>(id: IdT, dbLoad: FLoad<IdT, DataT>): DataT | undefined {
            const dataT: DataT | undefined = dbLoad(id);
            return dataT;
        }

        static loadInstance<TId, DataT, Class>(id: TId, dbLoad: FLoad<TId, DataT>, clazz: Constructor<Class, DataT>): Class | undefined {
            const dataT: DataT | undefined = Instance.loadData(id, dbLoad);
            if (dataT) {
                return new clazz(dataT);
            }
            return undefined;
        }

    }

    export class Configs<IdT, DataT extends {}, Config extends Base<IdT, DataT>> {

        private configs: Map<IdT, Config> = new Map();

        constructor() {
            // empty private constructor - this is a singleton class
        }

        add(configs: Config[]): void {
            configs.forEach(config => this.configs.set(config.getId(), config));
        }

        get(idT: IdT): Config | undefined {
            return this.configs.get(idT);
        }

        clear(): void {
            this.configs.clear();
        }

        asArray(): Config[] {
            return Array.from(this.configs.values());
        }

    }

    class Context {

        private readonly contextT: t.ContextT;

        private readonly credential: s.Credential;

        private constructor(contextT: t.ContextT) {
            this.contextT = contextT;
            // checking user-id (emailIdT)
            const credentialEmailIdT: t.EmailT = contextT[t.CredentialPK];
            if (credentialEmailIdT) {
                const temp = s.Credential.getInstance(credentialEmailIdT);
                if (temp) {
                    this.credential = temp;
                };
            } else {
                this.credential = new s.Credential(t.PublicCredential);
            };
            // if no credential generated => abort process
            if (!this.credential) {
                return;
            };
            // fill other context variables
            const formInstanceIdT = contextT[t.FormInstancePK];
            navigator.Form
        }

        static get(contextT: t.ContextT): t.AuditCauseT[] {
            const context = new Context(contextT);
            // checking user-id (emailIdT)
            if (!context.getCredential()) {

            }

            const credentialEmailIdT: t.EmailT = contextT[t.CredentialPK];
            if (credentialEmailIdT) {

            }
            const credb = new s.Credential(t.PublicCredential)
            if (!contextT[t.CredentialPK]) {
                creds = new s.Credential(t.PublicCredential);
            } else {
                creds = s.Credential.getInstance(context[t.CredentialPK]);
                if (!credential) {
                    contextPropertyValueNotFound("userEmail", context);
                    return;
                };
            }
            context.credential = credential;

        }

        getCredential(): s.Credential {
            return this.credential;
        }
    }

}