import pino from 'pino';

import { env } from '../config/env';

export const logger = pino({
  name: 'tradeflow-api',
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});
