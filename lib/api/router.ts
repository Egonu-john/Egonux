import { authenticateRequest } from '../auth/rbac';
import { processTransaction } from '../ledger/engine';
import { processPurchaseOrder, type DigitalItem } from '../commerce/orders';
import { awardTransactionXp, getProfile } from '../rewards/engine';

export interface ApiRequest {
  path: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse {
  status: number;
  data?: unknown;
  error?: string;
  timestamp: string;
}

function isDigitalItem(value: unknown): value is DigitalItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.price === 'number'
    && Number.isFinite(item.price)
    && typeof item.merchantAccountId === 'string';
}

export async function handleApiRequest(req: ApiRequest): Promise<ApiResponse> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Unified Identity & Security Auth Guard
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const user = token ? authenticateRequest(token) : null;

    // Route: GET /api/v1/profile
    if (req.path === '/api/v1/profile' && req.method === 'GET') {
      if (!user) return { status: 401, error: 'Unauthorized: Invalid token', timestamp };
      const profile = getProfile(user.id);
      return { status: 200, data: { user, profile }, timestamp };
    }

    // Route: POST /api/v1/orders
    if (req.path === '/api/v1/orders' && req.method === 'POST') {
      if (!user) return { status: 401, error: 'Unauthorized: Invalid token', timestamp };

      const body = req.body && typeof req.body === 'object'
        ? req.body as Record<string, unknown>
        : {};
      const { idempotencyKey, item, affiliateAccountId } = body;
      if (typeof idempotencyKey !== 'string' || !idempotencyKey || !isDigitalItem(item)) {
        return { status: 400, error: 'Bad Request: Missing or invalid idempotencyKey or item', timestamp };
      }
      if (affiliateAccountId !== undefined && typeof affiliateAccountId !== 'string') {
        return { status: 400, error: 'Bad Request: Invalid affiliateAccountId', timestamp };
      }

      // Execute order settlement via Chapter 13 Engine
      const orderResult = await processPurchaseOrder({
        idempotencyKey,
        buyerAccountId: user.id,
        item,
        affiliateAccountId,
      });

      // Automatically award gamified XP rewards via Chapter 14 Engine
      const rewardResult = await awardTransactionXp({
        idempotencyKey: `rew-${idempotencyKey}`,
        userId: user.id,
        transactionAmount: item.price,
      });

      return {
        status: 201,
        data: {
          order: orderResult,
          reward: rewardResult,
        },
        timestamp,
      };
    }

    return { status: 404, error: 'Endpoint not found', timestamp };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return { status: 500, error: message, timestamp };
  }
}
void processTransaction;
