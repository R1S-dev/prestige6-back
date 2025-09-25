import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { api } from './routes';
import { config } from './config';
import { logger } from './logger';

export function makeApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger } as any));

  app.get('/', (_req, res) => res.json({ name: 'lucky-six-server', ok: true }));
  app.use('/api', api);

  // error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status ?? 400;
    res.status(status).json({ error: err.message ?? 'Bad Request' });
  });

  return app;
}
