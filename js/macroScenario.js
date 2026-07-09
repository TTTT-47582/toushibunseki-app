function renderMacroScenario() {
  const panel = document.getElementById("panel-macroScenario");
  const data = loadData();
  const scenarios = [...data.macroScenarios].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  panel.innerHTML = `
    <div class="card">
      <h2>マクロ・シナリオを記録する</h2>
      <p class="empty-state" style="padding-top:0;">例：「ホルムズ海峡封鎖リスク」→ 原油高・輸送コスト増 → いすゞ・信越化学など個別銘柄への影響を仮説立てする</p>
      <form id="macroForm">
        <div class="form-grid">
          <div class="form-field full-width">
            <label>シナリオタイトル</label>
            <input type="text" name="title" required placeholder="例: ホルムズ海峡リスク">
          </div>
          <div class="form-field full-width">
            <label>マクロ要因（金利・為替・地政学リスクなど）</label>
            <textarea name="factors" placeholder="何が起きているか、何が起きうるか"></textarea>
          </div>
          <div class="form-field full-width">
            <label>影響を受ける業種・銘柄（カンマ区切り）</label>
            <input type="text" name="affectedTickers" placeholder="例: 7202, 4063, 海運, 化学">
          </div>
          <div class="form-field full-width">
            <label>仮説とその根拠（受注動向・在庫・代替供給網などのデータ）</label>
            <textarea name="hypothesis"></textarea>
          </div>
          <div class="form-field full-width">
            <label>検証結果・振り返り（後で追記）</label>
            <textarea name="verification"></textarea>
          </div>
        </div>
        <button type="submit" class="btn">記録する</button>
      </form>
    </div>

    <div class="card">
      <h2>シナリオ一覧</h2>
      <div id="scenarioList">
        ${scenarios.length ? scenarios.map((s) => `
          <div class="card" style="margin-bottom:12px;">
            <h3 style="margin-top:0;">${escapeHtml(s.title)}</h3>
            <div>
              ${(s.affectedTickers || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
            </div>
            <p><strong>マクロ要因：</strong>${escapeHtml(s.factors || "").replace(/\n/g, "<br>")}</p>
            <p><strong>仮説：</strong>${escapeHtml(s.hypothesis || "").replace(/\n/g, "<br>")}</p>
            <p><strong>検証結果：</strong>${escapeHtml(s.verification || "").replace(/\n/g, "<br>")}</p>
            <button class="btn btn-danger btn-delete-scenario" data-id="${s.id}">削除</button>
          </div>
        `).join("") : `<div class="empty-state">まだシナリオが記録されていません。</div>`}
      </div>
    </div>
  `;

  panel.querySelector("#macroForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const d = loadData();
    d.macroScenarios.push({
      id: generateId(),
      title: fd.get("title").trim(),
      factors: fd.get("factors").trim(),
      affectedTickers: fd.get("affectedTickers").split(",").map((s) => s.trim()).filter(Boolean),
      hypothesis: fd.get("hypothesis").trim(),
      verification: fd.get("verification").trim(),
      createdAt: new Date().toISOString()
    });
    saveData(d);
    renderMacroScenario();
  });

  panel.querySelector("#scenarioList").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete-scenario");
    if (!btn) return;
    if (!confirm("このシナリオを削除しますか？")) return;
    const d = loadData();
    d.macroScenarios = d.macroScenarios.filter((s) => s.id !== btn.dataset.id);
    saveData(d);
    renderMacroScenario();
  });
}
