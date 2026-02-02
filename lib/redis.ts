import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

const nodeEnv = process.env.NODE_ENV;
const isDev = nodeEnv === 'development';

// Check for required Redis credentials in non-development environments
if (!isDev) {
  if (!process.env.REDIS_USERNAME || !process.env.REDIS_PASSWORD) {
    throw new Error(
      '[Redis] REDIS_USERNAME and REDIS_PASSWORD are required for non-development environments'
    );
  }
}

// Construct Redis URL based on environment
let redisUrl: string;
if (isDev) {
  redisUrl = 'redis://localhost:6379';
} else {
  const username = encodeURIComponent(process.env.REDIS_USERNAME || '');
  const password = encodeURIComponent(process.env.REDIS_PASSWORD || '');
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  redisUrl = `redis://${username}:${password}@${host}:${port}`;
}

const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 5000, // 5 second timeout
  },
});

let isRedisConnected = false;

// Connect to Redis
redisClient.connect()
  .then(() => {
    isRedisConnected = true;
    console.log('Redis connected successfully');
  })
  .catch((err) => {
    isRedisConnected = false;
    console.error('Redis connection error:', err);
  });

export async function storeDecryptedMsisdn(
  userIp: string,
  decryptedMsisdn: string,
  encryptedMsisdn: string
): Promise<string> {
  // Skip if Redis is not connected
  if (!isRedisConnected) {
    console.warn('Redis not connected, skipping storage');
    return '';
  }

  try {
    const uuid = uuidv4();
    const key = `${userIp}:${uuid}`;

    // Store both decrypted and encrypted msisdn as JSON
    const data = JSON.stringify({
      decrypted: decryptedMsisdn,
      encrypted: encryptedMsisdn,
    });

    // Store with TTL of 1 hour (3600 seconds)
    await redisClient.setEx(key, 3600, data);

    console.log(`Stored MSISDN in Redis with key: ${key}`);
    return key;
  } catch (error) {
    console.error('Error storing MSISDN in Redis:', error);
    throw error;
  }
}

export async function getDecryptedMsisdn(key: string): Promise<string | null> {
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
