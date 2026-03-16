import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found';
import { requestLogger } from './middlewares/request-logger';
import { appRouter } from './routes';

export const app = express();

app.disable('x-powered-by');
app.use(requestLogger);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/', (_req, res) => {
  res.status(200).json({
    service: 'TradeFlow API',
    status: 'ok',
    environment: env.NODE_ENV,
  });
});

app.use(env.API_PREFIX, appRouter);
app.use(notFoundHandler);
app.use(errorHandler);
