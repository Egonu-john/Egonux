import crypto from 'crypto';
import { processTransaction, LedgerEntry } from '../ledger/engine';

export interface DigitalItem {
  id: string;
  name: string;
  price: number; // Smallest unit, e.g., UGX
  merchantAccountId: string;
}

export interface PurchaseOrderRequest {
  idempotencyKey: string;
  buyerAccountId: string;
  item: DigitalItem;
  affiliateAccountId?: string;
  affiliateCommissionRate?: number; // e.g., 0.10 for 10%
  platformFeeRate?: number; // e.g., 0.05 for 5%
}

export async function processPurchaseOrder(req: PurchaseOrderRequest) {
  const {
    idempotencyKey,
    buyerAccountId,
    item,
    affiliateAccountId,
    affiliateCommissionRate = 0.10,
    platformFeeRate = 0.05,
  } = req;

  const totalAmount = item.price;
  const platformFee = Math.floor(totalAmount * platformFeeRate);
  const affiliateCommission = affiliateAccountId
    ? Math.floor(totalAmount * affiliateCommissionRate)
    : 0;
  const merchantPayout = totalAmount - platformFee - affiliateCommission;

  // Construct balanced double-entry ledger entries
  // Debit: Buyer Cash/Wallet
  // Credit: Merchant Account, Platform Revenue, Affiliate Wallet
  const entries: LedgerEntry[] = [
    { accountId: buyerAccountId, type: 'DEBIT', amount: totalAmount, currency: 'UGX' },
    { accountId: item.merchantAccountId, type: 'CREDIT', amount: merchantPayout, currency: 'UGX' },
    { accountId: 'REVENUE_PLATFORM_FEES', type: 'CREDIT', amount: platformFee, currency: 'UGX' },
  ];

  if (affiliateAccountId && affiliateCommission > 0) {
    entries.push({
      accountId: affiliateAccountId,
      type: 'CREDIT',
      amount: affiliateCommission,
      currency: 'UGX',
    });
  }

  // Execute ledger entries via double-entry engine
  const ledgerTx = await processTransaction({
    idempotencyKey: `order-${idempotencyKey}`,
    description: `Purchase of ${item.name} (Item ID: ${item.id})`,
    entries,
    metadata: {
      buyerAccountId,
      merchantAccountId: item.merchantAccountId,
      affiliateAccountId: affiliateAccountId || 'NONE',
      platformFee,
      affiliateCommission,
      merchantPayout,
    },
  });

  return {
    orderId: crypto.randomUUID(),
    status: 'FULFILLED',
    ledgerTransactionId: ledgerTx.id,
    breakdown: {
      totalAmount,
      merchantPayout,
      platformFee,
      affiliateCommission,
    },
  };
}
