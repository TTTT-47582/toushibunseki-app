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
    const data = await jquantsGet("/markets/margin_interest", { code });
    const rows = data.margin_interest || data.data || [];
    const latest = rows[rows.length - 1];
    if (!latest) {
      res.status(200).json({ marginRatio: null });
      return;
    }
    const longBalance = pick(latest, ["LongMarginTradeVolume", "BuyBalance"]);
    const shortBalance = pick(latest, ["ShortMarginTradeVolume", "SellBalance"]);
    const marginRatio = longBalance && shortBalance
      ? Math.round((longBalance / shortBalance) * 100) / 100
      : null;

    res.status(200).json({ marginRatio });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
