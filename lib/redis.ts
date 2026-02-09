import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

let redisClient: any = null;
let isRedisConnected = false;

/**
 * Initialize and connect to Redis
 */
async function initializeRedis() {
  if (redisClient) {
    return;
  }

  const nodeEnv = process.env.NODE_ENV;
  const isDev = nodeEnv === 'development';

  // Check for required Redis credentials in non-development environments
  if (!isDev) {
    if (!process.env.REDIS_USER || !process.env.REDIS_PASSWORD) {
      throw new Error(
        '[Redis] REDIS_USER and REDIS_PASSWORD are required for non-development environments'
      );
    }
  }

  // Construct Redis URL based on environment
  let redisUrl: string;
  if (isDev) {
    redisUrl = 'redis://localhost:6379';
  } else {
    const username = encodeURIComponent(process.env.REDIS_USER || '');
    const password = encodeURIComponent(process.env.REDIS_PASSWORD || '');
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || '6379';
    redisUrl = `redis://${username}:${password}@${host}:${port}`;
  }

  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000, // 5 second timeout
    },
  });

  redisClient.on('error', (err: any) => {
    isRedisConnected = false;
    console.error('Redis connection error:', err);
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('Redis connected successfully');
  });

  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (err) {
    isRedisConnected = false;
    console.error('Redis connection error:', err);
  }
}

export async function storeDecryptedMsisdn(
  userIp: string,
  decryptedMsisdn: string,
  encryptedMsisdn: string,
  msisdnStatus: 'valid' | 'invalid' = 'valid'
): Promise<string> {
  await initializeRedis();

  // Skip if Redis is not connected
  if (!isRedisConnected) {
    console.warn('Redis not connected, skipping storage');
    return '';
  }

  try {
    const uuid = uuidv4();
    const key = `jazz-vas:${userIp}:${uuid}`;

    // Store both decrypted and encrypted msisdn as JSON with status
    const data = JSON.stringify({
      decrypted: decryptedMsisdn,
      encrypted: encryptedMsisdn,
      msisdnStatus: msisdnStatus,
    });

    // Store with TTL of 5 minutes (300 seconds)
    await redisClient.setEx(key, 300, data);

    console.log(`Stored MSISDN in Redis with key: ${key}`);
    return key;
  } catch (error) {
    console.error('Error storing MSISDN in Redis:', error);
    throw error;
  }
}

export async function getDecryptedMsisdn(key: string): Promise<string | null> {
  await initializeRedis();

  try {
    const data = await redisClient.get(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.decrypted;
  } catch (error) {
    console.error('Error retrieving MSISDN from Redis:', error);
    throw error;
  }
}

export async function getEncryptedMsisdn(key: string): Promise<string | null> {
  await initializeRedis();

  try {
    const data = await redisClient.get(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.encrypted;
  } catch (error) {
    console.error('Error retrieving encrypted MSISDN from Redis:', error);
    throw error;
  }
}

export async function storeCampaignData(
  userIp: string,
  campaignData: {
    variantName: string;
    partnerId: number;
    campaignName: string;
  }
): Promise<string> {
  await initializeRedis();

  // Skip if Redis is not connected
  if (!isRedisConnected) {
    console.warn('Redis not connected, skipping campaign data storage');
    return '';
  }

  try {
    const uuid = uuidv4();
    const key = `jazz-vas:${userIp}:${uuid}`;

    // Store campaign data as JSON
    const data = JSON.stringify(campaignData);

    // Store with TTL of 10 minutes (600 seconds)
    await redisClient.setEx(key, 600, data);

    console.log(`Stored campaign data in Redis with key: ${key}`);
    return key;
  } catch (error) {
    console.error('Error storing campaign data in Redis:', error);
    throw error;
  }
}

export async function getCampaignData(key: string): Promise<{
  productName: string;
  variantId: number;
  partnerId: number;
  campaignName: string;
} | null> {
  await initializeRedis();

  try {
    const data = await redisClient.get(key);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving campaign data from Redis:', error);
    throw error;
  }
}
