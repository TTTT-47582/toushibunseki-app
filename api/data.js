const { requireAuth } = require("./_auth");
const { getAppData, setAppData } = require("./_kv");

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    try {
      const data = await getAppData();
      res.status(200).json(data || null);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "PUT") {
    try {
      await setAppData(req.body);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "method not allowed" });
};
