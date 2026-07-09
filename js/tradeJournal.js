let pnlChartInstance = null;

function computePnl(trade) {
  if (trade.exitPrice === null || trade.exitPrice === undefined || trade.exitPrice === "") {
    return null;
  }
  const diff = trade.side === "buy"
    ? trade.exitPrice - trade.price
    : trade.price - trade.exitPrice;
  return Math.round(diff * trade.qty * 100) / 100;
}

function renderTradeJournal() {
  const panel = document.getElementById("panel-tradeJournal");
  const data = loadData();
  const trades = [...data.trades].sort((a, b) => (a.date < b.date ? 1 : -1));

  const closedTrades = trades.filter((t) => computePnl(t) !== null);
  const wins = closedTrades.filter((t) => computePnl(t) > 0).length;
  const winRate = closedTrades.length ? Math.round((wins / closedTrades.length) * 1000) / 10 : 0;
  const totalPnl = closedTrades.reduce((sum, t) => sum + computePnl(t), 0);
  const avgPnl = closedTrades.length ? Math.round((totalPnl / closedTrades.length) * 100) / 100 : 0;

  panel.innerHTML = `
    <div class="card">
      <h2>新規トレード記録</h2>
      <form id="tradeForm">
        <div class="form-grid">
          <div class="form-field">
            <label>日付</label>
            <input type="date" name="date" value="${todayKey()}" required>
          </div>
          <div class="form-field">
            <label>銘柄コード/名</label>
            <input type="text" name="ticker" placeholder="例: 7203 トヨタ" required>
          </div>
          <div class="form-field">
            <label>売買区分</label>
            <select name="side">
              <option value="buy">買い(ロング)</option>
              <option value="sell">売り(ショート)</option>
            </select>
          </div>
          <div class="form-field">
            <label>エントリー価格</label>
            <input type="number" step="0.01" name="price" required>
          </div>
          <div class="form-field">
            <label>数量</label>
            <input type="number" step="1" name="qty" required>
          </div>
          <div class="form-field">
            <label>損切りライン</label>
            <input type="number" step="0.01" name="stopLoss">
          </div>
          <div class="form-field">
            <label>決済価格（未決済なら空欄）</label>
            <input type="number" step="0.01" name="exitPrice">
          </div>
          <div class="form-field full-width">
            <label>エントリー根拠</label>
            <textarea name="rationale" placeholder="なぜこのタイミング・価格で判断したか"></textarea>
          </div>
          <div class="form-field full-width">
            <label>振り返り（シナリオ通りだったか / 結果はどうだったか）</label>
            <textarea name="review"></textarea>
          </div>
        </div>
        <button type="submit" class="btn">記録する</button>
      </form>
    </div>

    <div class="card">
      <h2>成績サマリー</h2>
      <div class="summary-row">
        <div class="summary-stat">
          <div class="label">決済済みトレード数</div>
          <div class="value">${closedTrades.length}</div>
        </div>
        <div class="summary-stat">
          <div class="label">勝率</div>
          <div class="value">${winRate}%</div>
        </div>
        <div class="summary-stat">
          <div class="label">合計損益</div>
          <div class="value ${totalPnl >= 0 ? "pnl-positive" : "pnl-negative"}">${totalPnl.toLocaleString()}</div>
        </div>
        <div class="summary-stat">
          <div class="label">平均損益</div>
          <div class="value ${avgPnl >= 0 ? "pnl-positive" : "pnl-negative"}">${avgPnl.toLocaleString()}</div>
        </div>
      </div>
      <div class="chart-wrap">
        <canvas id="pnlChart"></canvas>
      </div>
    </div>

    <div class="card">
      <h2>トレード一覧</h2>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
        <div class="form-field">
          <label>銘柄で絞り込み</label>
          <input type="text" id="filterTicker" placeholder="銘柄コード/名">
        </div>
        <div class="form-field">
          <label>勝敗で絞り込み</label>
          <select id="filterResult">
            <option value="all">すべて</option>
            <option value="win">勝ち</option>
            <option value="lose">負け</option>
            <option value="open">未決済</option>
          </select>
        </div>
      </div>
      <table id="tradeTable">
        <thead>
          <tr>
            <th>日付</th><th>銘柄</th><th>区分</th><th>価格</th><th>数量</th>
            <th>決済</th><th>損益</th><th>根拠</th><th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div id="tradeEmptyState" class="empty-state" style="display:none;">まだ記録がありません。</div>
    </div>
  `;

  function renderTable() {
    const tickerFilter = document.getElementById("filterTicker").value.trim().toLowerCase();
    const resultFilter = document.getElementById("filterResult").value;
    const tbody = panel.querySelector("#tradeTable tbody");
    const filtered = trades.filter((t) => {
      if (tickerFilter && !t.ticker.toLowerCase().includes(tickerFilter)) return false;
      const pnl = computePnl(t);
      if (resultFilter === "win" && !(pnl > 0)) return false;
      if (resultFilter === "lose" && !(pnl !== null && pnl <= 0)) return false;
      if (resultFilter === "open" && pnl !== null) return false;
      return true;
    });

    tbody.innerHTML = filtered.map((t) => {
      const pnl = computePnl(t);
      const pnlLabel = pnl === null ? "-" : pnl.toLocaleString();
      const pnlClass = pnl === null ? "" : (pnl >= 0 ? "pnl-positive" : "pnl-negative");
      return `
        <tr data-id="${t.id}">
          <td>${t.date}</td>
          <td>${escapeHtml(t.ticker)}</td>
          <td>${t.side === "buy" ? "買い" : "売り"}</td>
          <td>${t.price}</td>
          <td>${t.qty}</td>
          <td>${t.exitPrice ?? "-"}</td>
          <td class="${pnlClass}">${pnlLabel}</td>
          <td>${escapeHtml(t.rationale || "").slice(0, 30)}</td>
          <td><button class="btn btn-danger btn-delete-trade" data-id="${t.id}">削除</button></td>
        </tr>
      `;
    }).join("");

    document.getElementById("tradeEmptyState").style.display = filtered.length ? "none" : "block";
  }

  renderTable();
  panel.querySelector("#filterTicker").addEventListener("input", renderTable);
  panel.querySelector("#filterResult").addEventListener("change", renderTable);

  panel.querySelector("#tradeTable tbody").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete-trade");
    if (!btn) return;
    if (!confirm("このトレード記録を削除しますか？")) return;
    const d = loadData();
    d.trades = d.trades.filter((t) => t.id !== btn.dataset.id);
    saveData(d);
    renderTradeJournal();
  });

  panel.querySelector("#tradeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const d = loadData();
    d.trades.push({
      id: generateId(),
      date: fd.get("date"),
      ticker: fd.get("ticker").trim(),
      side: fd.get("side"),
      price: parseFloat(fd.get("price")),
      qty: parseFloat(fd.get("qty")),
      stopLoss: fd.get("stopLoss") ? parseFloat(fd.get("stopLoss")) : null,
      exitPrice: fd.get("exitPrice") ? parseFloat(fd.get("exitPrice")) : null,
      rationale: fd.get("rationale").trim(),
      review: fd.get("review").trim()
    });
    saveData(d);
    renderTradeJournal();
  });

  renderPnlChart(closedTrades);
}

function renderPnlChart(closedTrades) {
  const ctx = document.getElementById("pnlChart");
  if (!ctx) return;
  const sorted = [...closedTrades].sort((a, b) => (a.date > b.date ? 1 : -1));
  let cumulative = 0;
  const labels = [];
  const values = [];
  sorted.forEach((t) => {
    cumulative += computePnl(t);
    labels.push(t.date);
    values.push(cumulative);
  });

  if (pnlChartInstance) {
    pnlChartInstance.destroy();
  }
  pnlChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "累積損益",
        data: values,
        borderColor: "#1a56db",
        backgroundColor: "rgba(26, 86, 219, 0.1)",
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
