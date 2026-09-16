import type { NextApiRequest } from 'next';
import { requirePrincipal } from '@/lib/auth/session';
import type { AuthenticatedPrincipal } from '@/types/backend';

export class StepUpRequiredError extends Error {}

function stepUpWindowSeconds() {
  const minutes = Number(process.env.ANOSA_STEP_UP_WINDOW_MINUTES || 15);
  return (Number.isInteger(minutes) && minutes >= 5 && minutes <= 60 ? minutes : 15) * 60;
}

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

export async function requireAnosaStepUp(request: NextApiRequest) {
  const principal = await requireAnosaFounder(request);
  if (process.env.EGONUX_AUTH_REQUIRED !== 'true') return principal;
  const age = Math.floor(Date.now() / 1000) - principal.sessionIssuedAt;
  if (!principal.emailVerified || age > stepUpWindowSeconds()) {
    throw new StepUpRequiredError('Recent verified sign-in required.');
  }
  return principal;
}
