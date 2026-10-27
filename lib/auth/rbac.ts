import crypto from 'crypto';

export type LegacyRole = 'ADMIN' | 'MERCHANT' | 'USER';

export interface UserSession {
  id: string;
  role: LegacyRole;
}

interface TokenPayload {
  id: string;
  role: LegacyRole;
  exp: number;
}

interface SignedToken {
  payload: string;
  signature: string;
}

const TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_TOKEN_LENGTH = 8192;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be configured with at least 32 characters',
    );
  }

  return secret;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLegacyRole(value: unknown): value is LegacyRole {
  return value === 'ADMIN' || value === 'MERCHANT' || value === 'USER';
}

export function generateToken(
  userId: string,
  role: LegacyRole = 'USER',
): string {
  const secret = getJwtSecret();

  if (
    typeof userId !== 'string' ||
    userId.trim().length === 0 ||
    userId.length > 256
  ) {
    throw new Error('A valid user ID is required');
  }

  if (!isLegacyRole(role)) {
    throw new Error('Invalid legacy role');
  }

  const payload: TokenPayload = {
    id: userId,
    role,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const payloadText = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadText, 'utf8')
    .digest('hex');

  const signedToken: SignedToken = {
    payload: payloadText,
    signature,
  };

  return Buffer.from(JSON.stringify(signedToken), 'utf8').toString('base64');
}

export function authenticateRequest(
  token: string,
): UserSession | null {
  try {
    if (
      typeof token !== 'string' ||
      token.length === 0 ||
      token.length > MAX_TOKEN_LENGTH ||
      token.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(token)
    ) {
      return null;
    }

    const secret = process.env.JWT_SECRET;

    if (typeof secret !== 'string' || secret.length < 32) {
      return null;
    }

    const decodedText = Buffer.from(token, 'base64').toString('utf8');

    // Reject non-canonical Base64 and malformed token wrappers.
    if (Buffer.from(decodedText, 'utf8').toString('base64') !== token) {
      return null;
    }

    const decoded: unknown = JSON.parse(decodedText);

    if (
      !isRecord(decoded) ||
      typeof decoded.payload !== 'string' ||
      typeof decoded.signature !== 'string' ||
      !/^[a-f0-9]{64}$/.test(decoded.signature)
    ) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(decoded.payload, 'utf8')
      .digest();

    const actualSignature = Buffer.from(decoded.signature, 'hex');

    if (
      actualSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return null;
    }

    const data: unknown = JSON.parse(decoded.payload);

    if (
      !isRecord(data) ||
      typeof data.id !== 'string' ||
      data.id.trim().length === 0 ||
      data.id.length > 256 ||
      !isLegacyRole(data.role) ||
      typeof data.exp !== 'number' ||
      !Number.isFinite(data.exp) ||
      Date.now() >= data.exp
    ) {
      return null;
    }

    return {
      id: data.id,
      role: data.role,
    };
  } catch {
    return null;
  }
}
