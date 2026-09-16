import type { NextApiRequest } from 'next';

export function anosaLog(request: NextApiRequest, route: string, event: string, startedAt: number, detail: Record<string, unknown> = {}) {
  console.log(JSON.stringify({
    level: 'info', service: 'anosa', route, event,
    requestId: request.headers['x-vercel-id'] ?? null,
    durationMs: Date.now() - startedAt,
    ...detail,
  }));
}
