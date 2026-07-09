const TAB_RENDERERS = {
  dashboard: renderDashboard,
  tradeJournal: renderTradeJournal,
  stockAnalysis: renderStockAnalysis,
  macroScenario: renderMacroScenario,
  resources: renderResources
};

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `panel-${tabName}`);
  });
  const renderer = TAB_RENDERERS[tabName];
  if (renderer) renderer();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tabNav").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });

  switchTab("dashboard");
});
