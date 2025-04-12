import { TAlphaNumeric, TEmail } from "./types";

export type TRole = {
    name: string,
    active: boolean,
}

export type TUser = {
    useremail: TEmail,
    password: TAlphaNumeric,
    active: boolean,
}

export type TCredential = {
    userName: string,
    activeRoles: string[]
}


export function addUser(username: string): void {

}