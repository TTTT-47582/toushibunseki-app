let currentTicker = null;

function normalizeSymbol(code) {
  const trimmed = code.trim();
  if (trimmed.includes(":")) return trimmed.toUpperCase();
  return `TSE:${trimmed}`;
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
    : { fundamentals: {}, supplyDemand: {}, valuation: {} };
  const f = note.fundamentals || {};
  const s = note.supplyDemand || {};
  const v = note.valuation || {};

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
      ${currentTicker && buildYahooUrl(currentTicker) ? `
      <div class="ticker-select-row">
        <a class="btn btn-secondary" href="${buildYahooUrl(currentTicker)}" target="_blank" rel="noopener noreferrer">Yahoo!ファイナンスで開く</a>
      </div>
      ` : ""}
      <div id="jp-chart-status" class="empty-state" style="padding-top:0;"></div>
      <div id="jp-chart-wrap" style="display:none; height:420px;"><canvas id="jp-chart-container"></canvas></div>
      <div class="empty-state" id="noTickerMsg" style="${currentTicker ? "display:none;" : ""}">銘柄コードを入力してチャートを表示してください。</div>
    </div>

    ${currentTicker ? `
    <div class="card">
      <h2>${currentTicker} の分析メモ</h2>
      <form id="stockNoteForm">
        <h3>① ファンダメンタルズ分析</h3>
        <div class="ticker-select-row">
          <button type="button" class="btn btn-secondary" id="fetchFundamentalsBtn">PER/PBR/ROEを自動取得</button>
          <span id="fetchFundamentalsStatus" class="empty-state" style="padding:0;"></span>
        </div>
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
        <div class="ticker-select-row">
          <button type="button" class="btn btn-secondary" id="fetchMarginBtn">信用倍率を自動取得</button>
          <button type="button" class="btn btn-secondary" id="fetchShortRatioBtn">空売り比率を自動取得</button>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>信用倍率（買い残/売り残）</label>
            <input type="text" name="marginRatio" value="${escapeHtml(s.marginRatio || "")}">
            <span id="fetchMarginStatus" class="empty-state" style="padding:0;"></span>
          </div>
          <div class="form-field">
            <label>空売り比率</label>
            <input type="text" name="shortRatio" value="${escapeHtml(s.shortRatio || "")}">
            <span id="fetchShortRatioStatus" class="empty-state" style="padding:0;"></span>
          </div>
          <div class="form-field full-width">
            <label>機関投資家・外国人投資家の売買動向</label>
            <textarea name="institutionalFlow">${escapeHtml(s.institutionalFlow || "")}</textarea>
          </div>
        </div>

        <button type="submit" class="btn">メモを保存</button>
        <button type="button" class="btn btn-danger" id="deleteNoteBtn">この銘柄のメモを削除</button>
      </form>
    </div>

    <div class="card">
      <h2>④ 理論株価計算</h2>
      <p class="empty-state" style="padding-top:0;">EPS・BPS・配当などを入力すると、複数の手法で理論株価の目安を計算します。あくまで目安であり、投資判断は総合的に行ってください。</p>
      <form id="valuationForm">
        <div class="form-grid">
          <div class="form-field"><label>EPS（1株当たり利益）</label><input type="number" step="0.01" name="eps" value="${escapeHtml(v.eps || "")}"></div>
          <div class="form-field"><label>想定PER（倍）</label><input type="number" step="0.1" name="assumedPer" value="${escapeHtml(v.assumedPer || "")}"></div>
          <div class="form-field"><label>BPS（1株当たり純資産）</label><input type="number" step="0.01" name="bps" value="${escapeHtml(v.bps || "")}"></div>
          <div class="form-field"><label>想定PBR（倍）</label><input type="number" step="0.1" name="assumedPbr" value="${escapeHtml(v.assumedPbr || "")}"></div>
          <div class="form-field"><label>予想1株配当</label><input type="number" step="0.01" name="dividendPerShare" value="${escapeHtml(v.dividendPerShare || "")}"></div>
          <div class="form-field"><label>期待配当成長率（%）</label><input type="number" step="0.1" name="growthRate" value="${escapeHtml(v.growthRate || "")}"></div>
          <div class="form-field"><label>要求利回り（%）</label><input type="number" step="0.1" name="requiredReturn" value="${escapeHtml(v.requiredReturn || "")}"></div>
        </div>
        <button type="submit" class="btn">計算して保存</button>
      </form>
      <div id="valuationResult" class="summary-row" style="margin-top:16px;"></div>
    </div>
    ` : ""}
  `;

  if (currentTicker) {
    loadStockChart(currentTicker);
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
      const existing = d.stockNotes[currentTicker] || {};
      d.stockNotes[currentTicker] = {
        ...existing,
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

    panel.querySelector("#fetchFundamentalsBtn").addEventListener("click", async () => {
      const status = panel.querySelector("#fetchFundamentalsStatus");
      status.textContent = "取得中...";
      try {
        const res = await fetchStockApi("stock-fundamentals", currentTicker);
        form.querySelector("[name='per']").value = res.per ?? "";
        form.querySelector("[name='pbr']").value = res.pbr ?? "";
        form.querySelector("[name='roe']").value = res.roe ?? "";
        status.textContent = "取得しました（保存するには「メモを保存」を押してください）";
      } catch (err) {
        status.textContent = err.message;
      }
    });

    panel.querySelector("#fetchMarginBtn").addEventListener("click", async () => {
      const status = panel.querySelector("#fetchMarginStatus");
      status.textContent = "取得中...";
      try {
        const res = await fetchStockApi("stock-margin", currentTicker);
        form.querySelector("[name='marginRatio']").value = res.marginRatio ?? "";
        status.textContent = "取得しました";
      } catch (err) {
        status.textContent = err.message;
      }
    });

    panel.querySelector("#fetchShortRatioBtn").addEventListener("click", async () => {
      const status = panel.querySelector("#fetchShortRatioStatus");
      status.textContent = "取得中...";
      try {
        const res = await fetchStockApi("stock-shortratio", currentTicker);
        form.querySelector("[name='shortRatio']").value = res.shortRatio ?? "";
        status.textContent = "取得しました";
      } catch (err) {
        status.textContent = err.message;
      }
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

  const valuationForm = panel.querySelector("#valuationForm");
  if (valuationForm) {
    const resultEl = panel.querySelector("#valuationResult");
    const updateResult = () => {
      const fd = new FormData(valuationForm);
      renderValuationResult(resultEl, computeValuation({
        eps: parseFloat(fd.get("eps")),
        assumedPer: parseFloat(fd.get("assumedPer")),
        bps: parseFloat(fd.get("bps")),
        assumedPbr: parseFloat(fd.get("assumedPbr")),
        dividendPerShare: parseFloat(fd.get("dividendPerShare")),
        growthRate: parseFloat(fd.get("growthRate")),
        requiredReturn: parseFloat(fd.get("requiredReturn"))
      }));
    };
    valuationForm.addEventListener("input", updateResult);
    valuationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(valuationForm);
      const d = loadData();
      const existing = d.stockNotes[currentTicker] || {};
      d.stockNotes[currentTicker] = {
        ...existing,
        valuation: {
          eps: fd.get("eps"),
          assumedPer: fd.get("assumedPer"),
          bps: fd.get("bps"),
          assumedPbr: fd.get("assumedPbr"),
          dividendPerShare: fd.get("dividendPerShare"),
          growthRate: fd.get("growthRate"),
          requiredReturn: fd.get("requiredReturn")
        },
        updatedAt: new Date().toISOString()
      };
      saveData(d);
      renderStockAnalysis();
    });
    updateResult();
  }
}

function computeValuation({ eps, assumedPer, bps, assumedPbr, dividendPerShare, growthRate, requiredReturn }) {
  const perBased = Number.isFinite(eps) && Number.isFinite(assumedPer) ? eps * assumedPer : null;
  const pbrBased = Number.isFinite(bps) && Number.isFinite(assumedPbr) ? bps * assumedPbr : null;
  let ddm = null;
  if (Number.isFinite(dividendPerShare) && Number.isFinite(growthRate) && Number.isFinite(requiredReturn)) {
    const g = growthRate / 100;
    const r = requiredReturn / 100;
    if (r > g) {
      ddm = (dividendPerShare * (1 + g)) / (r - g);
    }
  }
  const values = [perBased, pbrBased, ddm].filter((v) => v !== null && Number.isFinite(v));
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  return { perBased, pbrBased, ddm, average };
}

function renderValuationResult(container, { perBased, pbrBased, ddm, average }) {
  const fmt = (v) => (v === null ? "算出不可" : `${Math.round(v * 10) / 10}円`);
  container.innerHTML = `
    <div class="summary-stat"><div class="label">PER基準</div><div class="value">${fmt(perBased)}</div></div>
    <div class="summary-stat"><div class="label">PBR基準</div><div class="value">${fmt(pbrBased)}</div></div>
    <div class="summary-stat"><div class="label">配当割引モデル</div><div class="value">${fmt(ddm)}</div></div>
    <div class="summary-stat"><div class="label">平均</div><div class="value">${fmt(average)}</div></div>
  `;
}

async function fetchStockApi(endpoint, symbol) {
  const code = symbol.startsWith("TSE:") ? symbol.slice(4) : symbol;
  let res;
  try {
    res = await fetch(`/api/${endpoint}?code=${encodeURIComponent(code)}`);
  } catch (err) {
    throw new Error("バックエンドに接続できません（Vercelへのデプロイ・APIキー設定が必要です）");
  }
  if (res.status === 403) {
    throw new Error("この項目はJ-Quants Standardプラン以上が必要です（¥3,300/月〜）");
  }
  if (!res.ok) {
    throw new Error(`取得に失敗しました（${res.status}）`);
  }
  return res.json();
}

let jpChartInstance = null;

function loadStockChart(symbol) {
  const jpWrap = document.getElementById("jp-chart-wrap");
  const jpStatus = document.getElementById("jp-chart-status");

  if (symbol.startsWith("TSE:")) {
    jpWrap.style.display = "block";
    loadJapaneseChart(symbol.slice(4), jpStatus);
  } else {
    jpWrap.style.display = "none";
    jpStatus.textContent = "この銘柄のチャートは埋め込み表示に対応していません。上のリンクから確認してください。";
  }
}

async function loadJapaneseChart(code, statusEl) {
  statusEl.textContent = "チャートを取得中...";
  if (jpChartInstance) {
    jpChartInstance.destroy();
    jpChartInstance = null;
  }
  let bars;
  try {
    bars = await fetchStockApi("stock-quotes", code);
  } catch (err) {
    statusEl.textContent = `${err.message}（上のリンクから実チャートを開いてください）`;
    return;
  }
  if (!Array.isArray(bars) || !bars.length) {
    statusEl.textContent = "株価データが見つかりませんでした（上のリンクから実チャートを開いてください）";
    return;
  }
  statusEl.textContent = "";
  const ctx = document.getElementById("jp-chart-container");
  jpChartInstance = new Chart(ctx, {
    type: "candlestick",
    data: {
      datasets: [{
        label: code,
        data: bars.map((b) => ({ x: new Date(b.date).getTime(), o: b.open, h: b.high, l: b.low, c: b.close }))
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { type: "time", time: { unit: "day" } } }
    }
  });
}

