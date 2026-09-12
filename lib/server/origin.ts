import type { NextApiRequest } from 'next';

export class InvalidOriginError extends Error {}

export function requireSameOrigin(request: NextApiRequest) {
  const origin = request.headers.origin;
  if (!origin) throw new InvalidOriginError('Origin header is required.');

  const forwardedHost = request.headers['x-forwarded-host'];
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost ?? request.headers.host;
  const protocol = request.headers['x-forwarded-proto'] ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const expected = host ? `${protocol}://${host}` : null;
  const configured = (process.env.EGONUX_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (origin !== expected && !configured.includes(origin)) {
    throw new InvalidOriginError('Request origin is not allowed.');
  }
}
