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
  progress: {},
  shuffledIndices: {} // To keep the random order consistent during a session
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
      {q:"Translate: I am a brother", a:"Ich bin ein Bruder"},
      {q:"Translate: You are a friend", a:"Du bist ein Freund"},
      {q:"Translate: He has a car", a:"Er hat ein Auto"},
      {q:"Translate: She has a book", a:"Sie hat ein Buch"},
      {q:"Translate: We have bread", a:"Wir haben Brot"},
      {q:"Translate: They have water", a:"Sie haben Wasser"},
      {q:"Translate: Good morning, Mother", a:"Guten Morgen, Mutter"},
      {q:"Translate: Good night, Father", a:"Gute Nacht, Vater"},
      {q:"Translate: I am fine, thank you", a:"Ich bin gut, danke"},
      {q:"Translate: Today is a day", a:"Heute ist ein Tag"},
      {q:"Translate: Tomorrow is Monday (Montag)", a:"Morgen ist Montag"},
      {q:"Translate: The house is big (groß)", a:"Das Haus ist groß"},
      {q:"Translate: The car is fast (schnell)", a:"Das Auto ist schnell"},
      {q:"Translate: I drink water", a:"Ich trinke Wasser"},
      {q:"Translate: You drink milk", a:"Du trinkst Milch"},
      {q:"Translate: He drinks coffee", a:"Er trinkt Kaffee"},
      {q:"Translate: She drinks tea", a:"Sie trinkt Tee"},
      {q:"Translate: We eat bread", a:"Wir essen Brot"},
      {q:"Translate: The book is on the table", a:"Das Buch ist auf dem Tisch"},
      {q:"Translate: The chair is in the house", a:"Der Stuhl ist im Haus"},
      {q:"Translate: One, two, three, four", a:"Eins, zwei, drei, vier"},
      {q:"Translate: Five, six, seven, eight", a:"Fünf, sechs, sieben, acht"},
      {q:"Translate: Nine and ten", a:"Neun und zehn"},
      {q:"Translate: I have a sister", a:"Ich habe eine Schwester"},
      {q:"Translate: He is a teacher (Lehrer)", a:"Er ist ein Lehrer"},
      {q:"Translate: The city is beautiful (schön)", a:"Die Stadt ist schön"},
      {q:"Translate: The country is large (groß)", a:"Das Land ist groß"},
      {q:"Translate: The train is coming (kommt)", a:"Der Zug kommt"},
      {q:"Translate: Today I learn German", a:"Heute lerne ich Deutsch"},
      {q:"Translate: I am at school", a:"Ich bin in der Schule"},
      {q:"Translate: You are at the office", a:"Du bist im Büro"},
      {q:"Translate: The water is cold (kalt)", a:"Das Wasser ist kalt"},
      {q:"Translate: The bread is fresh (frisch)", a:"Das Brot ist frisch"},
      {q:"Translate: The milk is white (weiß)", a:"Die Milch ist weiß"},
      {q:"Translate: Coffee or tea?", a:"Kaffee oder Tee?"},
      {q:"Translate: Yes, please", a:"Ja, bitte"},
      {q:"Translate: No, thank you", a:"Nein, danke"},
      {q:"Translate: Goodbye, my friend", a:"Tschüss, mein Freund"},
      {q:"Translate: Where is the house?", a:"Wo ist das Haus?"},
      {q:"Translate: Where is the car?", a:"Wo ist das Auto?"},
      {q:"Translate: I have a table and a chair", a:"Ich habe einen Tisch und einen Stuhl"},
      {q:"Translate: The mother loves the father", a:"Die Mutter liebt den Vater"},
      {q:"Translate: The father loves the mother", a:"Der Vater liebt die Mutter"},
      {q:"Translate: I am here (hier) today", a:"Ich bin heute hier"},
      {q:"Translate: You were there (da) yesterday", a:"Du warst gestern da"},
      {q:"Translate: The night is dark (dunkel)", a:"Die Nacht ist dunkel"},
      {q:"Translate: The day is bright (hell)", a:"Der Tag ist hell"},
      {q:"Translate: I have three books", a:"Ich habe drei Bücher"},
      {q:"Translate: We have two cars", a:"Wir haben zwei Autos"},
      {q:"Translate: Hello, how are you?", a:"Hallo, wie geht es dir?"}
    ],
    audio: [
      {q:"Watch the first 30 seconds. What is the first greeting?", link: "https://www.youtube.com/watch?v=4-eDoThe6qo", a: "Hallo"}
    ]
  }
};

/* ===== HELPER: SHUFFLE ARRAY ===== */
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

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
        document.querySelectorAll(".week-tab").forEach(t => t.classList.remove("week-active"));
        tab.classList.add("week-active");
        loadModule(i, type);
      };
      panel.appendChild(link);
    });

    tab.onclick = () => {
      const isVisible = panel.style.display === "block";
      document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
      panel.style.display = isVisible ? "none" : "block";
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
  const key = `week${currentWeek}_${currentModule}`;
  
  if(userData.progress[key] === undefined) {
    userData.progress[key] = 0;
  }

  // Generate a random order for this module if it doesn't exist
  if (!userData.shuffledIndices[key]) {
      const questions = courseData[`week${currentWeek}`][currentModule];
      let indices = Array.from(Array(questions.length).keys()); // [0, 1, 2...]
      userData.shuffledIndices[key] = shuffle(indices);
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
  
  const progressKey = `week${currentWeek}_${currentModule}`;
  const currentIndexInShuffle = userData.progress[progressKey] || 0;

  if (currentIndexInShuffle >= questions.length) {
    exDiv.innerHTML = "<h2>🎉 Module Completed!</h2>";
    updateStats();
    return;
  }

  // Get the question using the shuffled index
  const questionIndex = userData.shuffledIndices[progressKey][currentIndexInShuffle];
  const current = questions[questionIndex];

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
      
    document.getElementById("submitOpenBtn").addEventListener("click", () => {
        const val = document.getElementById("openAns").value.trim();
        checkAnswer(val, current.a);
    });
  }
  updateStats();
}

async function checkAnswer(val, correct) {
  const feedback = document.getElementById("feedback");
  // Basic normalization for open questions
  const isCorrect = (val === correct || (typeof val === 'string' && val.toLowerCase().replace(/[.,!?]/g, "") === correct.toLowerCase().replace(/[.,!?]/g, "")));

  if(isCorrect) {
    feedback.innerText = "✅ Korrekt!";
    feedback.className = "feedback correct";
    userData.xp += 10;
    userData.streak += 1;
    const key = `week${currentWeek}_${currentModule}`;
    userData.progress[key]++;
    await setDoc(doc(db, "users", currentUser), userData);
    updateStats();
    setTimeout(() => renderExercise(), 800);
  } else {
    const progressKey = `week${currentWeek}_${currentModule}`;
    const questionIndex = userData.shuffledIndices[progressKey][userData.progress[progressKey]];
    const displayCorrect = (typeof correct === 'number') ? courseData[`week${currentWeek}`][currentModule][questionIndex].a[correct] : correct;
    
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
    const key = `week${currentWeek}_${currentModule}`;
    const index = userData.progress[key] || 0;
    const percent = (index / questions.length) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
  }
}
