import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

export const connection = new IORedis(config.redisUrl);
export const roundQueue = new Queue('rounds', { connection });
