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
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") return;

  const li = document.createElement("li");
  li.textContent = taskText;

  // Toggle complete
  li.addEventListener("click", () => {
    li.classList.toggle("completed");
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    li.remove();
  };

  li.appendChild(deleteBtn);
  taskList.appendChild(li);

  taskInput.value = "";
}

addTaskBtn.addEventListener("click", addTask);
// Enter key for tasks
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// Replace startTimer with start/pause toggle
function toggleTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    startBtn.textContent = "Resume";
    status.textContent = "Paused ⏸";
  } else {
    startBtn.textContent = "Pause";
    status.textContent = "Focus session started 🔥";
    timer = setInterval(() => {
      if (time > 0) {
        time--;
        updateDisplay();
      } else {
        clearInterval(timer);
        timer = null;
        startBtn.textContent = "Start";
        status.textContent = "Session complete 🎉";
      }
    }, 1000);
  }
}

// Update the event listener too:
startBtn.addEventListener("click", toggleTimer);
