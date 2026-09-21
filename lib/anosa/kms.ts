import { createHash, createVerify } from 'node:crypto';
import { GoogleAuth } from 'google-auth-library';

const KEY_VERSION_PATTERN = /^projects\/[^/]+\/locations\/[^/]+\/keyRings\/[^/]+\/cryptoKeys\/[^/]+\/cryptoKeyVersions\/\d+$/;
const KMS_ALGORITHM = 'EC_SIGN_P256_SHA256';

export interface EvidenceKmsSignature {
  value: string;
  keyVersion: string;
  algorithm: typeof KMS_ALGORITHM;
  digest: 'SHA256';
}

function configuredKeyVersion() { return process.env.ANOSA_KMS_KEY_VERSION?.trim() ?? ''; }
export function kmsSigningEnabled() { return process.env.ANOSA_KMS_SIGNING_ENABLED === 'true'; }
export function kmsSigningConfigured() { return kmsSigningEnabled() && KEY_VERSION_PATTERN.test(configuredKeyVersion()); }

async function kmsClient() {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  return auth.getClient();
}

export async function signEvidenceHash(contentHash: string): Promise<EvidenceKmsSignature | null> {
  if (!kmsSigningEnabled()) return null;
  const keyVersion = configuredKeyVersion();
  if (!KEY_VERSION_PATTERN.test(keyVersion)) throw new Error('ANOSA KMS signing is enabled without a valid key version.');
  const digest = createHash('sha256').update(contentHash, 'utf8').digest('base64');
  const client = await kmsClient();
  const result = await client.request<{ name?: string; signature?: string }>({
    url: `https://cloudkms.googleapis.com/v1/${keyVersion}:asymmetricSign`, method: 'POST', data: { digest: { sha256: digest } },
  });
  if (!result.data.signature || result.data.name !== keyVersion) throw new Error('Cloud KMS did not return a valid evidence signature.');
  return { value: result.data.signature, keyVersion, algorithm: KMS_ALGORITHM, digest: 'SHA256' };
}

const publicKeyCache = new Map<string, string>();

async function publicKey(keyVersion: string) {
  const cached = publicKeyCache.get(keyVersion);
  if (cached) return cached;
  if (!KEY_VERSION_PATTERN.test(keyVersion)) throw new Error('Invalid KMS key version on evidence record.');
  const client = await kmsClient();
  const result = await client.request<{ pem?: string; algorithm?: string }>({
    url: `https://cloudkms.googleapis.com/v1/${keyVersion}/publicKey`, method: 'GET',
  });
  if (!result.data.pem || result.data.algorithm !== KMS_ALGORITHM) throw new Error('Unsupported KMS evidence-signing key.');
  publicKeyCache.set(keyVersion, result.data.pem);
  return result.data.pem;
}

export async function verifyEvidenceSignature(contentHash: string, signature: unknown) {
  if (!signature || typeof signature !== 'object') return false;
  const candidate = signature as Partial<EvidenceKmsSignature>;
  if (!candidate.value || !candidate.keyVersion || candidate.algorithm !== KMS_ALGORITHM || candidate.digest !== 'SHA256') return false;
  try {
    const verifier = createVerify('sha256');
    verifier.update(contentHash, 'utf8');
    verifier.end();
    return verifier.verify(await publicKey(candidate.keyVersion), Buffer.from(candidate.value, 'base64'));
  } catch { return false; }
}
