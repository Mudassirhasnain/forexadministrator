import jwt from 'jsonwebtoken';

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'CRITICAL CONFIGURATION ERROR: AUTH_SECRET environment variable is missing. Authentication cannot function without a configured secret.'
    );
  }
  return secret.trim();
}

export interface AdminJwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAdminToken(payload: AdminJwtPayload): string {
  const secret = getAuthSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const secret = getAuthSecret();
    return jwt.verify(token, secret) as AdminJwtPayload;
  } catch {
    return null;
  }
}
