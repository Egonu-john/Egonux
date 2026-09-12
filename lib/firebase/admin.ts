import { applicationDefault, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    (process.env.FIRESTORE_EMULATOR_HOST ? 'egonux-sandbox' : undefined);

  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT is required for EGONUX server services.');
  }

  return initializeApp({ credential: applicationDefault(), projectId });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
