
import {
    EntityIdT, EntityTypeT, UserIdT,
    TimestampT, DescriptionT,
} from "./types";

import { timestampStr } from "./utils";


const PropEntitySaveHistory = "saveHistoryKeyT";
const PropTimestamp = "timestampT";
const PropUserId = "userIdT";
const PropDescription = "descriptionT";

type EntitySaveHistoryT = {
    [PropTimestamp]: TimestampT,
    [PropUserId]: UserIdT,
    [PropDescription]: DescriptionT,
};

const PropEntityKey = "entityKeyT";
const PropEntityId = "entityIdT";
const PropEntityType = "entityTypeT";

type DataEntityT = {
    [PropEntityKey]: {
        [PropEntityId]: EntityIdT,
        [PropEntityType]: EntityTypeT,
        [PropEntitySaveHistory]: EntitySaveHistoryT[],
    },
};

interface DataEntity<DataT extends DataEntityT> {

    getEntityId(): EntityIdT;
    
    getEntityType(): EntityTypeT;
    
    getEntitySaveHistory(): EntitySaveHistoryT[];
    
    doSave(userIdT: UserIdT, descriptionT: DescriptionT): void;

};

export abstract class AbstractDataEntity<DataT extends DataEntityT> implements DataEntity<DataT> {

    private readonly dataEntityT: DataEntityT;

    constructor(dataT: DataT) {
        this.dataEntityT = dataT;
    };

    getEntityId(): EntityIdT {
        return this.dataEntityT[PropEntityKey][PropEntityId];
    };

    getEntityType(): EntityTypeT {
        return this.dataEntityT[PropEntityKey][PropEntityType];
    };

    getEntitySaveHistory(): EntitySaveHistoryT[] {
        return this.dataEntityT[PropEntityKey][PropEntitySaveHistory];
    };

    doSave(userIdT: UserIdT, descriptionT: DescriptionT): void {

        // EditableEntity.saveData(this.fsdb, this.getIdT(), this.dataT);
    };

};


const PropEditableKey = "editableKeyT";
const PropIsEdited = "isEdited";
const PropEditList = "editListT";
type EditableT = {
    [PropEditableKey]: {
        [PropIsEdited]: boolean,
        [PropEditList]: {
            [PropTimestamp]: TimestampT,
            [PropUserId]: EntityIdT,
            [PropDescription]: DescriptionT,
        }[],
    };
};
export interface Editable<DataT extends EditableT> {
    isEdited(): boolean;
    setEdited(): void;
    history(): EditableT;
    freeze(): void
};
export interface isEditable<DataT extends EditableT> {
    editable(): Editable<DataT>;
};
export class EditableEntity<DataT extends EditableT> implements Editable<DataT> {
    private readonly editableT: DataT;
    constructor(dataT: DataT) {
        this.editableT = dataT
        this.editableT[PropEditableKey][PropIsEdited] = false;
    };
    isEdited(): boolean {
        return this.editableT[PropEditableKey][PropIsEdited];
    };
    setEdited(): void {
        this.editableT[PropEditableKey][PropIsEdited] = true;
    };
    history(): EditableT {
        return { [PropEditableKey]: this.editableT[PropEditableKey] };
    };
    freeze(): void {
        Object.freeze(this.editableT);
    };
};


const PropEnableableKey = "enableableKeyT";
const PropEnabled = "isEnabledT";
const PropEnableList = "enableListT";
export type EnableableT = {
    [PropEnableableKey]: {
        [PropEnabled]: boolean,
        [PropEnableList]: {
            [PropTimestamp]: TimestampT,
            [PropUserId]: EntityIdT,
            [PropEnabled]: boolean,
        }[],
    },
};
export interface Enableable<DataT extends EnableableT> {
    isEnabled(): boolean;
    setEnabled(userIdT: UserIdT, isEnabled: boolean): void;
    history(): EnableableT;
};
export interface isEnableable<DataT extends EnableableT> {
    enableable(): Enableable<DataT>;
};
export class EnableableEntity<DataT extends EnableableT> implements Enableable<DataT> {
    private readonly enableableT: DataT;
    constructor(dataT: DataT) {
        this.enableableT = dataT;
    };
    isEnabled(): boolean {
        return this.enableableT[PropEnableableKey][PropEnabled];
    };
    setEnabled(userIdT: UserIdT, isEnabled: boolean): void {
        this.enableableT[PropEnableableKey][PropEnabled] = isEnabled;
        this.enableableT[PropEnableableKey][PropEnableList].push({
            [PropTimestamp]: timestampStr(),
            [PropUserId]: userIdT,
            [PropEnabled]: isEnabled,
        });
    };
    history(): EnableableT {
        return { [PropEnableableKey]: this.enableableT[PropEnableableKey] };
    };
};




