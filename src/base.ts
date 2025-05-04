
import { TDataConfig } from "./data";
import { TAuditCause } from "./audit";
import { TDataInstance } from "./flows";
import { TViewConfig } from "./view";


export type TResponse = {
    error?: TAuditCause[],
    data?: {
        viewConfigs: TViewConfig[],
        dataConfigs: TDataConfig[],
        dataInstances: TDataInstance[],
    }
}



type FLoad<TId, TData> = (id: TId) => TData | undefined;
type FSave<TId, TData> = (id: TId, data: TData) => TData;
type Constructor<Class, TData> = new (data: TData) => Class;


export abstract class OBaseInstance<TId, TData> {

    protected readonly data: TData;
    protected readonly idKey: string;
    protected readonly fnSave: FSave<TId, TData>;

    constructor(idKey: string, fnSave: FSave<TId, TData>, data: TData) {
        this.idKey = idKey;
        this.fnSave = fnSave;
        this.data = data;
    }

    getId(): TId {
        return this.data[this.idKey];
    }

    save(): void {
        this.fnSave(this.data[this.idKey], this.data);
    }

    freeze(closing: boolean): void {
        if (closing) {
            Object.freeze(this);
            // for (const value of Object.values(this.data)) {
            //     if (Array.isArray(value) || typeof value == "object") {
            //         Object.freeze(value);
            //     };
            // };
        };
    }



    public static addToArray<T>(array: T[], item: T): boolean {
        const index = array.indexOf(item);
        if (index < 0) {
            array.push(item);
            return true;
        }
        return false;
    }

    public static removeFromArray<T>(array: T[], item: T): boolean {
        const index = array.indexOf(item);
        if (index >= 0) {
            array.splice(index, 1);
            return true;
        }
        return false;
    }

    public static loadInstance<TId, TData, Class>(id: TId, dbLoad: FLoad<TId, TData>, clazz: Constructor<Class, TData>): Class | undefined {
        const t: TData | undefined = dbLoad(id);
        if (t) {
            return new clazz(t);
        }
        return undefined;
    }

}