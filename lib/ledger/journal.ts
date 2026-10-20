/**
 * EGONUX sandbox ledger journal primitives.
 *
 * This module validates journal entries; persistence and account concurrency
 * controls must be enforced by the caller in the same database transaction.
 */
export type JournalSide = 'debit' | 'credit';

export interface JournalLine {
  accountId: string;
  side: JournalSide;
  amountMinor: number;
  currency: string;
  memo?: string;
}

export interface JournalDraft {
  transactionId: string;
  lines: JournalLine[];
}

export interface ValidatedJournal extends JournalDraft {
  totalDebitsMinor: number;
  totalCreditsMinor: number;
  currency: string;
}

export class JournalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalValidationError';
  }
}

const CURRENCY_CODE = /^[A-Z]{3}$/;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;

export function validateJournal(draft: JournalDraft): ValidatedJournal {
  if (!IDENTIFIER.test(draft.transactionId)) {
    throw new JournalValidationError('A valid transactionId is required.');
  }
  if (!Array.isArray(draft.lines) || draft.lines.length < 2) {
    throw new JournalValidationError('A journal requires at least two lines.');
  }

  let debitTotal = 0n;
  let creditTotal = 0n;
  let currency: string | undefined;

  for (const [index, line] of draft.lines.entries()) {
    if (!IDENTIFIER.test(line.accountId)) {
      throw new JournalValidationError(`Journal line ${index} has an invalid accountId.`);
    }
    if (line.side !== 'debit' && line.side !== 'credit') {
      throw new JournalValidationError(`Journal line ${index} has an invalid side.`);
    }
    if (!Number.isSafeInteger(line.amountMinor) || line.amountMinor <= 0) {
      throw new JournalValidationError(`Journal line ${index} amountMinor must be a positive safe integer.`);
    }
    if (!CURRENCY_CODE.test(line.currency)) {
      throw new JournalValidationError(`Journal line ${index} must use an uppercase ISO-style currency code.`);
    }
    if (currency && currency !== line.currency) {
      throw new JournalValidationError('A journal cannot mix currencies.');
    }
    currency = line.currency;

    if (line.side === 'debit') debitTotal += BigInt(line.amountMinor);
    else creditTotal += BigInt(line.amountMinor);
  }

  if (debitTotal === 0n || creditTotal === 0n) {
    throw new JournalValidationError('A journal must contain at least one debit and one credit.');
  }
  if (debitTotal !== creditTotal) {
    throw new JournalValidationError('Journal is unbalanced: debits must equal credits.');
  }
  if (debitTotal > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new JournalValidationError('Journal total exceeds the safe integer range.');
  }

  return {
    transactionId: draft.transactionId,
    lines: draft.lines.map((line) => ({ ...line })),
    totalDebitsMinor: Number(debitTotal),
    totalCreditsMinor: Number(creditTotal),
    currency: currency!,
  };
}
