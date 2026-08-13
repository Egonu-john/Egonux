import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  service: string;
  version: string;
  environment: string;
  status: 'healthy';
  capabilities: string[];
}

export default function handler(_request: NextApiRequest, response: NextApiResponse<HealthResponse>) {
  response.status(200).json({
    service: 'EGONUX OS',
    version: '3.0.0-enterprise-mvp',
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    status: 'healthy',
    capabilities: ['identity', 'wallet-sandbox', 'marketplace', 'learn', 'community', 'affiliate-pilot', 'ai-demo', 'command-center'],
  });
}
