import type { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import { getPendingActionsForRoles, mockActivity, mockDataQuality, mockBatches } from '../data/mock/dashboard.js';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  // GET /dashboard/pending-actions
  fastify.get('/dashboard/pending-actions', { preHandler: [authenticate] }, async (request) => {
    const user = request.user as { roles: string[] };
    return getPendingActionsForRoles(user.roles);
  });

  // GET /dashboard/activity
  fastify.get<{ Querystring: { limit?: string } }>('/dashboard/activity', { preHandler: [authenticate] }, async (request) => {
    const limit = parseInt(request.query.limit || '20', 10);
    return mockActivity.slice(0, limit);
  });

  // GET /dashboard/data-quality-summary
  fastify.get('/dashboard/data-quality-summary', { preHandler: [authenticate] }, async () => {
    return mockDataQuality;
  });

  // GET /report-batches (with optional status filter)
  fastify.get<{ Querystring: { status?: string; page?: string; pageSize?: string } }>(
    '/report-batches',
    { preHandler: [authenticate] },
    async (request) => {
      let batches = [...mockBatches];

      if (request.query.status) {
        batches = batches.filter(b => b.status === request.query.status);
      }

      const page = parseInt(request.query.page || '1', 10);
      const pageSize = parseInt(request.query.pageSize || '20', 10);
      const start = (page - 1) * pageSize;
      const items = batches.slice(start, start + pageSize);

      return {
        items,
        meta: {
          page,
          pageSize,
          totalItems: batches.length,
          totalPages: Math.ceil(batches.length / pageSize),
        },
      };
    },
  );
}
