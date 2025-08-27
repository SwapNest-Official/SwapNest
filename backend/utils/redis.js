import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache middleware for Express routes
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    try {
      const key = `cache:${req.originalUrl}`;
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data) {
        // Cache the response
        redis.setex(key, duration, JSON.stringify(data));
        
        // Call original send method
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Redis cache error:', error);
      next(); // Continue without caching if Redis fails
    }
  };
};

// Cache product data
export const cacheProduct = async (productId, productData, duration = 3600) => {
  try {
    const key = `product:${productId}`;
    await redis.setex(key, duration, JSON.stringify(productData));
  } catch (error) {
    console.error('Error caching product:', error);
  }
};

// Get cached product data
export const getCachedProduct = async (productId) => {
  try {
    const key = `product:${productId}`;
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached product:', error);
    return null;
  }
};

// Cache user data
export const cacheUser = async (userId, userData, duration = 1800) => {
  try {
    const key = `user:${userId}`;
    await redis.setex(key, duration, JSON.stringify(userData));
  } catch (error) {
    console.error('Error caching user:', error);
  }
};

// Get cached user data
export const getCachedUser = async (userId) => {
  try {
    const key = `user:${userId}`;
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
};

// Cache search results
export const cacheSearchResults = async (query, results, duration = 1800) => {
  try {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    await redis.setex(key, duration, JSON.stringify(results));
  } catch (error) {
    console.error('Error caching search results:', error);
  }
};

// Get cached search results
export const getCachedSearchResults = async (query) => {
  try {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached search results:', error);
    return null;
  }
};

// Cache category products
export const cacheCategoryProducts = async (category, products, duration = 1800) => {
  try {
    const key = `category:${category}`;
    await redis.setex(key, duration, JSON.stringify(products));
  } catch (error) {
    console.error('Error caching category products:', error);
  }
};

// Get cached category products
export const getCachedCategoryProducts = async (category) => {
  try {
    const key = `category:${category}`;
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached category products:', error);
    return null;
  }
};

// Invalidate cache by pattern
export const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    await redis.flushdb();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Health check for Redis
export const redisHealthCheck = async () => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

export default redis;
