import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { findUserByUsername, getUserAuthInfo } from '../data/mock/users.js';
import { authenticate } from '../middleware/authenticate.js';
import type { LoginRequest, RefreshRequest } from '../types/index.js';

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)(h|d|m|s)$/);
  if (!match) return 3600;
  const [, num, unit] = match;
  const n = parseInt(num, 10);
  switch (unit) {
    case 's': return n;
    case 'm': return n * 60;
    case 'h': return n * 3600;
    case 'd': return n * 86400;
    default: return 3600;
  }
}

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login
  fastify.post<{ Body: LoginRequest }>('/auth/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Username and password are required',
      });
    }

    const user = findUserByUsername(username);

    if (!user) {
      return reply.status(401).send({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      });
    }

    if (!user.isActive) {
      return reply.status(403).send({
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Your account has been deactivated. Please contact your administrator.',
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return reply.status(401).send({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      });
    }

    const authInfo = getUserAuthInfo(user);

    const accessToken = fastify.jwt.sign(
      {
        sub: authInfo.id,
        username: authInfo.username,
        displayName: authInfo.displayName,
        email: authInfo.email,
        roles: authInfo.roles,
        permissions: authInfo.permissions,
      },
      { expiresIn: ACCESS_EXPIRY },
    );

    const refreshToken = fastify.jwt.sign(
      {
        sub: authInfo.id,
        username: authInfo.username,
        type: 'refresh',
      },
      { expiresIn: REFRESH_EXPIRY },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: parseExpiryToSeconds(ACCESS_EXPIRY),
      user: authInfo,
    };
  });

  // GET /auth/me
  fastify.get('/auth/me', { preHandler: [authenticate] }, async (request) => {
    const payload = request.user as {
      sub: string;
      username: string;
      displayName: string;
      email: string;
      roles: string[];
      permissions: string[];
    };

    return {
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  });

  // POST /auth/refresh
  fastify.post<{ Body: RefreshRequest }>('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Refresh token is required',
      });
    }

    try {
      const decoded = fastify.jwt.verify<{
        sub: string;
        username: string;
        type?: string;
      }>(refreshToken);

      if (decoded.type !== 'refresh') {
        return reply.status(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        });
      }

      const user = findUserByUsername(decoded.username);
      if (!user || !user.isActive) {
        return reply.status(401).send({
          code: 'INVALID_TOKEN',
          message: 'User not found or deactivated',
        });
      }

      const authInfo = getUserAuthInfo(user);

      const newAccessToken = fastify.jwt.sign(
        {
          sub: authInfo.id,
          username: authInfo.username,
          displayName: authInfo.displayName,
          email: authInfo.email,
          roles: authInfo.roles,
          permissions: authInfo.permissions,
        },
        { expiresIn: ACCESS_EXPIRY },
      );

      const newRefreshToken = fastify.jwt.sign(
        {
          sub: authInfo.id,
          username: authInfo.username,
          type: 'refresh',
        },
        { expiresIn: REFRESH_EXPIRY },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: parseExpiryToSeconds(ACCESS_EXPIRY),
        user: authInfo,
      };
    } catch {
      return reply.status(401).send({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired refresh token',
      });
    }
  });
}
