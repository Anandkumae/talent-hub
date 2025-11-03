import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This object will hold the initialized Firebase Admin services.
let firebaseAdminServices: {
    app: App;
    firestore: Firestore;
} | null = null;

export async function initializeFirebaseOnServer() {
  if (firebaseAdminServices) {
    return firebaseAdminServices;
  }

  if (!getApps().length) {
    initializeApp({
        projectId: firebaseConfig.projectId,
    });
  }

  const app = getApp();
  const firestore = getFirestore(app);

  firebaseAdminServices = {
    app,
    firestore,
  };

  return firebaseAdminServices;
}
