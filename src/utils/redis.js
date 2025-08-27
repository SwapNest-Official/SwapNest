// Frontend Redis-like caching utility using localStorage and sessionStorage
// This provides fast local caching for better user experience

class LocalCache {
  constructor() {
    this.prefix = 'cf_cache_';
    this.defaultTTL = 1800000; // 30 minutes in milliseconds
  }

  // Generate cache key
  generateKey(key) {
    return `${this.prefix}${key}`;
  }

  // Set cache with TTL
  set(key, value, ttl = this.defaultTTL) {
    try {
      const cacheKey = this.generateKey(key);
      const cacheData = {
        value,
        timestamp: Date.now(),
        ttl
      };
      
      // Use sessionStorage for better performance
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // Also store in localStorage for persistence across sessions
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Get cache value
  get(key) {
    try {
      const cacheKey = this.generateKey(key);
      
      // Try sessionStorage first (faster)
      let cacheData = sessionStorage.getItem(cacheKey);
      
      if (!cacheData) {
        // Fallback to localStorage
        cacheData = localStorage.getItem(cacheKey);
      }
      
      if (!cacheData) {
        return null;
      }
      
      const parsed = JSON.parse(cacheData);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache
  delete(key) {
    try {
      const cacheKey = this.generateKey(key);
      sessionStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Clear all cache
  clear() {
    try {
      // Clear sessionStorage cache
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Clear localStorage cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Check if cache exists and is valid
  has(key) {
    return this.get(key) !== null;
  }

  // Get cache size (approximate)
  size() {
    try {
      let count = 0;
      
      // Count sessionStorage cache
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          count++;
        }
      });
      
      // Count localStorage cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          count++;
        }
      });
      
      return count;
    } catch (error) {
      console.error('Cache size error:', error);
      return 0;
    }
  }

  // Cache product data
  cacheProduct(productId, productData, ttl = 3600000) { // 1 hour
    return this.set(`product_${productId}`, productData, ttl);
  }

  // Get cached product data
  getCachedProduct(productId) {
    return this.get(`product_${productId}`);
  }

  // Cache search results
  cacheSearchResults(query, results, ttl = 900000) { // 15 minutes
    const key = `search_${Buffer.from(query).toString('base64')}`;
    return this.set(key, results, ttl);
  }

  // Get cached search results
  getCachedSearchResults(query) {
    const key = `search_${Buffer.from(query).toString('base64')}`;
    return this.get(key);
  }

  // Cache user data
  cacheUser(userId, userData, ttl = 1800000) { // 30 minutes
    return this.set(`user_${userId}`, userData, ttl);
  }

  // Get cached user data
  getCachedUser(userId) {
    return this.get(`user_${userId}`);
  }

  // Cache category products
  cacheCategoryProducts(category, products, ttl = 900000) { // 15 minutes
    return this.set(`category_${category}`, products, ttl);
  }

  // Get cached category products
  getCachedCategoryProducts(category) {
    return this.get(`category_${category}`);
  }

  // Invalidate cache by pattern
  invalidate(pattern) {
    try {
      const keys = [];
      
      // Find matching keys in sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.prefix) && key.includes(pattern)) {
          keys.push(key);
        }
      });
      
      // Find matching keys in localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix) && key.includes(pattern)) {
          keys.push(key);
        }
      });
      
      // Delete matching keys
      keys.forEach(key => {
        const cleanKey = key.replace(this.prefix, '');
        this.delete(cleanKey);
      });
      
      return keys.length;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return 0;
    }
  }

  // Cache with automatic cleanup
  setWithCleanup(key, value, ttl = this.defaultTTL) {
    // Clean up expired cache entries first
    this.cleanup();
    
    return this.set(key, value, ttl);
  }

  // Clean up expired cache entries
  cleanup() {
    try {
      const now = Date.now();
      
      // Clean sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const cacheData = JSON.parse(sessionStorage.getItem(key));
            if (now - cacheData.timestamp > cacheData.ttl) {
              sessionStorage.removeItem(key);
            }
          } catch (e) {
            // Remove invalid cache entries
            sessionStorage.removeItem(key);
          }
        }
      });
      
      // Clean localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const cacheData = JSON.parse(localStorage.getItem(key));
            if (now - cacheData.timestamp > cacheData.ttl) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Remove invalid cache entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Create and export cache instance
const cache = new LocalCache();

// Auto-cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 300000);

export default cache;
