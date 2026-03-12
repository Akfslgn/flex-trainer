let history = JSON.parse(localStorage.getItem("reflexHistory")) || [];
const mBtn = document.getElementById("main-action");
const cBtn = document.getElementById("confirm-action");
const dBtn = document.getElementById("decline-action");
const card = document.getElementById("target-card");
const detailPage = document.getElementById("detail-page"); // Detay sayfası eklendi
const feedback = document.getElementById("coach-feedback");
const statusText = document.getElementById("status-msg");

let tScan,
  tReact,
  tAction,
  isReady = false;

function toggleAnalytics() {
  const page = document.getElementById("analytics-page");
  if (page.style.display === "flex") {
    page.style.display = "none";
  } else {
    updateAnalyticsUI();
    page.style.display = "flex";
  }
}

function updateAnalyticsUI() {
  const pb = history.length
    ? Math.min(
        ...history.filter((h) => h.status === "success").map((h) => h.react),
      )
    : 0;
  const successCount = history.filter((h) => h.status === "success").length;
  const rate = history.length
    ? Math.round((successCount / history.length) * 100)
    : 0;

  document.getElementById("pb-val").innerText =
    (pb === Infinity ? 0 : pb) + " ms";
  document.getElementById("success-rate").innerText = rate + "%";

  const graph = document.getElementById("graph");
  graph.innerHTML = "";
  history.slice(-10).forEach((h) => {
    const bar = document.createElement("div");
    bar.className = "graph-bar";
    let heightVal = Math.max(5, 100 - h.react / 5);
    bar.style.height = heightVal + "%";
    if (h.status !== "success") bar.style.background = "var(--error)";
    graph.appendChild(bar);
  });
}

function saveAttempt(react, status) {
  history.push({ react, status, time: Date.now() });
  if (history.length > 50) history.shift();
  localStorage.setItem("reflexHistory", JSON.stringify(history));
}

function clearStats() {
  if (confirm("Delete all data?")) {
    history = [];
    localStorage.clear();
    updateAnalyticsUI();
  }
}

// 1. Tarama (Refresh)
mBtn.addEventListener("touchstart", (e) => {
  if (mBtn.disabled) return;
  feedback.style.display = "none";
  card.style.display = "none"; // Önceki kartı gizle
  mBtn.disabled = true;
  mBtn.innerText = "SCANNING...";
  tScan = performance.now();
  const delay = Math.floor(Math.random() * 500) + 700;

  setTimeout(() => {
    document.getElementById("s-ms").innerText = Math.round(
      performance.now() - tScan,
    );
    if (isReady) {
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      statusText.style.display = "none";
      card.style.display = "flex"; // Compact kartı göster
      tReact = performance.now();
    }
    mBtn.disabled = false;
    mBtn.innerText = "REFRESH SCAN";
  }, delay);
});

// 2. Pakete Tıkla (Compact Karta Dokunma)
card.addEventListener("touchstart", () => {
  const reactTime = Math.round(performance.now() - tReact);
  document.getElementById("r-ms").innerText = reactTime;

  card.style.display = "none"; // Karta gizle
  detailPage.style.display = "flex"; // Detay sayfasını aç

  mBtn.style.display = "none";
  dBtn.style.display = "block";
  cBtn.style.display = "block"; // Schedule butonu (cBtn) detay sayfasının altında belirir
  tAction = performance.now();
});

// 3. Onayla (Details Sayfasında Schedule Butonuna Dokunma)
cBtn.addEventListener("touchstart", () => {
  const rMs = parseInt(document.getElementById("r-ms").innerText);
  const aMs = Math.round(performance.now() - tAction);
  document.getElementById("a-ms").innerText = aMs;

  let status = "fail";
  if (rMs < 120 || aMs < 120) {
    showFeedback("⚠️ BOT WARNING", "orange");
  } else if (rMs > 280 || aMs > 280) {
    showFeedback("❌ MISSED", "var(--error)");
  } else {
    showFeedback("✅ SECURED", "var(--success)");
    status = "success";
  }

  saveAttempt(rMs, status);
  detailPage.style.display = "none"; // Detayı kapat
  resetApp();
});

function showFeedback(text, color) {
  feedback.innerText = text;
  feedback.style.color = color;
  feedback.style.display = "block";
}

function resetApp() {
  cBtn.style.display = "none";
  dBtn.style.display = "none";
  mBtn.style.display = "block";
  statusText.style.display = "block";
  isReady = false;
  setTimeout(
    () => {
      isReady = true;
    },
    Math.random() * 3000 + 2000,
  );
}

dBtn.addEventListener("touchstart", () => {
  detailPage.style.display = "none";
  resetApp();
});

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false },
);
window.onload = () => {
  isReady = false;
  setTimeout(() => {
    isReady = true;
  }, 2000);
};
