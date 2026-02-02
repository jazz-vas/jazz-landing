import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
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
