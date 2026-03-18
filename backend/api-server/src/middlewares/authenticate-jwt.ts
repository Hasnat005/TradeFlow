import { createHmac, timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { AppError } from '../utils/app-error';

type JwtPayload = {
  sub?: string;
  user_id?: string;
  userId?: string;
  company_id?: string;
  companyId?: string;
  exp?: number;
};

export type AuthContext = {
  userId: string;
  companyId: string;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function encodeBase64Url(value: Buffer) {
  return value
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function verifyJwt(token: string) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new AppError(401, 'Invalid authentication token', 'INVALID_TOKEN');
  }

  const [headerPart, payloadPart, signaturePart] = parts;

  const expectedSignature = encodeBase64Url(
    createHmac('sha256', env.JWT_SECRET).update(`${headerPart}.${payloadPart}`).digest(),
  );

  const given = Buffer.from(signaturePart);
  const expected = Buffer.from(expectedSignature);

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new AppError(401, 'Invalid authentication token', 'INVALID_TOKEN_SIGNATURE');
  }

  const payloadJson = decodeBase64Url(payloadPart);
  const payload = JSON.parse(payloadJson) as JwtPayload;

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new AppError(401, 'Authentication token has expired', 'TOKEN_EXPIRED');
  }

  return payload;
}

export function getAuthContext(req: Request): AuthContext {
  const auth = (req as AuthenticatedRequest).auth;

  if (!auth) {
    throw new AppError(401, 'Authentication required', 'AUTH_REQUIRED');
  }

  return auth;
}

export function authenticateJwt(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing bearer token', 'MISSING_TOKEN');
    }

    const token = authorization.slice(7).trim();
    const payload = verifyJwt(token);

    const userId = String(payload.sub ?? payload.user_id ?? payload.userId ?? '').trim();
    const companyId = String(payload.company_id ?? payload.companyId ?? '').trim();

    if (!userId || !companyId) {
      throw new AppError(401, 'Invalid authentication payload', 'INVALID_TOKEN_PAYLOAD');
    }

    (req as AuthenticatedRequest).auth = {
      userId,
      companyId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
