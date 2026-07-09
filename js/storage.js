const STORAGE_KEY = "toushibunseki-app-data";

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      routineChecklist: {},
      trades: [],
      stockNotes: {},
      macroScenarios: []
    };
  }
  const parsed = JSON.parse(raw);
  return {
    routineChecklist: parsed.routineChecklist || {},
    trades: parsed.trades || [],
    stockNotes: parsed.stockNotes || {},
    macroScenarios: parsed.macroScenarios || []
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
