import type { NextApiRequest } from 'next';
import { requirePrincipal } from '@/lib/auth/session';
import type { AuthenticatedPrincipal } from '@/types/backend';

export async function requireAnosaFounder(request: NextApiRequest): Promise<AuthenticatedPrincipal> {
  if (process.env.EGONUX_AUTH_REQUIRED !== 'true') {
    return {
      uid: 'founder-preview',
      email: null,
      emailVerified: false,
      displayName: 'Founder',
      title: 'Founder Preview',
      roles: ['founder'],
      sessionIssuedAt: Math.floor(Date.now() / 1000),
    };
  }

  return requirePrincipal(request, ['founder']);
}
