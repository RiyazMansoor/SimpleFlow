import { TTimestamp } from "./types";

export function Timestamp(): TTimestamp {
    return new Date().toISOString();
}

export function RandomStr(len: number = 40): string {
    return "";
}
