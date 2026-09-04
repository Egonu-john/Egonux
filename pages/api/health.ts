import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  service: string;
  version: string;
  environment: string;
  mode: 'sandbox';
  status: 'healthy';
  capabilities: string[];
}

interface MethodNotAllowedResponse {
  error: 'Method not allowed';
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse<HealthResponse | MethodNotAllowedResponse>,
) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  response.status(200).json({
    service: 'EGONUX OS',
    version: '3.0.1-foundation',
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    mode: 'sandbox',
    status: 'healthy',
    capabilities: [
      'identity-demo',
      'wallet-sandbox',
      'marketplace-demo',
      'learn-demo',
      'community-demo',
      'affiliate-pilot',
      'ai-demo',
      'command-center-demo',
    ],
  });
}
