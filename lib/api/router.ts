import { authenticateRequest } from '../auth/rbac';
import { processTransaction } from '../ledger/engine';
import { processPurchaseOrder } from '../commerce/orders';
import { awardTransactionXp, getProfile } from '../rewards/engine';

export interface ApiRequest {
  path: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: any;
}

export interface ApiResponse {
  status: number;
  data?: any;
  error?: string;
  timestamp: string;
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

      const { idempotencyKey, item, affiliateAccountId } = req.body || {};
      if (!idempotencyKey || !item) {
        return { status: 400, error: 'Bad Request: Missing idempotencyKey or item', timestamp };
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
  } catch (err: any) {
    return { status: 500, error: err.message || 'Internal Server Error', timestamp };
  }
}
