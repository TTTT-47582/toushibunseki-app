const JQUANTS_BASE_URL = "https://api.jquants.com/v2";

async function jquantsGet(path, params) {
  const apiKey = process.env.JQUANTS_API_KEY;
  if (!apiKey) {
    const err = new Error("JQUANTS_API_KEY is not configured on the server");
    err.status = 500;
    throw err;
  }
  const url = new URL(`${JQUANTS_BASE_URL}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": apiKey }
  });

  if (!res.ok) {
    const err = new Error(`J-Quants API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

module.exports = { jquantsGet };
