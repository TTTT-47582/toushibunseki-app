const { jquantsGet } = require("./_jquants");

function pick(row, candidates) {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

module.exports = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    res.status(400).json({ error: "code query parameter is required" });
    return;
  }

  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);

  try {
    const data = await jquantsGet("/equities/bars/daily", {
      code,
      from: formatDate(from),
      to: formatDate(to)
    });
    const rows = data.daily_quotes || data.data || data.bars || [];
    const bars = rows
      .map((row) => ({
        date: pick(row, ["Date", "date"]),
        open: pick(row, ["O", "Open", "open"]),
        high: pick(row, ["H", "High", "high"]),
        low: pick(row, ["L", "Low", "low"]),
        close: pick(row, ["C", "Close", "close", "AdjC", "AdjClose"]),
        volume: pick(row, ["Vo", "Volume", "volume", "AdjVo", "AdjVolume"])
      }))
      .filter((b) => b.date && b.open !== null && b.close !== null)
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    res.status(200).json(bars);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
