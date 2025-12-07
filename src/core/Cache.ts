/**
 * This file contains the implementation of a generic cache.
 *
 * @author Riyaz Mansoor <riyaz.mansoor@gmail.com>
 * @version 1.0
 */

import { error } from 'firebase-functions/logger';
import * as t from "./Types.js";
import * as e from "./Errors.js";
import { DB } from "./Firebase.js";
import { doc, DocumentReference, getDoc, WriteBatch } from "firebase/firestore";

/**
 * A generic cache for storing and managing versioned objects.
 * Objects are identified by a SpecIdT type, which includes a name and a version.
 */
class SpecCache<T extends t.SpecIdT> {

    // The name of the cache instance.
    private cacheName: t.NameT;
    // The internal cache, a map where keys are spec names and values are arrays of specs.
    private cache: Map<t.NameT, T[]> = new Map();

    /**
     * Constructs a new SpecCache.
     * @param cacheName The name of the cache.
     */
    constructor(cacheName: t.NameT) {
        this.cacheName = cacheName;
    };

    /**
     * Returns the name of the cache.
     * @returns The name of the cache.
     */
    getName(): t.NameT {
        return this.cacheName;
    }

    /**
     * Retrieves a specific version of an object by its SpecIdT.
     * If specVersion is 0, it returns the latest version.
     * Returns undefined if the object or version is not found.
     * @param specIdT The SpecIdT object containing the name and version.
     * @returns The requested spec object or undefined if not found.
     */
    getSpec(specIdT: t.SpecIdT): T | undefined {
        const versions = this.cache.get(specIdT.specName);
        if (!versions) {
            // If no versions are found for the given spec name, return undefined.
            return undefined;
        };
        if (specIdT.specVersion === 0) {
            // A specVersion of 0 indicates a request for the latest version.
            // Since versions are stored in descending order, the latest is at index 0.
            return versions[0];
        };
        // Find the specific version that matches the requested specVersion.
        return versions.find(v => v.specVersion === specIdT.specVersion);
    }

    /**
      * Adds a new object to the cache.
      * Throws an error if an object with the same SpecIdT already exists.
      * @param t The object to add to the cache.
     */
    addSpec(t: T): void {
        const versions = this.cache.get(t.specName);
        const index = versions ? versions.findIndex(v => v.specVersion === t.specVersion) : -1;
        if (index == -1) {
            // Spec does not exist, add it to the cache.
            versions.push(t);
            versions.sort((a, b) => b.specVersion - a.specVersion);
        } else {
            // If the spec already exists, log an error as a warning.
            versions[index] = t;
            const errMessage = `${this.cacheName} :: Duplicate spec-id ${t.specName}/${t.specVersion}`;
            error(errMessage, t);
        };
    };

};

// Create a singleton instance of SpecCache for workflows.
export const WfSpecCache = new SpecCache<t.WfSpecT>("Workflow Spec Cache");

// Create a singleton instance of SpecCache for worksteps.
export const WsSpecCache = new SpecCache<t.SpecDefT>("Workstep Spec Cache");


class InstanceCache<T extends t.InstanceDefT> {

    private readonly collection: t.NameT;
    // The internal cache, a map where keys are spec names and values are arrays of specs.
    private readonly cache: Map<t.NameT, T> = new Map();


    constructor(collection: t.NameT) {
        this.collection = collection;
    };

    add(t: T): void {
        this.cache.set(t.instanceKey, t);
    };

    async get(instanceKey: t.InstanceKeyT): Promise<T> {
        if (!this.cache.has(instanceKey)) {
            // load from db, add to cache, then return it.
            const t: T = await getDoc(this.dbDocRef(instanceKey)).then(snapshot => snapshot.data() as T);
            this.cache.set(instanceKey, t);
            return t;
        };
        return this.cache.get(instanceKey);
    };

    remove(instanceKey: t.InstanceKeyT): void {
        this.cache.delete(instanceKey);
    };

    dbDocRef(instanceId: t.InstanceKeyT): DocumentReference {
        return doc(DB, this.collection, instanceId);
    };

    dbBatchWrite(writeBatch: WriteBatch, t: T): void {
        writeBatch.set(this.dbDocRef(t.instanceKey), t);
    };

};

const DB_COL_WORKFLOWS = "Workflows";
export const WfInstanceCache = new InstanceCache<t.WfInstanceT>(DB_COL_WORKFLOWS);

const DB_COL_WORKSTEPS = "Worksteps";
export const WsInstanceCache = new InstanceCache<t.InstanceDefT>(DB_COL_WORKSTEPS);

