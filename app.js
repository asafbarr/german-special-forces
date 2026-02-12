// Firebase config (replace with your keys)
const firebaseConfig = {
  apiKey: "AIzaSyCWAkeJhwzxwdKsbCKavOu9C-pZIZENftI",
  authDomain: "german-special-forces.firebaseapp.com",
  projectId: "german-special-forces",
  storageBucket: "german-special-forces.firebasestorage.app",
  messagingSenderId: "440759850329",
  appId: "1:440759850329:web:33a1f0116e1c32f2132848"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// UI Elements
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

// Week 1 Exercises (50)
const week1Exercises = [
  {type:"mcq", question:"Wie sagt man 'Hello' auf Deutsch?", options:["Hallo","Tschüss","Danke"], answer:"Hallo"},
  {type:"mcq", question:"Was bedeutet 'Danke'?", options:["Thank you","Please","Hello"], answer:"Thank you"},
  {type:"mcq", question:"Welcher Artikel ist richtig für 'Haus'?", options:["Der","Die","Das"], answer:"Das"},
  {type:"mcq", question:"Übersetze 'Good morning'", options:["Guten Morgen","Guten Abend","Gute Nacht"], answer:"Guten Morgen"},
  {type:"mcq", question:"Wie sagt man 'Yes' auf Deutsch?", options:["Nein","Ja","Vielleicht"], answer:"Ja"},
  {type:"mcq", question:"Übersetze 'No' auf Deutsch", options:["Nein","Ja","Vielleicht"], answer:"Nein"},
  {type:"mcq", question:"Was bedeutet 'Bitte'?", options:["Please","Thank you","Hello"], answer:"Please"},
  {type:"mcq", question:"Welcher Plural ist richtig: 'Apfel'?", options:["Äpfel","Apfels","Apfeln"], answer:"Äpfel"},
  {type:"mcq", question:"Was bedeutet 'Guten Abend'?", options:["Good evening","Good night","Good morning"], answer:"Good evening"},
  {type:"mcq", question:"Wie sagt man 'I love you' auf Deutsch?", options:["Ich liebe dich","Ich hasse dich","Ich mag dich"], answer:"Ich liebe dich"},
  {type:"input", question:"Schreibe 'cat' auf Deutsch", answer:"Katze"},
  {type:"input", question:"Schreibe 'dog' auf Deutsch", answer:"Hund"},
  {type:"input", question:"Schreibe 'water' auf Deutsch", answer:"Wasser"},
  {type:"input", question:"Schreibe 'house' auf Deutsch", answer:"Haus"},
  {type:"input", question:"Schreibe 'school' auf Deutsch", answer:"Schule"},
  {type:"mcq", question:"Was bedeutet 'Freund'?", options:["Friend","Enemy","Teacher"], answer:"Friend"},
  {type:"mcq", question:"Was bedeutet 'Schule'?", options:["School","Hospital","Car"], answer:"School"},
  {type:"mcq", question:"Wie sagt man 'Good night' auf Deutsch?", options:["Gute Nacht","Guten Morgen","Guten Tag"], answer:"Gute Nacht"},
  {type:"mcq", question:"Welcher Artikel für 'Tisch'?", options:["Der","Die","Das"], answer:"Der"},
  {type:"mcq", question:"Wie sagt man 'Thank you very much'?", options:["Vielen Dank","Danke schön","Bitte"], answer:"Vielen Dank"},
  {type:"mcq", question:"Übersetze 'I am hungry'", options:["Ich bin hungrig","Ich bin müde","Ich bin krank"], answer:"Ich bin hungrig"},
  {type:"mcq", question:"Wie sagt man 'I am tired'?", options:["Ich bin müde","Ich bin hungrig","Ich bin traurig"], answer:"Ich bin müde"},
  {type:"mcq", question:"Was bedeutet 'Buch'?", options:["Book","Pen","Chair"], answer:"Book"},
  {type:"mcq", question:"Was bedeutet 'Stuhl'?", options:["Chair","Table","Bed"], answer:"Chair"},
  {type:"mcq", question:"Wie sagt man 'Goodbye'?", options:["Tschüss","Hallo","Bitte"], answer:"Tschüss"},
  {type:"input", question:"Schreibe 'apple' auf Deutsch", answer:"Apfel"},
  {type:"input", question:"Schreibe 'milk' auf Deutsch", answer:"Milch"},
  {type:"input", question:"Schreibe 'bread' auf Deutsch", answer:"Brot"},
  {type:"input", question:"Schreibe 'car' auf Deutsch", answer:"Auto"},
  {type:"input", question:"Schreibe 'window' auf Deutsch", answer:"Fenster"},
  {type:"mcq", question:"Was bedeutet 'Fenster'?", options:["Window","Door","Roof"], answer:"Window"},
  {type:"mcq", question:"Wie sagt man 'roof' auf Deutsch?", options:["Dach","Fenster","Tür"], answer:"Dach"},
  {type:"mcq", question:"Was bedeutet 'Tür'?", options:["Door","Window","Roof"], answer:"Door"},
  {type:"mcq", question:"Wie sagt man 'I like it'?", options:["Ich mag es","Ich liebe es","Es ist gut"], answer:"Ich mag es"},
  {type:"mcq", question:"Wie sagt man 'I don't understand'?", options:["Ich verstehe nicht","Ich liebe nicht","Ich mag nicht"], answer:"Ich verstehe nicht"},
  {type:"mcq", question:"Übersetze 'Where is the bathroom?'", options:["Wo ist die Toilette?","Wo ist das Haus?","Wo ist die Schule?"], answer:"Wo ist die Toilette?"},
  {type:"mcq", question:"Wie sagt man 'Excuse me'?", options:["Entschuldigung","Bitte","Danke"], answer:"Entschuldigung"},
  {type:"input", question:"Schreibe 'friend' auf Deutsch", answer:"Freund"},
  {type:"input", question:"Schreibe 'teacher' auf Deutsch", answer:"Lehrer"},
  {type:"input", question:"Schreibe 'student' auf Deutsch", answer:"Schüler"},
  {type:"input", question:"Schreibe 'pen' auf Deutsch", answer:"Stift"},
  {type:"input", question:"Schreibe 'chair' auf Deutsch", answer:"Stuhl"},
  {type:"mcq", question:"Wie sagt man 'I am happy'?", options:["Ich bin glücklich","Ich bin traurig","Ich bin müde"], answer:"Ich bin glücklich"},
  {type:"mcq", question:"Wie sagt man 'I am sad'?", options:["Ich bin traurig","Ich bin glücklich","Ich bin müde"], answer:"Ich bin traurig"},
  {type:"mcq", question:"Was bedeutet 'Milch'?", options:["Milk","Bread","Water"], answer:"Milk"},
  {type:"mcq", question:"Was bedeutet 'Brot'?", options:["Bread","Milk","Cheese"], answer:"Bread"},
  {type:"mcq", question:"Wie sagt man 'I want water'?", options:["Ich will Wasser","Ich habe Wasser","Ich liebe Wasser"], answer:"Ich will Wasser"},
  {type:"mcq", question:"Wie sagt man 'I need help'?", options:["Ich brauche Hilfe","Ich habe Hilfe","Ich will Hilfe"], answer:"Ich brauche Hilfe"},
  {type:"mcq", question:"Was bedeutet 'Auto'?", options:["Car","Bike","Plane"], answer:"Car"}
];

// Bonus German audio playlist
const audioClips = [
  "https://www.freesound.org/data/previews/341/341695_3248244-lq.mp3",
  "https://www.freesound.org/data/previews/256/256113_4486188-lq.mp3",
  "https://www.freesound.org/data/previews/415/415209_5121236-lq.mp3"
];

// App state
let currentUser = null;
let userData = { xp:0, streak:0, week:1, exerciseIndex:0 };
let currentExercises = [];

// Initialize
auth.signInAnonymously().then(user => {
  currentUser = user.user;
  const docRef = db.collection("users").doc(currentUser.uid);
  docRef.get().then(doc => {
    if(doc.exists){
      userData = doc.data();
    }
    startApp();
  }).catch(err => console.error(err));
}).catch(err => console.error(err));

function startApp(){
  weekDisplay.innerText = `Week: ${userData.week}`;
  xpDisplay.innerText = `XP: ${userData.xp}`;
  streakDisplay.innerText = `Streak: ${userData.streak}`;
  
  // Sidebar weeks
  for(let i=1;i<=10;i++){
    const li = document.createElement("li");
    li.innerText = `Week ${i}`;
    if(i>userData.week) li.classList.add("locked");
    li.addEventListener("click",()=>{if(i<=userData.week) loadWeek(i)});
    weeksList.appendChild(li);
  }

  loadWeek(userData.week);

  // Play random bonus audio
  audioPlayer.src = audioClips[Math.floor(Math.random()*audioClips.length)];
  audioPlayer.play().catch(()=>{}); // autoplay may be blocked
}

function loadWeek(week){
  currentExercises = [...week1Exercises].sort(()=>Math.random()-0.5); // randomize
  userData.exerciseIndex = 0;
  showExercise();
}

function showExercise(){
  feedback.innerText = "";
  const ex = currentExercises[userData.exerciseIndex];
  questionEl.innerText = ex.question;
  optionsEl.innerHTML = "";
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

submitBtn.onclick = ()=>{
  const ex = currentExercises[userData.exerciseIndex];
  if(ex.type==="input"){
    checkAnswer(answerInput.value.trim());
  }
}

function checkAnswer(ans){
  const ex = currentExercises[userData.exerciseIndex];
  if(ans.toLowerCase() === ex.answer.toLowerCase()){
    feedback.innerText = `✔ Correct +10 XP`;
    userData.xp += 10;
    userData.streak += 1;
  } else {
    feedback.innerText = `❌ Wrong, try again!`;
    userData.streak = 0;
    return;
  }

  userData.exerciseIndex += 1;
  if(userData.exerciseIndex >= currentExercises.length){
    userData.week += 1;
    alert("🎉 You finished Week "+(userData.week-1)+"! Week "+userData.week+" unlocked!");
    loadWeek(userData.week);
  } else {
    setTimeout(showExercise,500);
  }

  xpDisplay.innerText = `XP: ${userData.xp}`;
  streakDisplay.innerText = `Streak: ${userData.streak}`;
  weekDisplay.innerText = `Week: ${userData.week}`;

  // Save progress
  db.collection("users").doc(currentUser.uid).set(userData);
  
  // Update progress bar
  progressFill.style.width = ((userData.exerciseIndex+1)/currentExercises.length)*100+"%";
}
