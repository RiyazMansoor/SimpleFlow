
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyD73GwvZG61qbL7meKjq19go6hoMouUOAc",
    authDomain: "simplebase-4a5f2.firebaseapp.com",
    projectId: "simplebase-4a5f2",
    storageBucket: "simplebase-4a5f2.firebasestorage.app",
    messagingSenderId: "157132935082",
    appId: "1:157132935082:web:e58ae4afb3ee322e39a5d3",
    measurementId: "G-CRV4EMKH7E"
};

// Initialize Firebase
const APP = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
export const DB = getFirestore(APP);

