// ============================================
// THEME TOGGLE
// ============================================
const themeBtn = document.getElementById('themeToggle');
const html = document.documentElement;

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeBtn(savedTheme);
}

function updateThemeBtn(theme) {
  themeBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
}

themeBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeBtn(newTheme);
});

// ============================================
// MUSIC PLAYER
// ============================================
const musicToggle = document.getElementById('musicToggle');
const musicPlayer = document.getElementById('musicPlayer');
const musicOptions = document.querySelectorAll('.music-option');
const volumeControl = document.getElementById('volumeControl');
const musicStatus = document.getElementById('musicStatus');

let audioContext = null;
let audioElement = null;
let currentMusic = null;
let isPlaying = false;
let currentOscillator = null;
let currentGainNode = null;

// Music URLs (using free ambient music sources)
const musicLibrary = {
  lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  coffee: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
};

// Fallback: Use Web Audio API to generate ambient sounds
function generateAmbientSound(type) {
  try {
    // Stop any previously playing sound
    if (currentOscillator) {
      currentOscillator.stop();
      currentOscillator.disconnect();
    }

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create different ambient tones based on type
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const lowPassFilter = audioContext.createBiquadFilter();

    oscillator.connect(lowPassFilter);
    lowPassFilter.connect(gain);
    gain.connect(audioContext.destination);

    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 1000;

    switch(type) {
      case 'lofi':
        oscillator.frequency.value = 220; // A3 note
        oscillator.type = 'sine';
        break;
      case 'rain':
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 2);
        oscillator.type = 'sawtooth';
        break;
      case 'forest':
        oscillator.frequency.value = 200;
        oscillator.type = 'triangle';
        break;
      case 'coffee':
        oscillator.frequency.value = 240;
        oscillator.type = 'sine';
        break;
    }

    // Apply volume from slider (default 50)
    const volumeValue = volumeControl.value / 100;
    gain.gain.setValueAtTime(0.15 * volumeValue, audioContext.currentTime);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3600); // 1 hour
    
    // Store references for volume control and stopping
    currentOscillator = oscillator;
    currentGainNode = gain;
    
  } catch (e) {
    console.log('Web Audio API not fully supported');
  }
}

musicToggle.addEventListener('click', () => {
  musicPlayer.classList.toggle('active');
  musicToggle.classList.toggle('active');
});

musicOptions.forEach(option => {
  option.addEventListener('click', () => {
    const musicType = option.getAttribute('data-music');
    
    musicOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    
    currentMusic = musicType;
    isPlaying = true;
    
    // Start playing ambient sound
    generateAmbientSound(musicType);
    musicStatus.textContent = `🎵 Playing ${option.textContent}...`;
  });
});

volumeControl.addEventListener('input', (e) => {
  if (currentGainNode) {
    const volume = e.target.value / 100;
    // Apply volume change to the currently playing sound
    currentGainNode.gain.setValueAtTime(0.15 * volume, audioContext.currentTime);
  }
});

// ============================================
// TIMER FUNCTIONALITY
// ============================================
let time = 1500; // 25 minutes
let timerInterval = null;
let isRunning = false;
let currentMode = 'work'; // 'work' or 'break'
let focusTimeToday = 0; // in seconds
let sessionsCompleted = 0;

const timeDisplay = document.getElementById('time');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const workBtn = document.getElementById('workBtn');
const breakBtn = document.getElementById('breakBtn');
const sessionsCountDisplay = document.getElementById('sessionsCount');
const focusTimeDisplay = document.getElementById('focusTime');

function updateDisplay() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function switchMode(mode) {
  currentMode = mode;
  isRunning = false;
  clearInterval(timerInterval);
  
  if (mode === 'work') {
    time = 1500; // 25 minutes
    workBtn.classList.add('active');
    breakBtn.classList.remove('active');
    workBtn.setAttribute('aria-pressed', 'true');
    breakBtn.setAttribute('aria-pressed', 'false');
  } else {
    time = 300; // 5 minutes
    breakBtn.classList.add('active');
    workBtn.classList.remove('active');
    breakBtn.setAttribute('aria-pressed', 'true');
    workBtn.setAttribute('aria-pressed', 'false');
  }
  
  startBtn.textContent = 'Start';
  status.textContent = '';
  updateDisplay();
}

function toggleTimer() {
  if (isRunning) {
    // Pause
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Resume';
    status.textContent = 'Paused ⏸';
  } else {
    // Start
    isRunning = true;
    startBtn.textContent = 'Pause';
    status.textContent = currentMode === 'work' ? 'Focus session started 🔥' : 'Break time! 🌴';
    
    timerInterval = setInterval(() => {
      if (time > 0) {
        time--;
        updateDisplay();
        if (currentMode === 'work') {
          focusTimeToday++; // Track focus time in seconds
          updateStats();
        }
      } else {
        // Timer completed
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.textContent = 'Start';
        
        if (currentMode === 'work') {
          sessionsCompleted++;
          status.textContent = 'Session complete! 🎉 Take a break!';
          updateStats();
          playNotification();
        } else {
          status.textContent = 'Break complete! 💪 Ready for another session?';
          playNotification();
        }
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  if (currentMode === 'work') {
    time = 1500;
  } else {
    time = 300;
  }
  startBtn.textContent = 'Start';
  status.textContent = 'Timer reset';
  updateDisplay();
}

function playNotification() {
  // Soft, gentle notification sound
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    
    oscillator.frequency.value = 528; // Solfeggio frequency (healing tone)
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.log('Audio notification not supported');
  }
}

workBtn.addEventListener('click', () => switchMode('work'));
breakBtn.addEventListener('click', () => switchMode('break'));
startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

// ============================================
// TASK MANAGEMENT
// ============================================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const tasksCompletedDisplay = document.getElementById('tasksCompleted');

let tasks = [];
let currentFilter = 'all'; // all, active, completed

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadStats() {
  const savedStats = localStorage.getItem('stats');
  if (savedStats) {
    const stats = JSON.parse(savedStats);
    sessionsCompleted = stats.sessions || 0;
    focusTimeToday = stats.focusTime || 0;
    updateStats();
  }
}

function saveStats() {
  localStorage.setItem('stats', JSON.stringify({
    sessions: sessionsCompleted,
    focusTime: focusTimeToday
  }));
}

function updateStats() {
  sessionsCountDisplay.textContent = sessionsCompleted;
  const minutes = Math.floor(focusTimeToday / 60);
  focusTimeDisplay.textContent = `${minutes}m`;
  
  const completedCount = tasks.filter(t => t.completed).length;
  tasksCompletedDisplay.textContent = completedCount;
  
  saveStats();
}

function addTask() {
  const taskText = taskInput.value.trim();
  
  if (taskText === '') {
    status.textContent = '⚠️ Please enter a task!';
    setTimeout(() => { status.textContent = ''; }, 2000);
    return;
  }
  
  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false
  };
  
  tasks.push(newTask);
  saveTasks();
  taskInput.value = '';
  renderTasks();
  updateStats();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
}

function toggleTaskCompletion(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
  }
}

function renderTasks() {
  taskList.innerHTML = '';
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    const taskSpan = document.createElement('span');
    const deleteBtn = document.createElement('button');
    
    taskSpan.textContent = task.text;
    taskSpan.style.flex = '1';
    taskSpan.style.cursor = 'pointer';
    
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'deleteBtn';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    };
    
    if (task.completed) {
      li.classList.add('completed');
    }
    
    // Determine if task should be shown based on filter
    if (currentFilter === 'active' && task.completed) {
      li.classList.add('hidden');
    } else if (currentFilter === 'completed' && !task.completed) {
      li.classList.add('hidden');
    }
    
    li.addEventListener('click', () => toggleTaskCompletion(task.id));
    
    li.appendChild(taskSpan);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  updateStats();
}

function setFilter(filter) {
  currentFilter = filter;
  
  // Update filter button states
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  
  if (filter === 'all') {
    document.getElementById('filterAll').classList.add('active');
    document.getElementById('filterAll').setAttribute('aria-pressed', 'true');
  } else if (filter === 'active') {
    document.getElementById('filterActive').classList.add('active');
    document.getElementById('filterActive').setAttribute('aria-pressed', 'true');
  } else if (filter === 'completed') {
    document.getElementById('filterCompleted').classList.add('active');
    document.getElementById('filterCompleted').setAttribute('aria-pressed', 'true');
  }
  
  renderTasks();
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const filterId = e.target.id;
    if (filterId === 'filterAll') setFilter('all');
    else if (filterId === 'filterActive') setFilter('active');
    else if (filterId === 'filterCompleted') setFilter('completed');
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// ============================================
// INITIALIZATION
// ============================================
initTheme();
loadTasks();
loadStats();
updateDisplay();
