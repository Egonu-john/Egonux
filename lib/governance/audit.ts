import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  previousHash: string;
  currentHash: string;
}

const auditChain: AuditRecord[] = [];

export function recordAuditEntry(actorId: string, action: string): AuditRecord {
  const previousRecord = auditChain[auditChain.length - 1];
  const previousHash = previousRecord ? previousRecord.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
  
  const timestamp = new Date().toISOString();
  const rawData = `${previousHash}:${timestamp}:${actorId}:${action}`;
  const currentHash = crypto.createHash('sha256').update(rawData).digest('hex');

  const record: AuditRecord = {
    id: crypto.randomUUID(),
    timestamp,
    actorId,
    action,
    previousHash,
    currentHash,
  };

  auditChain.push(record);
  return record;
}

export function verifyAuditChainIntegrity(): boolean {
  for (let i = 0; i < auditChain.length; i++) {
    const record = auditChain[i];
    const prevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : auditChain[i - 1].currentHash;
    
    if (record.previousHash !== prevHash) return false;

    const rawData = `${prevHash}:${record.timestamp}:${record.actorId}:${record.action}`;
    const calculatedHash = crypto.createHash('sha256').update(rawData).digest('hex');

    if (calculatedHash !== record.currentHash) return false;
  }
  return true;
}
