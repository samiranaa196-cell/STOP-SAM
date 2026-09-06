/* =====================================================
   STOP SAM
   Main Application JavaScript
   ===================================================== */

const STORAGE_KEY = "STOP_SAM_DATA";


/* =====================================================
   DEFAULT DATA
   ===================================================== */

let data = {
  startTime: Date.now(),

  bestDays: 0,

  totalDays: 0,

  attempts: 0,

  habits: {
    water: false,
    exercise: false,
    reading: false,
    sleep: false
  },

  challenges: [
    {
      id: 1,
      name: "7 Day Strong Start",
      target: 7,
      progress: 0
    }
  ],

  history: []
};


/* =====================================================
   LOAD SAVED DATA
   ===================================================== */

function loadData() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {

      const parsed = JSON.parse(saved);

      data = {
        ...data,
        ...parsed,

        habits: {
          ...data.habits,
          ...(parsed.habits || {})
        },

        challenges:
          parsed.challenges || data.challenges,

        history:
          parsed.history || []
      };

    }

  } catch (error) {

    console.log("Could not load saved data.", error);

  }

}


/* =====================================================
   SAVE DATA
   ===================================================== */

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

  } catch (error) {

    console.log("Could not save data.", error);

  }

}


/* =====================================================
   CALCULATE DAYS
   ===================================================== */

function getCurrentDays() {

  const elapsed =
    Date.now() - Number(data.startTime);

  return Math.max(
    0,
    Math.floor(
      elapsed / (1000 * 60 * 60 * 24)
    )
  );

}


/* =====================================================
   TIMER
   ===================================================== */

function updateTimer() {

  const elapsed =
    Math.max(
      0,
      Date.now() - Number(data.startTime)
    );

  const totalSeconds =
    Math.floor(elapsed / 1000);

  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;


  const timerElement =
    document.getElementById("timer");

  const dayElement =
    document.getElementById("day");


  if (timerElement) {

    timerElement.textContent =
      `${String(hours).padStart(2, "0")} : ` +
      `${String(minutes).padStart(2, "0")} : ` +
      `${String(seconds).padStart(2, "0")}`;

  }


  if (dayElement) {

    dayElement.textContent =
      `Day ${days + 1}`;

  }


  if (days > data.bestDays) {

    data.bestDays = days;

  }


  data.totalDays = days;

  updateStats();

}


/* =====================================================
   STATISTICS
   ===================================================== */

function updateStats() {

  const best =
    document.getElementById("best");

  const total =
    document.getElementById("total");

  const attempts =
    document.getElementById("attempts");


  if (best) {

    best.textContent =
      Math.max(
        data.bestDays || 0,
        getCurrentDays()
      );

  }


  if (total) {

    total.textContent =
      getCurrentDays();

  }


  if (attempts) {

    attempts.textContent =
      data.attempts || 0;

  }

}


/* =====================================================
   RELAPSE / RESET
   ===================================================== */

function relapse() {

  const currentDays =
    getCurrentDays();


  const confirmed =
    confirm(
      "Reset your current streak?\n\n" +
      "Your attempt will be saved in history."
    );


  if (!confirmed) {

    return;

  }


  data.history.unshift({

    date:
      new Date().toLocaleString(),

    days:
      currentDays

  });


  data.attempts =
    (data.attempts || 0) + 1;


  if (currentDays > data.bestDays) {

    data.bestDays =
      currentDays;

  }


  data.startTime =
    Date.now();


  data.habits = {

    water: false,

    exercise: false,

    reading: false,

    sleep: false

  };


  saveData();

  updateAll();

  showToast(
    "Streak reset. Start again 💪"
  );

}


/* =====================================================
   HABITS
   ===================================================== */

const habitNames = {

  water:
    "Drink enough water",

  exercise:
    "Move / Exercise",

  reading:
    "Read or learn something",

  sleep:
    "Get good sleep"

};


function openHabits() {

  let html = `

    <h2>Daily Habits</h2>

    <p>
      Small daily actions can help you
      build a better routine.
    </p>

  `;


  Object.keys(habitNames).forEach(key => {

    const done =
      data.habits[key];

    html += `

      <div class="habit-row">

        <span>
          ${habitNames[key]}
        </span>

        <button
          class="habit-btn ${done ? "done" : ""}"
          onclick="toggleHabit('${key}')">

          ${done ? "✓ Done" : "Mark"}

        </button>

      </div>

    `;

  });


  showModal(html);

}


function toggleHabit(key) {

  if (!(key in data.habits)) {

    return;

  }


  data.habits[key] =
    !data.habits[key];


  saveData();

  updateHabitStatus();

  openHabits();

  showToast(
    data.habits[key]
      ? "Habit completed ✓"
      : "Habit unchecked"
  );

}


function updateHabitStatus() {

  const completed =
    Object.values(data.habits)
      .filter(Boolean)
      .length;


  const element =
    document.getElementById(
      "habitStatus"
    );


  if (element) {

    element.textContent =
      `${completed}/4 Done`;

  }

}


/* =====================================================
   CHALLENGES
   ===================================================== */

function openChallenges() {

  let html = `

    <h2>My Challenges</h2>

    <p>
      Create small goals and track your progress.
    </p>

  `;


  if (!data.challenges.length) {

    html += `

      <p style="margin-top:20px;">
        No challenges yet.
      </p>

    `;

  }


  data.challenges.forEach(challenge => {

    const percent =
      Math.min(
        100,
        Math.round(
          (challenge.progress /
            challenge.target) * 100
        )
      );


    html += `

      <div class="challenge">

        <div class="challenge-title">
          ${escapeHTML(challenge.name)}
        </div>

        <div class="challenge-progress">

          ${challenge.progress}
          /
          ${challenge.target}

          &nbsp; • &nbsp;

          ${percent}%

        </div>

        <div class="progress-bar">

          <div
            class="progress-fill"
            style="width:${percent}%">
          </div>

        </div>

        <button
          class="action-btn"
          onclick="increaseChallenge(${challenge.id})">

          +1 Progress

        </button>

      </div>

    `;

  });


  html += `

    <h3>Add Challenge</h3>

    <input
      id="challengeName"
      type="text"
      maxlength="40"
      placeholder="Challenge name">

    <input
      id="challengeTarget"
      type="number"
      min="1"
      max="365"
      placeholder="Target days">

    <button
      class="action-btn"
      onclick="addChallenge()">

      Add Challenge

    </button>

  `;


  showModal(html);

}


function addChallenge() {

  const nameInput =
    document.getElementById(
      "challengeName"
    );

  const targetInput =
    document.getElementById(
      "challengeTarget"
    );


  const name =
    nameInput
      ? nameInput.value.trim()
      : "";


  const target =
    targetInput
      ? Number(targetInput.value)
      : 0;


  if (!name) {

    showToast(
      "Challenge name likho."
    );

    return;

  }


  if (
    !Number.isFinite(target) ||
    target < 1 ||
    target > 365
  ) {

    showToast(
      "Target 1 se 365 ke darmiyan rakho."
    );

    return;

  }


  data.challenges.push({

    id:
      Date.now(),

    name:
      name,

    target:
      target,

    progress:
      0

  });


  saveData();

  updateChallengeStatus();

  openChallenges();

  showToast(
    "Challenge added 🎯"
  );

}


function increaseChallenge(id) {

  const challenge =
    data.challenges.find(
      item => item.id === id
    );


  if (!challenge) {

    return;

  }


  if (
    challenge.progress >=
    challenge.target
  ) {

    showToast(
      "Challenge already complete 🎉"
    );

    return;

  }


  challenge.progress += 1;

  saveData();

  updateChallengeStatus();

  openChallenges();


  if (
    challenge.progress >=
    challenge.target
  ) {

    showToast(
      "Challenge completed 🎉"
    );

  } else {

    showToast(
      "Progress +1"
    );

  }

}


function updateChallengeStatus() {

  const element =
    document.getElementById(
      "challengeStatus"
    );


  if (!element) {

    return;

  }


  const active =
    data.challenges.filter(
      challenge =>
        challenge.progress <
        challenge.target
    ).length;


  element.textContent =
    `${active} Active`;

}


/* =====================================================
   ATTEMPTS HISTORY
   ===================================================== */

function openAttempts() {

  let html = `

    <h2>My Attempts</h2>

    <p>
      Your previous streak resets are saved here.
    </p>

  `;


  if (!data.history.length) {

    html += `

      <div class="attempt">

        <strong>No history yet</strong>

        <small>
          Your attempts will appear here.
        </small>

      </div>

    `;

  } else {

    data.history
      .slice(0, 30)
      .forEach((item, index) => {

        html += `

          <div class="attempt">

            <strong>
              Attempt ${index + 1}
            </strong>

            <small>
              Streak: ${item.days} day(s)
            </small>

            <br>

            <small>
              ${escapeHTML(item.date)}
            </small>

          </div>

        `;

      });

  }


  showModal(html);

}


/* =====================================================
   RECOVERY GUIDE
   ===================================================== */

function openGuide() {

  const html = `

    <h2>Recovery Guide</h2>

    <p>
      Progress is built one day at a time.
    </p>

    <h3>1. Keep a routine</h3>

    <p>
      Plan your day with useful activities,
      study, hobbies, movement and enough rest.
    </p>

    <h3>2. Change your environment</h3>

    <p>
      If something repeatedly distracts you,
      move away from it and choose another activity.
    </p>

    <h3>3. After a setback</h3>

    <p>
      Don't punish yourself. Notice what happened,
      learn from it and restart your routine.
    </p>

    <h3>4. Get support</h3>

    <p>
      If a habit is becoming difficult to manage,
      talking with a trusted adult, teacher or
      counselor can be helpful.
    </p>

    <h3>Remember</h3>

    <p>
      One difficult moment does not erase your progress.
    </p>

  `;


  showModal(html);

}


/* =====================================================
   ABOUT
   ===================================================== */

function openAbout() {

  const html = `

    <h2>STOP SAM</h2>

    <p>
      STOP SAM is a simple personal streak,
      habits and challenges tracker.
    </p>

    <h3>Features</h3>

    <ul class="modal-list">

      <li>⏱️ Streak Timer</li>

      <li>📊 Progress Statistics</li>

      <li>✓ Daily Habits</li>

      <li>🎯 Custom Challenges</li>

      <li>▣ Attempt History</li>

      <li>📖 Recovery Guide</li>

      <li>💾 Local Data Storage</li>

      <li>📱 Installable PWA</li>

      <li>🚫 No Advertisements</li>

    </ul>

  `;


  showModal(html);

}


/* =====================================================
   SETTINGS
   ===================================================== */

function openSettings() {

  const html = `

    <h2>Settings</h2>

    <div class="setting-item">

      <h3>💾 Backup Data</h3>

      <p>
        Save your STOP SAM data as a JSON file.
      </p>

      <button
        class="action-btn"
        onclick="exportData()">

        Export Data

      </button>

    </div>


    <div class="setting-item">

      <h3>🗑️ Clear Data</h3>

      <p>
        Delete all saved app data and start fresh.
      </p>

      <button
        class="action-btn"
        onclick="clearData()">

        Clear All Data

      </button>

    </div>


    <div class="setting-item">

      <h3>ℹ️ App Version</h3>

      <p>
        STOP SAM v1.0
      </p>

    </div>

  `;


  showModal(html);

}


/* =====================================================
   EXPORT DATA
   ===================================================== */

function exportData() {

  const json =
    JSON.stringify(
      data,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
      {
        type: "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href =
    url;

  link.download =
    "stop-sam-backup.json";


  document.body.appendChild(link);

  link.click();

  link.remove();


  URL.revokeObjectURL(url);

  showToast(
    "Backup created ✓"
  );

}


/* =====================================================
   CLEAR DATA
   ===================================================== */

function clearData() {

  const confirmed =
    confirm(
      "Are you sure?\n\n" +
      "All STOP SAM data will be deleted."
    );


  if (!confirmed) {

    return;

  }


  localStorage.removeItem(
    STORAGE_KEY
  );


  location.reload();

}


/* =====================================================
   MODAL
   ===================================================== */

function showModal(content) {

  const modal =
    document.getElementById(
      "modal"
    );

  const modalContent =
    document.getElementById(
      "modalContent"
    );


  if (!modal || !modalContent) {

    return;

  }


  modalContent.innerHTML =
    content;


  modal.classList.add(
    "show"
  );

}


function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* =====================================================
   TOAST MESSAGE
   ===================================================== */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2200);

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* =====================================================
   UPDATE EVERYTHING
   ===================================================== */

function updateAll() {

  updateTimer();

  updateStats();

  updateHabitStatus();

  updateChallengeStatus();

}


/* =====================================================
   MODAL BACKDROP
   ===================================================== */

document.addEventListener(
  "click",
  function(event) {

    const modal =
      document.getElementById(
        "modal"
      );


    if (
      event.target === modal
    ) {

      closeModal();

    }

  }
);


/* =====================================================
   START APP
   ===================================================== */

loadData();

updateAll();


setInterval(
  function() {

    updateTimer();

  },
  1000
);


/* Save periodically */

setInterval(
  function() {

    saveData();

  },
  10000
);
