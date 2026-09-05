const STORAGE_KEY = "STOP_SAM_DATA";

let data = {
  startTime: Date.now(),
  bestDays: 0,
  attempts: 0,
  totalDays: 0,

  habits: {
    water: false,
    exercise: false,
    reading: false,
    sleep: false
  },

  challenges: [
    {
      id: 1,
      name: "7 Day Challenge",
      target: 7,
      progress: 0,
      active: true
    }
  ],

  history: []
};


// ==============================
// LOAD DATA
// ==============================

function loadData() {

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {

    try {
      data = JSON.parse(saved);
    }

    catch (error) {
      console.log("Data error");
    }

  }

}


// ==============================
// SAVE DATA
// ==============================

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


// ==============================
// TIMER
// ==============================

function updateTimer() {

  const now = Date.now();

  let difference =
    now - data.startTime;

  if (difference < 0) {
    difference = 0;
  }


  const totalSeconds =
    Math.floor(difference / 1000);


  const seconds =
    totalSeconds % 60;


  const totalMinutes =
    Math.floor(totalSeconds / 60);


  const minutes =
    totalMinutes % 60;


  const totalHours =
    Math.floor(totalMinutes / 60);


  const hours =
    totalHours % 24;


  const days =
    Math.floor(totalHours / 24);


  document.getElementById("day")
    .textContent =
    "Day " + (days + 1);


  document.getElementById("timer")
    .textContent =
    String(hours).padStart(2, "0")
    + " : "
    + String(minutes).padStart(2, "0")
    + " : "
    + String(seconds).padStart(2, "0");


  data.totalDays =
    Math.max(data.totalDays, days + 1);


  data.bestDays =
    Math.max(data.bestDays, days + 1);


  document.getElementById("best")
    .textContent =
    data.bestDays;


  document.getElementById("total")
    .textContent =
    data.totalDays;


  document.getElementById("attempts")
    .textContent =
    data.attempts;


  saveData();

}


// ==============================
// RELAPSE / RESET
// ==============================

function relapse() {

  const current =
    Date.now() - data.startTime;


  const days =
    Math.floor(
      current / 86400000
    );


  const confirmed =
    confirm(
      "Reset your current streak?"
    );


  if (!confirmed) {
    return;
  }


  data.history.push({

    date: new Date()
      .toLocaleString(),

    days: days

  });


  data.attempts++;


  data.bestDays =
    Math.max(
      data.bestDays,
      days
    );


  data.startTime =
    Date.now();


  resetHabits();


  saveData();


  showMessage(
    "Fresh start. Keep going!"
  );


  updateTimer();

}


// ==============================
// MESSAGE
// ==============================

function showMessage(text) {

  const message =
    document.getElementById("message");


  message.textContent =
    text;


  setTimeout(() => {

    message.textContent =
      "Your next good choice counts.";

  }, 3000);

}


// ==============================
// HABITS
// ==============================

function resetHabits() {

  data.habits = {

    water: false,
    exercise: false,
    reading: false,
    sleep: false

  };

}


function openHabits() {

  const habits = [

    ["water", "Drink enough water"],

    ["exercise", "Move your body"],

    ["reading", "Read / learn 10 minutes"],

    ["sleep", "Keep a healthy sleep routine"]

  ];


  let html = `
    <h2>Daily Habits</h2>

    <p>
      Small positive habits can help
      you build a better routine.
    </p>

    <ul class="list">
  `;


  habits.forEach(habit => {

    html += `

      <li>

        <span>
          ${habit[1]}
        </span>

        <input
          type="checkbox"
          class="habitCheck"
          data-habit="${habit[0]}"
          ${data.habits[habit[0]]
            ? "checked"
            : ""}
        >

      </li>

    `;

  });


  html += `

    </ul>

    <button
      class="primary"
      onclick="closeModal()"
    >
      Done
    </button>

  `;


  openModal(html);


  document
    .querySelectorAll(".habitCheck")
    .forEach(box => {

      box.addEventListener(
        "change",
        function () {

          data.habits[
            this.dataset.habit
          ] = this.checked;


          saveData();


          updateHabitStatus();

        }
      );

    });

}


function updateHabitStatus() {

  const done =
    Object.values(
      data.habits
    ).filter(Boolean).length;


  document.getElementById(
    "habitStatus"
  ).textContent =
    done + "/4 Done";

}


updateHabitStatus();


// ==============================
// CHALLENGES
// ==============================

function openChallenges() {

  let html = `

    <h2>My Challenges</h2>

    <p>
      Create your own positive challenge.
    </p>

    <input
      id="challengeName"
      class="field"
      placeholder="Challenge name"
    >

    <input
      id="challengeDays"
      class="field"
      type="number"
      min="1"
      max="365"
      placeholder="Number of days"
    >

    <button
      class="primary"
      onclick="addChallenge()"
    >
      Add Challenge
    </button>

    <ul class="list">

  `;


  data.challenges.forEach(challenge => {

    html += `

      <li>

        <span>

          <b>
            ${challenge.name}
          </b>

          <br>

          ${challenge.progress}
          /
          ${challenge.target}
          days

        </span>


        <button
          class="primary"
          onclick="advanceChallenge(${challenge.id})"
        >
          +1
        </button>

      </li>

    `;

  });


  html += `

    </ul>

  `;


  openModal(html);

}


// ==============================
// ADD CHALLENGE
// ==============================

function addChallenge() {

  const name =
    document.getElementById(
      "challengeName"
    ).value.trim();


  const target =
    Number(
      document.getElementById(
        "challengeDays"
      ).value
    );


  if (!name) {

    alert(
      "Enter a challenge name."
    );

    return;

  }


  if (
    !target ||
    target < 1
  ) {

    alert(
      "Enter valid days."
    );

    return;

  }


  data.challenges.push({

    id: Date.now(),

    name: name,

    target: target,

    progress: 0,

    active: true

  });


  saveData();


  openChallenges();


  updateChallengeStatus();


  showMessage(
    "Challenge created!"
  );

}


// ==============================
// ADVANCE CHALLENGE
// ==============================

function advanceChallenge(id) {

  const challenge =
    data.challenges.find(
      item => item.id === id
    );


  if (!challenge) {
    return;
  }


  if (
    challenge.progress
    >= challenge.target
  ) {

    alert(
      "Challenge completed!"
    );

    return;

  }


  challenge.progress++;


  if (
    challenge.progress
    >= challenge.target
  ) {

    challenge.active =
      false;

    showMessage(
      "Challenge completed! 🎉"
    );

  }


  saveData();


  openChallenges();


  updateChallengeStatus();

}


// ==============================
// CHALLENGE STATUS
// ==============================

function updateChallengeStatus() {

  const active =
    data.challenges
      .filter(
        challenge =>
          challenge.active
      ).length;


  document.getElementById(
    "challengeStatus"
  ).textContent =
    active + " Active";

}


updateChallengeStatus();


// ==============================
// ATTEMPTS
// ==============================

function openAttempts() {

  let html = `

    <h2>My Attempts</h2>

    <p>
      Your previous streaks are saved here.
    </p>

  `;


  if (
    data.history.length === 0
  ) {

    html += `

      <p>
        No previous attempts yet.
      </p>

    `;

  }

  else {

    html += `
      <ul class="list">
    `;


    [...data.history]
      .reverse()
      .forEach(item => {

        html += `

          <li>

            <span>
              ${item.date}
            </span>

            <b>
              ${item.days} days
            </b>

          </li>

        `;

      });


    html += `
      </ul>
    `;

  }


  openModal(html);

}


// ==============================
// RECOVERY GUIDE
// ==============================

function openGuide() {

  const html = `

    <h2>
      Recovery Guide
    </h2>


    <h3>
      Build a routine
    </h3>

    <p>
      Keep your day structured with
      healthy activities, study,
      exercise and enough rest.
    </p>


    <h3>
      When you feel distracted
    </h3>

    <p>
      Put your phone away, change
      your environment and do another
      activity for a while.
    </p>


    <h3>
      If you relapse
    </h3>

    <p>
      Don't punish yourself.
      Learn what triggered the moment
      and start again.
    </p>


    <h3>
      Get support
    </h3>

    <p>
      If something feels difficult to
      manage alone, talk to a trusted
      parent, guardian, teacher or
      counselor.
    </p>

  `;


  openModal(html);

}


// ==============================
// ABOUT
// ==============================

function openAbout() {

  const html = `

    <h2>
      STOP SAM
    </h2>


    <p>
      STOP SAM is a simple private
      streak, habit and challenge
      tracker.
    </p>


    <h3>
      Privacy
    </h3>

    <p>
      Your basic app data is stored
      locally in your browser.
      No account is required.
    </p>


    <h3>
      Ads
    </h3>

    <p>
      This version contains no ads
      and no advertising SDK.
    </p>

  `;


  openModal(html);

}


// ==============================
// SETTINGS
// ==============================

function openSettings() {

  const html = `

    <h2>
      Settings
    </h2>


    <h3>
      App
    </h3>

    <p>
      STOP SAM
    </p>


    <h3>
      Data
    </h3>

    <button
      class="primary"
      onclick="exportData()"
    >
      Export Backup
    </button>


    <br><br>


    <button
      class="danger"
      onclick="clearAllData()"
    >
      Clear All Data
    </button>

  `;


  openModal(html);

}


// ==============================
// EXPORT
// ==============================

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
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;


  link.download =
    "STOP-SAM-backup.json";


  link.click();


  URL.revokeObjectURL(url);

}


// ==============================
// CLEAR DATA
// ==============================

function clearAllData() {

  const confirmed =
    confirm(
      "Delete all STOP SAM data?"
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    STORAGE_KEY
  );


  location.reload();

}


// ==============================
// MODAL
// ==============================

function openModal(content) {

  document.getElementById(
    "modalContent"
  ).innerHTML =
    content;


  document.getElementById(
    "modal"
  ).style.display =
    "flex";

}


function closeModal() {

  document.getElementById(
    "modal"
  ).style.display =
    "none";

}


// ==============================
// CLOSE MODAL WHEN BACKGROUND
// ==============================

document
  .getElementById("modal")
  .addEventListener(
    "click",
    function (event) {

      if (
        event.target === this
      ) {

        closeModal();

      }

    }
  );


// ==============================
// START APP
// ==============================

loadData();

updateTimer();

updateHabitStatus();

updateChallengeStatus();


// Update every second

setInterval(
  updateTimer,
  1000
);
