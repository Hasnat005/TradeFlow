import pino from 'pino';

import { env } from '../config/env';

const isVercelRuntime = process.env.VERCEL === '1';
const shouldUsePrettyTransport = env.NODE_ENV === 'development' && !isVercelRuntime && Boolean(process.stdout?.isTTY);

export const logger = pino({
  name: 'tradeflow-api',
  level: env.LOG_LEVEL,
  transport:
    shouldUsePrettyTransport
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
