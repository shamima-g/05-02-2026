import { buildApp } from './app.js';

async function start() {
  const app = await buildApp();
  const port = parseInt(process.env.PORT || '5000', 10);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`InvestInsight API running on http://localhost:${port}`);
    app.log.info(`Auth endpoints: http://localhost:${port}/api/v1/auth/login`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
