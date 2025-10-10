const { RedisStringsHandler } = require("@trieb.work/nextjs-turbo-redis-cache");

// Singleton pattern to ensure only one instance of RedisStringsHandler
let cachedHandler;

function parseEnvInt(value, defaultValue) {
  const parsed = parseInt(value, 10);

  return isNaN(parsed) ? defaultValue : parsed;
}

function socketOptionsFor(redisURL) {
  if (!redisURL || !redisURL.startsWith('rediss://')) {
    return null;
  }

  return {
    tls: true,
    rejectUnauthorized: false,
  };
}

const REDIS_DB = parseEnvInt(process.env.REDIS_DB, 1);

module.exports = class CustomizedCacheHandler {
  constructor() {
    // We need this class to be available during production / docker builds,
    // but we only want to connect to Redis when actually running the server.
    if (!cachedHandler && process.env.REDIS_URL) {
      const socketOptions = socketOptionsFor(process.env.REDIS_URL);

      cachedHandler = new RedisStringsHandler({
        // https://github.com/trieb-work/nextjs-turbo-redis-cache?tab=readme-ov-file#available-options
        database: REDIS_DB,
        keyPrefix: 'meru-client:',
        timeoutMs: 2_000,
        revalidateTagQuerySize: 500,
        sharedTagsKey: '__sharedTags__',
        avgResyncIntervalMs: 10_000 * 60,
        redisGetDeduplication: false,
        inMemoryCachingTime: 3000,
        defaultStaleAge: 1209600,
        estimateExpireAge: (staleAge) => staleAge * 2,
        socketOptions,
      });
    }
  }

  get(...args) {
    return cachedHandler?.get(...args) ?? null;
  }

  set(...args) {
    return cachedHandler?.set(...args) ?? null;
  }

  revalidateTag(...args) {
    return cachedHandler?.revalidateTag(...args) ?? null;
  }

  resetRequestCache(...args) {
    return cachedHandler?.resetRequestCache(...args) ?? null;
  }
}