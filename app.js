import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser;
let currentWeek = 1;
let currentDay = 1;
let currentModule = "";

let userData = {
  xp: 0,
  streak: 0,
  progress: {}
};

/* =============================
   COURSE GENERATOR
   52 Weeks × 5 Days
   ============================= */

function generateCourse() {
  const course = {};

  for (let w = 1; w <= 52; w++) {
    course["week" + w] = {};

    for (let d = 1; d <= 5; d++) {

      const words = [];
      const open = [];
      const audio = [];

      for (let i = 1; i <= 50; i++) {
        const baseWord = `W${w}D${d}Word${i}`;
        words.push({
          q: `Translate: ${baseWord}`,
          a: [`Antwort1`, `Antwort2`, baseWord],
          correct: 2
        });

        open.push({
          q: `Write in German: ${baseWord}`,
          a: baseWord
        });
      }

      for (let i = 1; i <= 10; i++) {
        audio.push({
          q: `Listen and type the keyword (Audio ${i})`,
          link: "https://www.youtube.com/watch?v=6Ka_3Rq8JZ4",
          a: `audio${i}`
        });
      }

      course["week" + w]["day" + d] = {
        words,
        open,
        audio
      };
    }
  }

  return course;
}

const courseData = generateCourse();

/* =============================
   LOGIN
   ============================= */

document.getElementById("loginBtn").onclick = async () => {
  const username = document.getElementById("username").value.trim().toLowerCase();
  if (!username) return alert("Enter username");

  currentUser = username;

  const ref = doc(db, "users", currentUser);
  const snap = await getDoc(ref);

  if (snap.exists()) userData = snap.data();
  else await setDoc(ref, userData);

  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("sidebar").style.display = "block";

  renderSidebar();
  updateStats();
};

/* =============================
   SIDEBAR (WEEK → DAY → MODULE)
   ============================= */

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  for (let w = 1; w <= 52; w++) {

    const weekTab = document.createElement("div");
    weekTab.className = "week-tab";
    weekTab.innerText = "Week " + w;

    const weekPanel = document.createElement("div");
    weekPanel.className = "panel";

    for (let d = 1; d <= 5; d++) {

      const dayTab = document.createElement("div");
      dayTab.className = "day-tab";
      dayTab.innerText = "Day " + d;

      const dayPanel = document.createElement("div");
      dayPanel.className = "panel";

      ["words", "open", "audio"].forEach(type => {

        const link = document.createElement("div");
        link.className = "mod-link";
        link.innerText = type.toUpperCase();

        link.onclick = (e) => {
          e.stopPropagation();
          loadModule(w, d, type);
        };

        dayPanel.appendChild(link);
      });

      dayTab.onclick = () => {
        dayPanel.style.display =
          dayPanel.style.display === "block" ? "none" : "block";
      };

      weekPanel.appendChild(dayTab);
      weekPanel.appendChild(dayPanel);
    }

    weekTab.onclick = () => {
      weekPanel.style.display =
        weekPanel.style.display === "block" ? "none" : "block";
    };

    sidebar.appendChild(weekTab);
    sidebar.appendChild(weekPanel);
  }
}

/* =============================
   LOAD MODULE
   ============================= */

function loadModule(week, day, type) {
  currentWeek = week;
  currentDay = day;
  currentModule = type;

  const key = `w${week}d${day}_${type}`;

  if (!userData.progress[key]) userData.progress[key] = 0;

  document.getElementById("modDisplay").innerText =
    `Week ${week} Day ${day} - ${type.toUpperCase()}`;

  renderExercise();
}

/* =============================
   RENDER EXERCISE
   ============================= */

function renderExercise() {
  const exDiv = document.getElementById("exercise");
  const feedback = document.getElementById("feedback");
  feedback.innerText = "";

  const questions =
    courseData[`week${currentWeek}`][`day${currentDay}`][currentModule];

  const key = `w${currentWeek}d${currentDay}_${currentModule}`;
  const index = userData.progress[key];

  if (index >= questions.length) {
    exDiv.innerHTML = "<h2>🎉 Day Complete!</h2>";
    return;
  }

  const current = questions[index];

  if (currentModule === "words") {
    exDiv.innerHTML = `<h3>${current.q}</h3>`;

    current.a.forEach((ans, i) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.innerText = ans;
      btn.onclick = () => checkAnswer(i, current.correct);
      exDiv.appendChild(btn);
    });

  } else {

    exDiv.innerHTML = `
      <h3>${current.q}</h3>
      ${current.link ? `<br><a href="${current.link}" target="_blank">🎧 Listen</a><br><br>` : ""}
      <input id="openAns" placeholder="Type answer...">
      <br>
      <button class="primary-btn" id="confirmBtn">Confirm</button>
    `;

    document.getElementById("confirmBtn").onclick = () => {
      checkAnswer(
        document.getElementById("openAns").value.trim(),
        current.a
      );
    };
  }

  updateStats();
}

/* =============================
   CHECK ANSWER
   ============================= */

async function checkAnswer(val, correct) {
  const feedback = document.getElementById("feedback");
  const key = `w${currentWeek}d${currentDay}_${currentModule}`;

  const isCorrect =
    typeof correct === "number"
      ? val === correct
      : val.toLowerCase() === correct.toLowerCase();

  if (isCorrect) {
    feedback.innerText = "✅ Correct!";
    feedback.className = "feedback correct";

    userData.xp += 10;
    userData.streak++;
    userData.progress[key]++;

    await setDoc(doc(db, "users", currentUser), userData);

    setTimeout(renderExercise, 500);

  } else {
    feedback.innerText = "❌ Incorrect!";
    feedback.className = "feedback wrong";
    userData.streak = 0;
  }

  updateStats();
}

/* =============================
   STATS
   ============================= */

function updateStats() {
  document.getElementById("xp").innerText = "XP: " + userData.xp;
  document.getElementById("streak").innerText = "Streak: " + userData.streak;

  const questions =
    courseData[`week${currentWeek}`]?.[`day${currentDay}`]?.[currentModule];

  if (!questions) return;

  const key = `w${currentWeek}d${currentDay}_${currentModule}`;
  const percent = (userData.progress[key] / questions.length) * 100;

  document.getElementById("progressBar").style.width =
    Math.min(percent, 100) + "%";
}
