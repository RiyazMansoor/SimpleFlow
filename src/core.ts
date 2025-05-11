

// import { OceanFlow as t } from "./types";
// import { OceanFlow as s } from "./security";
import { OceanFlow as db } from "./store";

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

        protected readonly fsdb: any;

        constructor(idPropertyName: string, dataT: DataT, fsdb: any) {
            super(idPropertyName, dataT);
            this.fsdb = fsdb;
        }

        save(): void {
            Instance.saveData(this.fsdb, this.getId(), this.dataT);
        }

        static saveData<IdT, DataT>(fsdb: any, id: IdT, dataT: DataT): void {
            db.dbSave(fsdb, id, dataT);
        }

        static loadData<IdT, DataT>(fsdb: any, id: IdT): DataT | undefined {
            const dataT: DataT | undefined = db.dbLoad(fsdb, id);
            return dataT;
        }

        static loadInstance<TId, DataT, Class>(fsdb: any, id: TId, clazz: Constructor<Class, DataT>): Class | undefined {
            const dataT: DataT | undefined = Instance.loadData(fsdb, id);
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


}