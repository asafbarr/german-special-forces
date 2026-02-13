import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWAkeJhwzxwdKsbCKavOu9C-pZIZENftI",
  authDomain: "german-special-forces.firebaseapp.com",
  projectId: "german-special-forces",
  storageBucket: "german-special-forces.firebasestorage.app",
  messagingSenderId: "440759850329",
  appId: "1:440759850329:web:33a1f0116e1c32f2132848"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser;
let userData = {
  xp: 0,
  streak: 0,
  progress: {} 
};

let currentWeek = 1;
let currentModule = ""; 

const courseData = {
  week1: {
    words: [
      {q:"Hello",a:["Hallo","Tschüss","Danke"],correct:0},
      {q:"Goodbye",a:["Bitte","Tschüss","Ja"],correct:1},
      {q:"Thank you",a:["Danke","Nein","Hallo"],correct:0},
      {q:"Please",a:["Bitte","Danke","Hallo"],correct:0},
      {q:"Yes",a:["Nein","Ja","Bitte"],correct:1},
      {q:"No",a:["Ja","Nein","Hallo"],correct:1},
      {q:"Good morning",a:["Guten Morgen","Gute Nacht","Hallo"],correct:0},
      {q:"Good night",a:["Guten Tag","Gute Nacht","Danke"],correct:1},
      {q:"How are you?",a:["Wie geht's?","Wo bist du?","Was ist das?"],correct:0},
      {q:"I am fine",a:["Ich bin gut","Ich bin traurig","Ich bin müde"],correct:0},
      {q:"One",a:["Eins","Zwei","Drei"],correct:0},
      {q:"Two",a:["Vier","Zwei","Fünf"],correct:1},
      {q:"Three",a:["Drei","Sieben","Neun"],correct:0},
      {q:"Four",a:["Sechs","Vier","Acht"],correct:1},
      {q:"Five",a:["Fünf","Zehn","Elf"],correct:0},
      {q:"Six",a:["Sechs","Zwei","Drei"],correct:0},
      {q:"Seven",a:["Acht","Sieben","Neun"],correct:1},
      {q:"Eight",a:["Sieben","Zehn","Acht"],correct:2},
      {q:"Nine",a:["Neun","Fünf","Vier"],correct:0},
      {q:"Ten",a:["Zehn","Elf","Zwölf"],correct:0},
      {q:"I",a:["Du","Ich","Er"],correct:1},
      {q:"You (informal)",a:["Du","Sie","Wir"],correct:0},
      {q:"He",a:["Sie","Er","Es"],correct:1},
      {q:"She",a:["Sie","Er","Ich"],correct:0},
      {q:"We",a:["Ihr","Wir","Du"],correct:1},
      {q:"They",a:["Sie","Wir","Es"],correct:0},
      {q:"House",a:["Auto","Haus","Baum"],correct:1},
      {q:"Car",a:["Auto","Haus","Zug"],correct:0},
      {q:"Book",a:["Stuhl","Buch","Tisch"],correct:1},
      {q:"Table",a:["Tür","Fenster","Tisch"],correct:2},
      {q:"Chair",a:["Stuhl","Lampe","Bett"],correct:0},
      {q:"Water",a:["Milch","Wasser","Saft"],correct:1},
      {q:"Bread",a:["Käse","Brot","Reis"],correct:1},
      {q:"Milk",a:["Milch","Wasser","Tee"],correct:0},
      {q:"Coffee",a:["Kaffee","Saft","Bier"],correct:0},
      {q:"Tea",a:["Kaffee","Tee","Milch"],correct:1},
      {q:"Mother",a:["Vater","Bruder","Mutter"],correct:2},
      {q:"Father",a:["Vater","Sohn","Onkel"],correct:0},
      {q:"Brother",a:["Schwester","Bruder","Cousin"],correct:1},
      {q:"Sister",a:["Tante","Schwester","Mutter"],correct:1},
      {q:"Friend",a:["Freund","Lehrer","Arzt"],correct:0},
      {q:"School",a:["Schule","Büro","Krankenhaus"],correct:0},
      {q:"Office",a:["Park","Büro","Restaurant"],correct:1},
      {q:"City",a:["Dorf","Stadt","Land"],correct:1},
      {q:"Country",a:["Land","Stadt","Haus"],correct:0},
      {q:"Train",a:["Auto","Bus","Zug"],correct:2},
      {q:"Today",a:["Heute","Morgen","Gestern"],correct:0},
      {q:"Tomorrow",a:["Heute","Gestern","Morgen"],correct:2},
      {q:"Yesterday",a:["Gestern","Heute","Nacht"],correct:0},
      {q:"Day",a:["Tag","Nacht","Woche"],correct:0},
      {q:"Night",a:["Tag","Abend","Nacht"],correct:2}
    ],
    open: [
      {q:"Say in German: I like books", a: "Ich mag Bücher"},
      {q:"Say in German: The car is good", a: "Das Auto ist gut"},
      {q:"Say in German: Good morning, Father", a: "Guten Morgen, Vater"},
      {q:"Say in German: I have a house", a: "Ich habe ein Haus"},
      {q:"Say in German: How are you, friend?", a: "Wie geht's, Freund?"}
    ],
    audio: [
      {q:"Watch the first 30 seconds. What is the first greeting?", link: "https://www.youtube.com/watch?v=4-eDoThe6qo", a: "Hallo"}
    ]
  }
};

document.getElementById("loginBtn").onclick = async () => {
  const username = document.getElementById("username").value.trim().toLowerCase();
  if(!username) return alert("Enter username");
  currentUser = username;
  const ref = doc(db, "users", currentUser);
  const snap = await getDoc(ref);
  if(snap.exists()) userData = snap.data();
  else await setDoc(ref, userData);

  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("sidebar").style.display = "block";
  renderSidebar();
  updateStats();
};

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";
  for(let i = 1; i <= 3; i++) {
    const tab = document.createElement("div");
    tab.className = "week-tab";
    tab.innerText = "Week " + i;
    
    const panel = document.createElement("div");
    panel.className = "panel";
    
    ["Words", "Open Questions", "Audio"].forEach(type => {
      const link = document.createElement("div");
      link.className = "mod-link";
      link.innerText = type;
      link.onclick = (e) => {
        e.stopPropagation();
        // UI Fix: Highlight tab and link
        document.querySelectorAll(".week-tab").forEach(t => t.classList.remove("week-active"));
        tab.classList.add("week-active");
        loadModule(i, type);
      };
      panel.appendChild(link);
    });

    tab.onclick = () => {
      // Logic for accordion
      const isVisible = panel.style.display === "block";
      document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
      panel.style.display = isVisible ? "none" : "block";
      
      // Highlight the tab immediately on click
      document.querySelectorAll(".week-tab").forEach(t => t.classList.remove("week-active"));
      tab.classList.add("week-active");
    };

    sidebar.appendChild(tab);
    sidebar.appendChild(panel);
  }
}

function loadModule(week, type) {
  currentWeek = week;
  currentModule = type.toLowerCase().replace(" ", "");
  
  // Ensure progress exists for this module
  const key = `week${currentWeek}_${currentModule}`;
  if(userData.progress[key] === undefined) {
    userData.progress[key] = 0;
  }
  
  document.getElementById("modDisplay").innerText = `W${currentWeek}: ${type.toUpperCase()}`;
  renderExercise();
}

function renderExercise() {
  const exDiv = document.getElementById("exercise");
  const feedback = document.getElementById("feedback");
  feedback.innerText = "";
  
  const questions = courseData[`week${currentWeek}`]?.[currentModule];
  if(!questions) {
      exDiv.innerHTML = "<h3>Content coming soon!</h3>";
      return;
  }
  
  const index = userData.progress[`week${currentWeek}_${currentModule}`] || 0;

  if (index >= questions.length) {
    exDiv.innerHTML = "<h2>🎉 Module Completed!</h2>";
    updateStats(); // Update one last time to show 100%
    return;
  }

  const current = questions[index];

  if(currentModule === "words") {
    exDiv.innerHTML = "<h3>" + current.q + "</h3>";
    current.a.forEach((ans, i) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.innerText = ans;
      btn.onclick = () => checkAnswer(i, current.correct);
      exDiv.appendChild(btn);
    });
  } else {
    const link = current.link ? `<br><a href="${current.link}" target="_blank" style="color:#3498db; font-weight:bold;">[CLICK TO VIEW ASSET]</a><br>` : "";
    exDiv.innerHTML = `<h3>${current.q}</h3>${link}<br>
      <input id="openAns" placeholder="Type in German..." style="width: 80%;"><br>
      <button class="primary-btn" id="submitOpenBtn">Submit Answer</button>`;
      
    // Fix: Using direct listener for the dynamic button
    document.getElementById("submitOpenBtn").addEventListener("click", () => {
        const val = document.getElementById("openAns").value.trim();
        checkAnswer(val, current.a);
    });
  }
  updateStats();
}

async function checkAnswer(val, correct) {
  const feedback = document.getElementById("feedback");
  const isCorrect = (val === correct || (typeof val === 'string' && val.toLowerCase() === correct.toLowerCase()));

  if(isCorrect) {
    feedback.innerText = "✅ Korrekt!";
    feedback.className = "feedback correct";
    userData.xp += 10;
    userData.streak += 1;
    
    // Increment and Save
    const key = `week${currentWeek}_${currentModule}`;
    userData.progress[key]++;
    
    await setDoc(doc(db, "users", currentUser), userData);
    updateStats();
    setTimeout(() => renderExercise(), 800);
  } else {
    const displayCorrect = (typeof correct === 'number') ? courseData[`week${currentWeek}`][currentModule][userData.progress[`week${currentWeek}_${currentModule}`]].a[correct] : correct;
    feedback.innerText = `❌ Wrong. The answer is: "${displayCorrect}". Try again!`;
    feedback.className = "feedback wrong";
    userData.streak = 0;
    updateStats();
  }
}

function updateStats() {
  document.getElementById("xp").innerText = "XP: " + userData.xp;
  document.getElementById("streak").innerText = "Streak: " + userData.streak;
  
  const questions = courseData[`week${currentWeek}`]?.[currentModule];
  if(questions) {
    const index = userData.progress[`week${currentWeek}_${currentModule}`] || 0;
    const percent = (index / questions.length) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
  } else {
    document.getElementById("progressBar").style.width = "0%";
  }
}
