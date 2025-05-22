
import { OceanFlow as t } from "./types";


export namespace OceanFlow {

    export interface Entity<DataT extends t.EntityT> {
        getPropertyPK(): any;
        getIdT(): any;
        getValueT(property: string): any;
        getDataT(): DataT;
    }

    export interface Saveable {
        freeze(yes: boolean): void;
        save(description: t.DescriptionT): void;
    }


}
