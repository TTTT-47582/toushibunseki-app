function renderDashboard() {
  const panel = document.getElementById("panel-dashboard");
  const data = loadData();
  const key = todayKey();
  const today = data.routineChecklist[key] || {
    morningUS: false,
    fx: false,
    futures: false,
    closeReview: ""
  };

  const recentTrades = [...data.trades]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  panel.innerHTML = `
    <div class="card">
      <h2>今日のルーティン（${key}）</h2>
      <h3>朝：寄り付き前チェック</h3>
      <div class="checklist-item">
        <input type="checkbox" id="chk-morningUS" ${today.morningUS ? "checked" : ""}>
        <label for="chk-morningUS">前日の米国市場の動きを確認した</label>
      </div>
      <div class="checklist-item">
        <input type="checkbox" id="chk-fx" ${today.fx ? "checked" : ""}>
        <label for="chk-fx">為替（ドル円など）を確認した</label>
      </div>
      <div class="checklist-item">
        <input type="checkbox" id="chk-futures" ${today.futures ? "checked" : ""}>
        <label for="chk-futures">日経225先物を確認した</label>
      </div>
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
    d.routineChecklist[key] = {
      morningUS: panel.querySelector("#chk-morningUS").checked,
      fx: panel.querySelector("#chk-fx").checked,
      futures: panel.querySelector("#chk-futures").checked,
      closeReview: panel.querySelector("#closeReview").value.trim()
    };
    saveData(d);
    renderDashboard();
  });
}
