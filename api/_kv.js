const { Redis } = require("@upstash/redis");

const APP_DATA_KEY = "toushibunseki-app-data";

function getRedisClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    const err = new Error("Redis is not configured on the server (KV_REST_API_URL/TOKEN missing)");
    err.status = 500;
    throw err;
  }
  return new Redis({ url, token });
}

async function getAppData() {
  const redis = getRedisClient();
  return redis.get(APP_DATA_KEY);
}

async function setAppData(data) {
  const redis = getRedisClient();
  await redis.set(APP_DATA_KEY, data);
}

module.exports = { getAppData, setAppData };
