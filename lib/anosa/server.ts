import type { NextApiRequest } from 'next';
import { AuthenticationError, requirePrincipal } from '@/lib/auth/session';
import type { AuthenticatedPrincipal } from '@/types/backend';

export class StepUpRequiredError extends Error {}

function stepUpWindowSeconds() {
  const minutes = Number(process.env.ANOSA_STEP_UP_WINDOW_MINUTES || 5);
  return Number.isInteger(minutes) && minutes >= 5 && minutes <= 60
    ? minutes * 60
    : 300;
}

function isSyntheticFounder(principal: AuthenticatedPrincipal) {
  return principal.uid === 'founder-preview';
}

export async function requireAnosaFounder(
  request: NextApiRequest,
): Promise<AuthenticatedPrincipal> {
  if (process.env.EGONUX_AUTH_REQUIRED !== 'true') {
    if (process.env.NODE_ENV === 'production') {
      throw new AuthenticationError('Authentication required.');
    }

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

  const principal = await requirePrincipal(request, ['founder']);
  if (process.env.NODE_ENV === 'production' && isSyntheticFounder(principal)) {
    throw new AuthenticationError('Synthetic identities are forbidden in production.');
  }
  return principal;
}

export async function requireAnosaStepUp(
  request: NextApiRequest,
): Promise<AuthenticatedPrincipal> {
  const principal = await requireAnosaFounder(request);
  if (process.env.EGONUX_AUTH_REQUIRED !== 'true') return principal;

  const ageSeconds = Math.floor(Date.now() / 1000) - principal.sessionIssuedAt;
  if (
    !principal.emailVerified ||
    ageSeconds < 0 ||
    ageSeconds > stepUpWindowSeconds()
  ) {
    throw new StepUpRequiredError('Recent verified sign-in required.');
  }

  return principal;
}
