// This file is meant to be used only on the server side
import {getApps, initializeApp, cert, App} from 'firebase-admin/app';
import {getAuth, Auth} from 'firebase-admin/auth';
import {getFirestore, Firestore} from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if it hasn't been initialized already
function getFirebaseAdminApp() {
    const apps = getApps();

    if(!apps.length){
        return initializeApp({
            credential:cert({
                projectId:process.env.FIREBASE_PROJECT_ID,
                clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
            }),
        });
    }

    return apps[0];
}

// Get Firebase Admin services
export const auth = getAuth(getFirebaseAdminApp());
export const db = getFirestore(getFirebaseAdminApp());