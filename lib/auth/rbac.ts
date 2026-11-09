export interface UserSession {
  id: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MERCHANT' | 'USER';
}

/** Legacy token issuance is disabled. */
export function generateToken(
  _userId: string,
  _role: UserSession['role'],
): string {
  throw new Error(
    'Legacy token issuance is disabled. Use the central authentication system.',
  );
}

/** Legacy tokens are no longer accepted. */
export function authenticateRequest(
  _token: string,
): UserSession | null {
  return null;
}
