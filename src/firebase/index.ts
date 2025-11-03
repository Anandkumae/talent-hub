'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage';

// This object will hold the initialized Firebase services.
let firebaseServices: {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
} | null = null;


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Return the services if they've already been initialized.
  if (firebaseServices) {
    return firebaseServices;
  }

  // If there's no initialized app, create one.
  if (!getApps().length) {
    let app: FirebaseApp;
    try {
      // In a Firebase App Hosting environment, this will be automatically configured.
      app = initializeApp();
    } catch (e) {
      // Fallback for local development or other environments.
      app = initializeApp(firebaseConfig);
    }
  }

  const app = getApp();
  // Store the initialized services so we don't have to re-initialize.
  firebaseServices = {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app)
  };

  return firebaseServices;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
// non-blocking-login is deprecated by this change, can be removed in future.
export * from './errors';
export * from './error-emitter';
