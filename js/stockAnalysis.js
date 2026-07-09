let currentTicker = null;

function normalizeSymbol(code) {
  const trimmed = code.trim();
  if (trimmed.includes(":")) return trimmed.toUpperCase();
  return `TSE:${trimmed}`;
}

function buildTradingViewUrl(symbol) {
  return `https://jp.tradingview.com/symbols/${encodeURIComponent(symbol.replace(":", "-"))}/`;
}

function buildYahooUrl(symbol) {
  if (symbol.startsWith("TSE:")) {
    const code = symbol.slice(4);
    return `https://finance.yahoo.co.jp/quote/${encodeURIComponent(code)}.T`;
  }
  if (symbol.includes(":")) {
    const code = symbol.split(":")[1];
    return `https://finance.yahoo.com/quote/${encodeURIComponent(code)}`;
  }
  return null;
}

function renderStockAnalysis() {
  const panel = document.getElementById("panel-stockAnalysis");
  const data = loadData();
  const savedTickers = Object.keys(data.stockNotes);
  if (!currentTicker && savedTickers.length) currentTicker = savedTickers[0];

  const note = currentTicker && data.stockNotes[currentTicker]
    ? data.stockNotes[currentTicker]
    : { fundamentals: {}, supplyDemand: {} };
  const f = note.fundamentals || {};
  const s = note.supplyDemand || {};

  panel.innerHTML = `
    <div class="card">
      <h2>銘柄分析</h2>
      <div class="ticker-select-row">
        <select id="savedTickerSelect">
          <option value="">-- 保存済み銘柄から選択 --</option>
          ${savedTickers.map((t) => `<option value="${t}" ${t === currentTicker ? "selected" : ""}>${t}</option>`).join("")}
        </select>
        <input type="text" id="tickerInput" placeholder="銘柄コード（例: 7203）またはシンボル（例: NASDAQ:AAPL）" value="${currentTicker ? (currentTicker.includes(":") ? "" : currentTicker) : ""}">
        <button class="btn" id="loadTickerBtn">表示</button>
      </div>
      ${currentTicker ? `
      <p class="empty-state" style="padding-top:0;">
        日本株・指数はデータライセンスの都合でTradingViewの埋め込みチャートが表示できない場合があります。その場合は下のリンクから実チャートを開いてください。
      </p>
      <div class="ticker-select-row">
        <a class="btn btn-secondary" href="${buildTradingViewUrl(currentTicker)}" target="_blank" rel="noopener noreferrer">TradingViewで開く</a>
        ${buildYahooUrl(currentTicker) ? `<a class="btn btn-secondary" href="${buildYahooUrl(currentTicker)}" target="_blank" rel="noopener noreferrer">Yahoo!ファイナンスで開く</a>` : ""}
      </div>
      ` : ""}
      <div id="tv-chart-container"></div>
      <div class="empty-state" id="noTickerMsg" style="${currentTicker ? "display:none;" : ""}">銘柄コードを入力してチャートを表示してください。</div>
    </div>

    ${currentTicker ? `
    <div class="card">
      <h2>${currentTicker} の分析メモ</h2>
      <form id="stockNoteForm">
        <h3>① ファンダメンタルズ分析</h3>
        <div class="form-grid">
          <div class="form-field"><label>PER</label><input type="text" name="per" value="${escapeHtml(f.per || "")}"></div>
          <div class="form-field"><label>PBR</label><input type="text" name="pbr" value="${escapeHtml(f.pbr || "")}"></div>
          <div class="form-field"><label>ROE</label><input type="text" name="roe" value="${escapeHtml(f.roe || "")}"></div>
          <div class="form-field full-width">
            <label>業績推移（売上高・営業利益・経常利益、前年同期比、進捗率）</label>
            <textarea name="earningsTrend">${escapeHtml(f.earningsTrend || "")}</textarea>
          </div>
          <div class="form-field full-width">
            <label>事業内容・収益構造・競合優位性（moat）</label>
            <textarea name="businessModel">${escapeHtml(f.businessModel || "")}</textarea>
          </div>
          <div class="form-field full-width">
            <label>業界動向（市場拡大性・規制・技術変化リスク）</label>
            <textarea name="industryTrend">${escapeHtml(f.industryTrend || "")}</textarea>
          </div>
          <div class="form-field full-width">
            <label>経営者・IR姿勢（中期経営計画の進捗、株主還元方針）</label>
            <textarea name="managementIr">${escapeHtml(f.managementIr || "")}</textarea>
          </div>
        </div>

        <h3>③ 需給分析</h3>
        <div class="form-grid">
          <div class="form-field"><label>信用倍率（買い残/売り残）</label><input type="text" name="marginRatio" value="${escapeHtml(s.marginRatio || "")}"></div>
          <div class="form-field"><label>空売り比率</label><input type="text" name="shortRatio" value="${escapeHtml(s.shortRatio || "")}"></div>
          <div class="form-field full-width">
            <label>機関投資家・外国人投資家の売買動向</label>
            <textarea name="institutionalFlow">${escapeHtml(s.institutionalFlow || "")}</textarea>
          </div>
        </div>

        <button type="submit" class="btn">メモを保存</button>
        <button type="button" class="btn btn-danger" id="deleteNoteBtn">この銘柄のメモを削除</button>
      </form>
    </div>
    ` : ""}
  `;

  if (currentTicker) {
    loadTradingViewWidget(currentTicker);
  }

  panel.querySelector("#loadTickerBtn").addEventListener("click", () => {
    const val = panel.querySelector("#tickerInput").value.trim();
    if (!val) return;
    currentTicker = normalizeSymbol(val);
    renderStockAnalysis();
  });

  panel.querySelector("#savedTickerSelect").addEventListener("change", (e) => {
    if (!e.target.value) return;
    currentTicker = e.target.value;
    renderStockAnalysis();
  });

  const form = panel.querySelector("#stockNoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const d = loadData();
      d.stockNotes[currentTicker] = {
        fundamentals: {
          per: fd.get("per"),
          pbr: fd.get("pbr"),
          roe: fd.get("roe"),
          earningsTrend: fd.get("earningsTrend"),
          businessModel: fd.get("businessModel"),
          industryTrend: fd.get("industryTrend"),
          managementIr: fd.get("managementIr")
        },
        supplyDemand: {
          marginRatio: fd.get("marginRatio"),
          shortRatio: fd.get("shortRatio"),
          institutionalFlow: fd.get("institutionalFlow")
        },
        updatedAt: new Date().toISOString()
      };
      saveData(d);
      renderStockAnalysis();
    });

    panel.querySelector("#deleteNoteBtn").addEventListener("click", () => {
      if (!confirm(`${currentTicker} のメモを削除しますか？`)) return;
      const d = loadData();
      delete d.stockNotes[currentTicker];
      saveData(d);
      currentTicker = null;
      renderStockAnalysis();
    });
  }
}

function loadTradingViewWidget(symbol) {
  const container = document.getElementById("tv-chart-container");
  if (!container || typeof TradingView === "undefined") return;
  container.innerHTML = "";
  new TradingView.widget({
    width: "100%",
    height: 460,
    symbol: symbol,
    interval: "D",
    timezone: "Asia/Tokyo",
    theme: "light",
    style: "1",
    locale: "ja",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    allow_symbol_change: true,
    studies: ["MASimple@tv-basicstudies", "MASimple@tv-basicstudies", "RSI@tv-basicstudies"],
    container_id: "tv-chart-container"
  });
}
