
import { SpecDefT } from "./Types.js";

import { getAuth, User } from "firebase/auth";

export function currentUser(): User {
    return getAuth().currentUser;
};

export function hasRole(specDefT: SpecDefT): { result: boolean, user: User } {
 
    const auth = getAuth();
    const user: User = auth.currentUser;
    
    if (user) {
      const uid = user.uid;
      console.log("User UID:", uid);
    } else {
      console.log("No user is currently signed in.");
    }

    return { result: true, user: user };
};