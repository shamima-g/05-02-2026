import type { FastifyRequest, FastifyReply } from 'fastify';

interface JwtUser {
  sub: string;
  username: string;
  roles: string[];
  permissions: string[];
}

export function requirePermission(...requiredPermissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as JwtUser;
    const hasAny = requiredPermissions.some(p => user.permissions.includes(p));
    if (!hasAny) {
      reply.status(403).send({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
  };
}

export function requireRole(...requiredRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as JwtUser;
    const hasAny = requiredRoles.some(r => user.roles.includes(r));
    if (!hasAny) {
      reply.status(403).send({ code: 'FORBIDDEN', message: 'Insufficient role' });
    }
  };
}
