import cors from '@fastify/cors';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'LastChangedUser'],
  });
});
