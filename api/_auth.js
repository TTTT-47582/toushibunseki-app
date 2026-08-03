function requireAuth(req, res) {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    res.status(500).json({ error: "APP_SECRET is not configured on the server" });
    return false;
  }
  const provided = req.headers["x-app-secret"];
  if (provided !== secret) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

module.exports = { requireAuth };
