const MORNING_ROUTINE_ITEMS = [
  { key: "morningUS", label: "前日の米国市場の動きを確認した", placeholder: "例: NYダウ+0.5%、ハイテク株堅調" },
  { key: "fx", label: "為替（ドル円など）を確認した", placeholder: "例: ドル円148円台、前日比+0.3円" },
  { key: "futures", label: "日経225先物を確認した", placeholder: "例: 大阪夜間先物は日中比+80円" }
];

function renderRoutineItem(item, today) {
  const checked = today[item.key] ? "checked" : "";
  const note = escapeHtml(today[`${item.key}Note`] || "");
  return `
    <div class="checklist-item-block">
      <div class="checklist-item">
        <input type="checkbox" id="chk-${item.key}" ${checked}>
        <label for="chk-${item.key}">${item.label}</label>
      </div>
      <textarea id="note-${item.key}" placeholder="${item.placeholder}">${note}</textarea>
    </div>
  `;
}

function renderDashboard() {
  const panel = document.getElementById("panel-dashboard");
  const data = loadData();
  const key = todayKey();
  const today = data.routineChecklist[key] || {
    morningUS: false,
    morningUSNote: "",
    fx: false,
    fxNote: "",
    futures: false,
    futuresNote: "",
    closeReview: ""
  };

  const recentTrades = [...data.trades]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  panel.innerHTML = `
    <div class="card">
      <h2>今日のルーティン（${key}）</h2>
      <h3>朝：寄り付き前チェック</h3>
      ${MORNING_ROUTINE_ITEMS.map((item) => renderRoutineItem(item, today)).join("")}
      <h3>引け後：振り返り</h3>
      <div class="form-field full-width">
        <label>今日の値動きの「理由」を言語化する（なぜ上がった/下がったか）</label>
        <textarea id="closeReview">${escapeHtml(today.closeReview || "")}</textarea>
      </div>
      <button class="btn" id="saveRoutine">保存</button>
    </div>

    <div class="card">
      <h2>直近のトレード日誌</h2>
      ${recentTrades.length ? `
        <table>
          <thead><tr><th>日付</th><th>銘柄</th><th>区分</th><th>根拠</th></tr></thead>
          <tbody>
            ${recentTrades.map((t) => `
              <tr>
                <td>${t.date}</td>
                <td>${escapeHtml(t.ticker)}</td>
                <td>${t.side === "buy" ? "買い" : "売り"}</td>
                <td>${escapeHtml((t.rationale || "").slice(0, 40))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : `<div class="empty-state">まだトレード記録がありません。「トレード日誌」タブから記録を始めましょう。</div>`}
    </div>
  `;

  panel.querySelector("#saveRoutine").addEventListener("click", () => {
    const d = loadData();
    const entry = { closeReview: panel.querySelector("#closeReview").value.trim() };
    MORNING_ROUTINE_ITEMS.forEach((item) => {
      entry[item.key] = panel.querySelector(`#chk-${item.key}`).checked;
      entry[`${item.key}Note`] = panel.querySelector(`#note-${item.key}`).value.trim();
    });
    d.routineChecklist[key] = entry;
    saveData(d);
    renderDashboard();
  });
}
