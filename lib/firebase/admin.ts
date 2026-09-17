import { AsyncLocalStorage } from 'node:async_hooks';
import { applicationDefault, getApps, initializeApp, type App, type Credential } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { IdentityPoolClient } from 'google-auth-library';

const oidcTokenContext = new AsyncLocalStorage<string>();

export function withVercelOidcToken<T>(token: string | string[] | undefined, callback: () => Promise<T>) {
  const value = Array.isArray(token) ? token[0] : token;
  return value ? oidcTokenContext.run(value, callback) : callback();
}

function workloadIdentityCredential(): Credential | null {
  const audience = process.env.GCP_WIF_AUDIENCE;
  const serviceAccount = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  if (!audience || !serviceAccount) return null;

  const client = new IdentityPoolClient({
    type: 'external_account',
    audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccount)}:generateAccessToken`,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    subject_token_supplier: {
      getSubjectToken: async () => {
        const token = oidcTokenContext.getStore() ?? process.env.VERCEL_OIDC_TOKEN;
        if (!token) throw new Error('Vercel OIDC token is unavailable in this request context.');
        return token;
      },
    },
  });

  return {
    async getAccessToken() {
      const result = await client.getAccessToken();
      if (!result.token) throw new Error('GCP workload identity exchange returned no access token.');
      const expiry = client.credentials.expiry_date ?? Date.now() + 3_600_000;
      return { access_token: result.token, expires_in: Math.max(1, Math.floor((expiry - Date.now()) / 1_000)) };
    },
  };
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

  return initializeApp({ credential: workloadIdentityCredential() ?? applicationDefault(), projectId });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
