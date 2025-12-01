/**
 * This file contains the implementation of a generic cache,
 * of versioned objects of type <code>SpecIdT</code>.
 * @see SpecIdT 
 * @author Riyaz Mansoor <riyaz.mansoor@gmail.com>
 * @version 1.0
 */

// Import necessary types from other modules.
import { SimpleflowError } from "./Errors.js";
import { SpecIdT, NameT } from "./Types.js";
import { WorkflowSpecT } from "./Workflows.js";
import { WorkstepSpecT } from "./Worksteps.js";

// Import the logger from firebase-functions.
import * as logger from 'firebase-functions/logger';

/**
 * A generic cache for storing and managing versioned objects.
 * Objects are identified by a SpecIdT type, which includes a name and a version.
 */
class SpecCache<T extends SpecIdT> {

    // The name of the cache instance.
    private name: NameT;
    // The internal cache, a map where keys are spec names and values are arrays of specs.
    private cache: Map<NameT, T[]> = new Map();

    /**
     * Constructs a new SpecCache.
     * @param name The name of the cache.
     */
    constructor(name: NameT) {
        this.name = name;
        this.cache = new Map<string, T[]>();
    };

    /**
     * Returns the name of the cache.
     * @returns The name of the cache.
     */
    getName(): NameT {
        return this.name;
    }

    /**
     * Retrieves a specific version of an object by its SpecIdT.
     * If specVersion is 0, it returns the latest version.
     * Returns undefined if the object or version is not found.
     * @param specIdT The SpecIdT object containing the name and version.
     * @returns The requested spec object or undefined if not found.
     */
    getSpec(specIdT: SpecIdT): T | undefined {
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
        if (index === -1) {
            // If the spec already exists, throw an error to prevent duplicates.
            const errMessage = `${this.name} :: Duplicate spec-id ${JSON.stringify(t)}`;
            logger.error(errMessage);
            throw SimpleflowError.errorSpecDuplicate(errMessage, t);
        };
        // Spec does not exist, add it to the cache.
        versions.push(t);
        versions.sort((a, b) => b.specVersion - a.specVersion);
    };

    /**
     * Updates an existing spec in the cache.
     * If the spec to be updated is not found, an error is thrown.
     * @param t The spec object to update. The version of this object is used to find the existing object.
     */
    updateSpec(t: T): void {
        const versions = this.cache.get(t.specName);
        const index = versions ? versions.findIndex(v => v.specVersion === t.specVersion) : -1;
        if (index === -1) {
            // If the spec does not exists, throw an error to warn.
            const errMessage = `${this.name} :: Expected but NOT found - spec-id ${JSON.stringify(t)}`;
            logger.error(errMessage);
            throw SimpleflowError.errorSpecNotFound(errMessage, t);
        };
        // Spec exists, update the cache.
        versions[index] = t;
    };

};

// Create a singleton instance of SpecCache for workflows.
export const WorkflowCache = new SpecCache<WorkflowSpecT>("Workflow Cache");

// Create a singleton instance of SpecCache for worksteps.
export const WorkstepCache = new SpecCache<WorkstepSpecT>("Workstep Cache");
