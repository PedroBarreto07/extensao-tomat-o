const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let interval = null;
let running = false;
let remaining = 25 * 60 * 1000;

function format(ms) {
  const s = Math.ceil(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function updateDisplay() {
  timerEl.textContent = format(remaining);
}

startBtn.addEventListener("click", () => {
  if (running) return;
  running = true;

  const end = Date.now() + remaining;

  interval = setInterval(() => {
    remaining = end - Date.now();

    if (remaining <= 0) {
      remaining = 0;
      clearInterval(interval);
      running = false;

      try {
        document.getElementById("alarm-sound")?.play();
      } catch {}

      navigator.vibrate?.(200);
    }

    updateDisplay();
  }, 1000);
});

pauseBtn.addEventListener("click", () => {
  if (!running) return;
  running = false;
  clearInterval(interval);
});

resetBtn.addEventListener("click", () => {
  running = false;
  clearInterval(interval);
  remaining = 25 * 60 * 1000;
  updateDisplay();
});

updateDisplay();
