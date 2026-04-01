import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'scyfco_session';

type SessionUser = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  sessions: string[];
  equipe: string;
};

export type SessionPayload = {
  intervenant: SessionUser;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET manquant');
  }
  return new TextEncoder().encode(secret);
};

export const createSessionToken = async (payload: SessionPayload) => {
  const secret = getJwtSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
};

export const verifySessionToken = async (token: string) => {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify<SessionPayload>(token, secret);
  return payload;
};

export const getSessionFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
};

