import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applicationDefault, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const externalAccountPath = join(tmpdir(), 'egonux-gcp-external-account.json');
const oidcTokenPath = join(tmpdir(), 'egonux-vercel-oidc-token');

function configureWorkloadIdentity(token: string) {
  const audience = process.env.GCP_WIF_AUDIENCE;
  const serviceAccount = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  if (!audience || !serviceAccount) return;

  writeFileSync(oidcTokenPath, token, { mode: 0o600 });
  writeFileSync(externalAccountPath, JSON.stringify({
    type: 'external_account',
    audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateAccessToken`,
    credential_source: { file: oidcTokenPath, format: { type: 'text' } },
  }), { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = externalAccountPath;
}

export function withVercelOidcToken<T>(token: string | string[] | undefined, callback: () => Promise<T>) {
  const value = Array.isArray(token) ? token[0] : token;
  if (!value) return callback();
  configureWorkloadIdentity(value);
  return callback();
}

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
