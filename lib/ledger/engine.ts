import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  event: string;
  metadata?: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

let lastKnownHash = '0000000000000000000000000000000000000000000000000000000000000000';

async function logLedgerAudit(entry: { actorId: string; event: string; metadata?: Record<string, unknown> }) {
  const timestamp = new Date().toISOString();
  const id = crypto.randomUUID();
  const recordWithoutHash = { id, timestamp, ...entry, previousHash: lastKnownHash };
  const hash = crypto.createHash('sha256').update(JSON.stringify(recordWithoutHash)).digest('hex');
  const fullRecord: AuditRecord = { ...recordWithoutHash, hash };
  lastKnownHash = hash;

  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const auditPath = path.join(dataDir, 'audit.json');
    const existing: AuditRecord[] = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : [];
    existing.push(fullRecord);
    fs.writeFileSync(auditPath, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error('Audit log write warning:', err);
  }
}

export interface LedgerEntry {
  accountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  currency: string;
}

export interface LedgerTransaction {
  id: string;
  idempotencyKey: string;
  timestamp: string;
  description: string;
  entries: LedgerEntry[];
  metadata?: Record<string, unknown>;
}

const transactionStore = new Map<string, LedgerTransaction>();
const idempotencyStore = new Set<string>();

export async function processTransaction(params: {
  idempotencyKey: string;
  description: string;
  entries: LedgerEntry[];
  metadata?: Record<string, unknown>;
}): Promise<LedgerTransaction> {
  const { idempotencyKey, description, entries, metadata } = params;

  if (idempotencyStore.has(idempotencyKey)) {
    throw new Error(`Idempotency conflict: Transaction with key '${idempotencyKey}' already processed.`);
  }

  if (!entries || entries.length < 2) {
    throw new Error('Double-entry invariant violation: Transaction must contain at least two entries.');
  }

  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    if (entry.amount <= 0) {
      throw new Error(`Invalid entry amount: ${entry.amount}. Amount must be positive.`);
    }
    if (entry.type === 'DEBIT') totalDebits += entry.amount;
    else if (entry.type === 'CREDIT') totalCredits += entry.amount;
  }

  if (totalDebits !== totalCredits) {
    throw new Error(`Double-entry imbalance: Total DEBITS (${totalDebits}) does not equal Total CREDITS (${totalCredits}).`);
  }

  const transaction: LedgerTransaction = {
    id: crypto.randomUUID(),
    idempotencyKey,
    timestamp: new Date().toISOString(),
    description,
    entries,
    metadata,
  };

  transactionStore.set(transaction.id, transaction);
  idempotencyStore.add(idempotencyKey);

  await logLedgerAudit({
    actorId: 'SYSTEM_LEDGER',
    event: 'FINANCIAL_TRANSACTION_PROCESSED',
    metadata: { transactionId: transaction.id, idempotencyKey, totalAmount: totalDebits, currency: entries[0]?.currency || 'UGX' },
  });

  return transaction;
}
