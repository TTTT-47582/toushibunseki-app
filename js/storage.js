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
  pushCloudData(data);
}

function pushCloudData(data) {
  authFetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => {
    // オフライン等でクラウド保存に失敗してもローカルには保存済みなので握りつぶす
  });
}

async function pullCloudData() {
  try {
    const res = await authFetch("/api/data");
    if (!res.ok) return;
    const cloud = await res.json();
    if (cloud) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud));
    }
  } catch (err) {
    // オフライン等でクラウド取得に失敗した場合はローカルのデータをそのまま使う
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
