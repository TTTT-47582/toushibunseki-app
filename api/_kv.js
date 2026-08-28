const { createClient } = require("redis");

const APP_DATA_KEY = "toushibunseki-app-data";

async function withRedis(fn) {
  const url = process.env.REDIS_URL;
  if (!url) {
    const err = new Error("Redis is not configured on the server (REDIS_URL missing)");
    err.status = 500;
    throw err;
  }
  const client = createClient({ url });
  client.on("error", () => {});
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.quit();
  }
}

async function getAppData() {
  return withRedis(async (client) => {
    const raw = await client.get(APP_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  });
}

async function setAppData(data) {
  return withRedis(async (client) => {
    await client.set(APP_DATA_KEY, JSON.stringify(data));
  });
}

module.exports = { getAppData, setAppData };
