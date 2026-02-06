import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await app.register(corsPlugin);
  await app.register(authPlugin);

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Register routes under /api/v1 prefix
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(dashboardRoutes, { prefix: '/api/v1' });

  return app;
}
