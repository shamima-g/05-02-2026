import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production-at-least-32-chars',
  });
});
