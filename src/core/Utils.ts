
import { IntegerT, JSONPrimitiveT, JSONValueT, NameT, SpecIdT, TimestampStrT } from "./Types.ts";
import { ConsoleLogger, Logger } from "./Logger.ts";




/**
 * @returns the ISO formatted current timestamp
 */
export function timestampStr(): TimestampStrT {
    return new Date().toISOString();
};

/**
 * Default length of the random string
 */
export const DEFAULT_RANDOMSTR_LEN = 40;

/**
 * @param len length of the random string - default 40
 * @returns random string
 */
export function randomStr(len: IntegerT = DEFAULT_RANDOMSTR_LEN): string {
    let rstr = "";
    while (rstr.length < len) {
        rstr += Math.random().toString(36).substring(2, 12);
    };
    return rstr.substring(0, len);
};


export function CacheKey(val: JSONValueT): string {
    if (typeof val == "object") {
        return Object.values(val).join("|");
    };
    return val.toString();
};


export type CacheKeyFunc<T> = (t: T)=> JSONValueT;

class Cache<T> {

    private readonly cacheName: NameT;
    private readonly cacheKeyFunc: CacheKeyFunc<T>;
    private readonly cacheMap: Map<string, T> = new Map();

    private readonly logger: Logger;;

    constructor(cacheName: NameT, cacheKeyFunc: CacheKeyFunc<T>) {
        this.cacheName = cacheName;
        this.cacheKeyFunc = cacheKeyFunc;
        // this.logger = new ConsoleLogger(cacheName);
    };

    name(): NameT {
        return this.cacheName;
    };

    get(key: JSONValueT): T | undefined {
        const keyStr = CacheKey(key);
        const t: T = this.cacheMap.get(keyStr);
        if (t) {
            this.logger.info("get() found from cache", key);
        } else {
            this.logger.error("get() not found in cache", key);
        };
        return t;
    };

    add(t: T): boolean {
        const keystr = CacheKey(this.cacheKeyFunc(t));
        if (this.cacheMap.get(keystr)) {
            this.logger.log("add() duplicate spec-id fail", keystr);
            return false;
        };
        this.cacheMap.set(keystr, t);
        this.logger.log("add() added to cache", keystr);
        return true;
    };

    remove(keystr: string): boolean {
        const removed = this.cacheMap.delete(keystr);
        if (removed) {
            this.logger.log("remove() removed from cache", keystr);
        } else {
            this.logger.log("remove() not found in cache", keystr);
        };
        return removed;
    };

};
