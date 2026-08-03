const APP_SECRET_KEY = "toushibunseki-app-secret";

function getAppSecret() {
  return localStorage.getItem(APP_SECRET_KEY) || "";
}

function setAppSecret(value) {
  localStorage.setItem(APP_SECRET_KEY, value);
}

function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), "x-app-secret": getAppSecret() };
  return fetch(url, { ...options, headers });
}

function ensureAuthGate(onReady) {
  const gate = document.getElementById("authGate");
  const app = document.getElementById("appRoot");

  const proceed = () => {
    gate.style.display = "none";
    app.style.display = "";
    onReady();
  };

  if (getAppSecret()) {
    proceed();
    return;
  }

  gate.style.display = "flex";
  app.style.display = "none";
  gate.querySelector("#authGateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const value = gate.querySelector("#authGateInput").value.trim();
    if (!value) return;
    setAppSecret(value);
    proceed();
  });
}
