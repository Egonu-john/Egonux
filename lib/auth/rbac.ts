import crypto from 'crypto';

export interface UserSession {
  id: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MERCHANT' | 'USER';
}

const JWT_SECRET = 'egonux-secret-key-3.4';

export function generateToken(userId: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'MERCHANT' | 'USER' = 'USER'): string {
  const payload = JSON.stringify({ id: userId, role, exp: Date.now() + 3600000 });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

export function authenticateRequest(token: string): UserSession | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const { payload, signature } = decoded;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (Date.now() > data.exp) return null;

    return { id: data.id, role: data.role };
  } catch (err) {
    return null;
  }
}
