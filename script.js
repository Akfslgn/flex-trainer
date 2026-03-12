let history = JSON.parse(localStorage.getItem("reflexHistory")) || [];
const mBtn = document.getElementById("main-action");
const cBtn = document.getElementById("confirm-action");
const card = document.getElementById("target-card");
const feedback = document.getElementById("coach-feedback");
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
  const pb = history.length ? Math.min(...history.map((h) => h.react)) : 0;
  const successCount = history.filter((h) => h.status === "success").length;
  const rate = history.length
    ? Math.round((successCount / history.length) * 100)
    : 0;

  document.getElementById("pb-val").innerText = pb + " ms";
  document.getElementById("success-rate").innerText = rate + "%";

  const graph = document.getElementById("graph");
  graph.innerHTML = "";
  history.slice(-10).forEach((h) => {
    const bar = document.createElement("div");
    bar.className = "graph-bar";
    bar.style.height = Math.min(h.react / 5, 100) + "%";
    if (h.status !== "success") bar.style.background = "var(--error)";
    graph.appendChild(bar);
  });
}

function saveAttempt(react, status) {
  history.push({ react, status, time: Date.now() });
  if (history.length > 100) history.shift();
  localStorage.setItem("reflexHistory", JSON.stringify(history));
}

function clearStats() {
  if (confirm("Clear all data?")) {
    history = [];
    localStorage.clear();
    updateAnalyticsUI();
  }
}

mBtn.addEventListener("touchstart", (e) => {
  if (mBtn.disabled) return;
  feedback.style.display = "none";
  mBtn.disabled = true;
  tScan = performance.now();
  setTimeout(
    () => {
      document.getElementById("s-ms").innerText = Math.round(
        performance.now() - tScan,
      );
      if (isReady) {
        if (window.navigator.vibrate) window.navigator.vibrate(40);
        card.style.display = "block";
        tReact = performance.now();
      }
      mBtn.disabled = false;
    },
    Math.random() * 500 + 700,
  );
});

card.addEventListener("touchstart", () => {
  document.getElementById("r-ms").innerText = Math.round(
    performance.now() - tReact,
  );
  card.style.display = "none";
  mBtn.style.display = "none";
  cBtn.style.display = "block";
  tAction = performance.now();
});

cBtn.addEventListener("touchstart", () => {
  const rMs = parseInt(document.getElementById("r-ms").innerText);
  const aMs = Math.round(performance.now() - tAction);
  document.getElementById("a-ms").innerText = aMs;

  let status = "fail";
  if (rMs < 10) {
    showFeedback("⚠️ ROBOTIC!", "orange");
  } else if (rMs > 150 || aMs > 150) {
    showFeedback("❌ SLOW", "var(--error)");
  } else {
    showFeedback("✅ PERFECT", "var(--success)");
    status = "success";
  }

  saveAttempt(rMs, status);
  resetApp();
});

function showFeedback(text, color) {
  feedback.innerText = text;
  feedback.style.color = color;
  feedback.style.display = "block";
}

function resetApp() {
  cBtn.style.display = "none";
  mBtn.style.display = "block";
  isReady = false;
  setTimeout(
    () => {
      isReady = true;
    },
    Math.random() * 3000 + 2000,
  );
}

// Mobile Scroll Lock
document.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});
window.onload = () => {
  isReady = true;
};
