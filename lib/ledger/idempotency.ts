/**
 * Firestore-backed idempotency helper.
 *
 * The caller's operation MUST perform all ledger/account writes using the
 * supplied transaction so the financial effect and cached response commit
 * atomically. Do not call external providers inside the transaction callback.
 */
import { createHash } from 'node:crypto';
import {
  FieldValue,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore';

export class IdempotencyConflictError extends Error {
  constructor() {
    super('The idempotency key was already used for a different request.');
    this.name = 'IdempotencyConflictError';
  }
}

export class IdempotencyKeyRequiredError extends Error {
  constructor() {
    super('A valid Idempotency-Key header is required.');
    this.name = 'IdempotencyKeyRequiredError';
  }
}

const SAFE_KEY = /^[A-Za-z0-9._:-]{8,200}$/;

export function requireIdempotencyKey(value: string | undefined): string {
  if (!value || !SAFE_KEY.test(value)) throw new IdempotencyKeyRequiredError();
  return value;
}

export function requestFingerprint(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    throw new Error('Request fingerprints require JSON-compatible values.');
  }
  if (value === null || typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new Error('Value cannot be fingerprinted.');
    return serialized;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

export interface IdempotentExecution<T> {
  result: T;
  replayed: boolean;
}

interface IdempotencyRecord<T> {
  fingerprint: string;
  result: T;
  createdAt: unknown;
}

/**
 * Atomically returns a previous result or executes the supplied Firestore
 * transaction operation once for this scoped key/fingerprint.
 *
 * Keep scope specific to the authenticated principal and operation, e.g.
 * `transfer:<uid>`. Store only a response safe to replay to that same caller.
 */
export async function executeIdempotently<T>(
  firestore: Firestore,
  scope: string,
  key: string,
  fingerprint: string,
  operation: (transaction: Transaction) => Promise<T>,
): Promise<IdempotentExecution<T>> {
  requireIdempotencyKey(key);
  if (!scope.trim() || scope.length > 240) throw new Error('A valid idempotency scope is required.');
  if (!/^[a-f0-9]{64}$/.test(fingerprint)) throw new Error('A SHA-256 request fingerprint is required.');

  const recordId = createHash('sha256').update(`${scope}\u0000${key}`).digest('hex');
  const reference = firestore.collection('idempotencyRecords').doc(recordId);

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (snapshot.exists) {
      const previous = snapshot.data() as IdempotencyRecord<T>;
      if (previous.fingerprint !== fingerprint) throw new IdempotencyConflictError();
      return { result: previous.result, replayed: true };
    }

    const result = await operation(transaction);
    transaction.create(reference, {
      scope,
      fingerprint,
      result,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { result, replayed: false };
  });
}
