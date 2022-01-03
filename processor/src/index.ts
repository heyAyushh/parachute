import 'dotenv/config';
import 'source-map-support/register';
import logger from './utils/logger';

import { worker } from './work/transfer.worker';

logger.info('Worker has Started ✔️');

worker.on('completed', (job) => logger.info(`Completed job ${job.id} successfully`));
worker.on('failed', (job, err) => logger.info(`Failed job ${job.id} with ${err}`));
