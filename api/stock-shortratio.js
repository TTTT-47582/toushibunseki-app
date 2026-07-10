const { jquantsGet } = require("./_jquants");

function pick(row, candidates) {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
}

module.exports = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    res.status(400).json({ error: "code query parameter is required" });
    return;
  }

  try {
    const data = await jquantsGet("/markets/short_selling", { code });
    const rows = data.short_selling || data.data || [];
    const latest = rows[rows.length - 1];
    if (!latest) {
      res.status(200).json({ shortRatio: null });
      return;
    }
    const shortRatio = pick(latest, ["ShortSellingRatio", "ShortSaleRatio"]);

    res.status(200).json({ shortRatio });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
