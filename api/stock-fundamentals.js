const { jquantsGet } = require("./_jquants");

function pick(row, candidates) {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
}

function round(value, digits = 2) {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

module.exports = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    res.status(400).json({ error: "code query parameter is required" });
    return;
  }

  try {
    const [finData, quotesData] = await Promise.all([
      jquantsGet("/fins/summary", { code }),
      jquantsGet("/equities/bars/daily", { code, from: recentDate(30), to: recentDate(0) })
    ]);

    const finRows = finData.fin_summary || finData.data || finData.statements || [];
    const latestFin = finRows[finRows.length - 1] || {};

    const quoteRows = quotesData.daily_quotes || quotesData.data || quotesData.bars || [];
    const latestQuote = quoteRows[quoteRows.length - 1] || {};
    const latestClose = pick(latestQuote, ["C", "Close", "close", "AdjC", "AdjClose"]);

    const eps = pick(latestFin, ["EPS", "eps"]);
    const bps = pick(latestFin, ["BPS", "bps", "NetAssetsPerShare"]);
    const netProfit = pick(latestFin, ["NP", "NetProfit"]);
    const equity = pick(latestFin, ["NetAssets", "Equity", "TotalNetAssets"]);
    const totalAssets = pick(latestFin, ["TA", "TotalAssets"]);
    const dividendPerShare = pick(latestFin, ["DivAnn", "DividendPerShare", "AnnualDividend"]);
    const sharesOutstanding = pick(latestFin, ["SharesOutstanding", "IssuedShares"]);

    const per = eps && latestClose ? round(latestClose / eps) : null;
    const pbr = bps && latestClose ? round(latestClose / bps) : null;
    const roe = netProfit && equity ? round((netProfit / equity) * 100) : null;
    const roa = netProfit && totalAssets ? round((netProfit / totalAssets) * 100) : null;
    const equityRatio = equity && totalAssets ? round((equity / totalAssets) * 100) : null;
    const dividendYield = dividendPerShare && latestClose ? round((dividendPerShare / latestClose) * 100) : null;
    const marketCap = sharesOutstanding && latestClose
      ? round((sharesOutstanding * latestClose) / 100000000)
      : null;

    res.status(200).json({ per, pbr, roe, roa, equityRatio, dividendYield, marketCap, eps, bps, latestClose });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

function recentDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
