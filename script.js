let time = 1500;
let timer = null;

const timeDisplay = document.getElementById("time");
const status = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

function updateDisplay() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  timeDisplay.textContent =
    `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function startTimer() {
  if (timer) {
    status.textContent = "Timer already running...";
    return;
  }

  status.textContent = "Focus session started 🔥";

  timer = setInterval(() => {
    if (time > 0) {
      time--;
      updateDisplay();
    } else {
      clearInterval(timer);
      timer = null;
      status.textContent = "Session complete 🎉";
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  time = 1500;
  updateDisplay();
  status.textContent = "Timer reset";
}

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
