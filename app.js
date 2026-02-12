// Initialize Firebase (compat)
const firebaseConfig = {
  apiKey: "AIzaSyCWAkeJhwzxwdKsbCKavOu9C-pZIZENftI",
  authDomain: "german-special-forces.firebaseapp.com",
  projectId: "german-special-forces",
  storageBucket: "german-special-forces.firebasestorage.app",
  messagingSenderId: "440759850329",
  appId: "1:440759850329:web:33a1f0116e1c32f2132848"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elements
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");

const xpDisplay = document.getElementById("xpDisplay");
const streakDisplay = document.getElementById("streakDisplay");
const weekDisplay = document.getElementById("weekDisplay");
const weeksList = document.getElementById("weeksList");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitBtn");
const feedback = document.getElementById("feedback");
const progressFill = document.getElementById("progressFill");
const audioPlayer = document.getElementById("audioPlayer");

// --- Week 1 Exercises (50 total) ---
const week1Exercises = [
  {type:"mcq", question:"Hello in German is...", options:["Hallo","Tschüss","Bitte"], answer:"Hallo"},
  {type:"mcq", question:"Thank you in German is...", options:["Danke","Bitte","Entschuldigung"], answer:"Danke"},
  {type:"input", question:"Say 'Good morning' in German", answer:"Guten Morgen"},
  {type:"input", question:"Translate 'I am a student' into German", answer:"Ich bin ein Student"},
  {type:"mcq", question:"Good night in German is...", options:["Gute Nacht","Guten Tag","Hallo"], answer:"Gute Nacht"},
  {type:"input", question:"Translate 'I like apples' into German", answer:"Ich mag Äpfel"},
  {type:"mcq", question:"Yes in German is...", options:["Ja","Nein","Vielleicht"], answer:"Ja"},
  {type:"input", question:"Say 'I am learning German'", answer:"Ich lerne Deutsch"},
  {type:"mcq", question:"No in German is...", options:["Nein","Ja","Vielleicht"], answer:"Nein"},
  {type:"input", question:"Translate 'My name is John' into German", answer:"Mein Name ist John"},
  {type:"mcq", question:"Please in German is...", options:["Bitte","Danke","Hallo"], answer:"Bitte"},
  {type:"input", question:"Say 'I am hungry' in German", answer:"Ich habe Hunger"},
  {type:"mcq", question:"Goodbye in German is...", options:["Tschüss","Hallo","Danke"], answer:"Tschüss"},
  {type:"input", question:"Translate 'I like music' into German", answer:"Ich mag Musik"},
  {type:"mcq", question:"Excuse me / Sorry in German is...", options:["Entschuldigung","Bitte","Ja"], answer:"Entschuldigung"},
  {type:"input", question:"Say 'I am happy' in German", answer:"Ich bin glücklich"},
  {type:"mcq", question:"Water in German is...", options:["Wasser","Brot","Milch"], answer:"Wasser"},
  {type:"input", question:"Translate 'I am tired' into German", answer:"Ich bin müde"},
  {type:"mcq", question:"Bread in German is...", options:["Brot","Milch","Käse"], answer:"Brot"},
  {type:"input", question:"Say 'I like dogs' in German", answer:"Ich mag Hunde"},
  {type:"mcq", question:"Milk in German is...", options:["Milch","Wasser","Brot"], answer:"Milch"},
  {type:"input", question:"Translate 'I am thirsty' into German", answer:"Ich habe Durst"},
  {type:"mcq", question:"Cheese in German is...", options:["Käse","Brot","Milch"], answer:"Käse"},
  {type:"input", question:"Say 'I am cold' in German", answer:"Mir ist kalt"},
  {type:"mcq", question:"Friend in German is...", options:["Freund","Feind","Kollege"], answer:"Freund"},
  {type:"input", question:"Translate 'I like reading' into German", answer:"Ich lese gern"},
  {type:"mcq", question:"Family in German is...", options:["Familie","Freund","Lehrer"], answer:"Familie"},
  {type:"input", question:"Say 'I am learning' in German", answer:"Ich lerne"},
  {type:"mcq", question:"School in German is...", options:["Schule","Haus","Büro"], answer:"Schule"},
  {type:"input", question:"Translate 'I have a book' into German", answer:"Ich habe ein Buch"},
  {type:"mcq", question:"Teacher in German is...", options:["Lehrer","Schüler","Freund"], answer:"Lehrer"},
  {type:"input", question:"Say 'I am listening to music' in German", answer:"Ich höre Musik"},
  {type:"mcq", question:"Student in German is...", options:["Student","Lehrer","Freund"], answer:"Student"},
  {type:"input", question:"Translate 'I like coffee' into German", answer:"Ich mag Kaffee"},
  {type:"mcq", question:"Coffee in German is...", options:["Kaffee","Tee","Wasser"], answer:"Kaffee"},
  {type:"input", question:"Say 'I like tea' in German", answer:"Ich mag Tee"},
  {type:"mcq", question:"Tea in German is...", options:["Tee","Kaffee","Milch"], answer:"Tee"},
  {type:"input", question:"Translate 'I am at home' into German", answer:"Ich bin zu Hause"},
  {type:"mcq", question:"House in German is...", options:["Haus","Schule","Büro"], answer:"Haus"},
  {type:"input", question:"Say 'I have a dog' in German", answer:"Ich habe einen Hund"},
  {type:"mcq", question:"Dog in German is...", options:["Hund","Katze","Maus"], answer:"Hund"},
  {type:"input", question:"Translate 'I have a cat' into German", answer:"Ich habe eine Katze"},
  {type:"mcq", question:"Cat in German is...", options:["Katze","Hund","Vogel"], answer:"Katze"},
  {type:"input", question:"Say 'I like to swim' in German", answer:"Ich schwimme gern"},
  {type:"mcq", question:"Car in German is...", options:["Auto","Fahrrad","Bus"], answer:"Auto"},
  {type:"input", question:"Translate 'I am driving a car' into German", answer:"Ich fahre ein Auto"},
  {type:"mcq", question:"Bicycle in German is...", options:["Fahrrad","Auto","Bus"], answer:"Fahrrad"},
  {type:"input", question:"Say 'I am riding a bicycle' in German", answer:"Ich fahre ein Fahrrad"},
  {type:"mcq", question:"Bus in German is...", options:["Bus","Auto","Zug"], answer:"Bus"},
  {type:"input", question:"Translate 'I am taking the bus' into German", answer:"Ich nehme den Bus"},
];

// Bonus audio clips
const audioClips = [
  "https://www.freesound.org/data/previews/341/341695_3248244-lq.mp3",
  "https://www.freesound.org/data/previews/256/256113_4486188-lq.mp3",
  "https://www.freesound.org/data/previews/415/415209_5121236-lq.mp3"
];

let username = "";
let userData = {xp:0, streak:0, week:1, exerciseIndex:0};
let currentExercises = [];

// --- LOGIN ---
loginBtn.onclick = async ()=>{
  const rawUsername = usernameInput.value.trim();
  if(!rawUsername) return alert("Enter a username!");
  
  username = rawUsername.toLowerCase(); // case-insensitive
  const userRef = db.collection("users").doc(username);
  const doc = await userRef.get();
  
  if(doc.exists){
    userData = doc.data();
  } else {
    await userRef.set(userData);
  }
  
  loginScreen.style.display="none";
  appScreen.style.display="flex";
  startApp();
}

// --- START APP ---
function startApp(){
  updateStats();

  // Sidebar
  weeksList.innerHTML="";
  for(let i=1;i<=10;i++){
    const li = document.createElement("li");
    li.innerText = `Week ${i}`;
    if(i>userData.week) li.classList.add("locked");
    li.addEventListener("click", ()=>{ if(i<=userData.week) loadWeek(i) });
    weeksList.appendChild(li);
  }

  loadWeek(userData.week);

  // Play random bonus audio
  audioPlayer.src = audioClips[Math.floor(Math.random()*audioClips.length)];
  audioPlayer.play().catch(()=>{});
}

// --- LOAD WEEK ---
function loadWeek(week){
  currentExercises = [...week1Exercises].sort(()=>Math.random()-0.5);
  userData.exerciseIndex = 0; // always start at beginning of week
  showExercise();
  updateProgress();
}

// --- SHOW EXERCISE ---
function showExercise(){
  feedback.innerText="";
  const ex = currentExercises[userData.exerciseIndex];
  questionEl.innerText = ex.question;
  optionsEl.innerHTML="";
  
  if(ex.type==="mcq"){
    answerInput.style.display="none";
    ex.options.forEach(opt=>{
      const btn = document.createElement("button");
      btn.classList.add("optionBtn");
      btn.innerText = opt;
      btn.onclick = ()=>checkAnswer(opt);
      optionsEl.appendChild(btn);
    });
  } else {
    answerInput.style.display="inline-block";
    answerInput.value="";
  }
}

// --- SUBMIT BUTTON ---
submitBtn.onclick = ()=>{
  const ex = currentExercises[userData.exerciseIndex];
  if(ex.type==="input"){
    checkAnswer(answerInput.value.trim());
  }
}

// --- CHECK ANSWER ---
function checkAnswer(ans){
  const ex = currentExercises[userData.exerciseIndex];
  if(ans.toLowerCase()===ex.answer.toLowerCase()){
    feedback.innerText = "✔ Correct +10 XP";
    userData.xp += 10;
    userData.streak += 1;
  } else {
    feedback.innerText = "❌ Wrong, try again!";
    userData.streak = 0;
    return;
  }

  userData.exerciseIndex += 1;
  updateProgress();
  updateStats();
  saveProgress();

  if(userData.exerciseIndex >= currentExercises.length){
    userData.week += 1;
    alert(`🎉 You finished Week ${userData.week-1}! Week ${userData.week} unlocked!`);
    loadWeek(userData.week);
  } else {
    setTimeout(showExercise,300);
  }
}

// --- UPDATE PROGRESS & STATS ---
function updateProgress(){
  progressFill.style.width = (userData.exerciseIndex / currentExercises.length) * 100 + "%";
}
function updateStats(){
  xpDisplay.innerText = `XP: ${userData.xp}`;
  streakDisplay.innerText = `Streak: ${userData.streak}`;
  weekDisplay.innerText = `Week: ${userData.week}`;
}

// --- SAVE ---
function saveProgress(){
  db.collection("users").doc(username).set(userData);
}
