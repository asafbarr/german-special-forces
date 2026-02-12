// Firebase config
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

// Week 1 Exercises (50 mixed, same as before)
const week1Exercises = [ /* same 50 exercises as before */ ];

// Bonus audio playlist
const audioClips = [
  "https://www.freesound.org/data/previews/341/341695_3248244-lq.mp3",
  "https://www.freesound.org/data/previews/256/256113_4486188-lq.mp3",
  "https://www.freesound.org/data/previews/415/415209_5121236-lq.mp3"
];

let username = "";
let userData = {xp:0, streak:0, week:1, exerciseIndex:0};
let currentExercises = [];

// LOGIN HANDLER
loginBtn.onclick = async ()=>{
  if(!usernameInput.value.trim()) return alert("Enter a username!");
  username = usernameInput.value.trim().toLowerCase(); // case-insensitive
  const userRef = db.collection("users").doc(username);
  const doc = await userRef.get();
  if(doc.exists){
    userData = doc.data();
  } else {
    await userRef.set(userData); // create new user
  }
  loginScreen.style.display="none";
  appScreen.style.display="flex";
  startApp();
}

// START APP
function startApp(){
  weekDisplay.innerText = `Week: ${userData.week}`;
  xpDisplay.innerText = `XP: ${userData.xp}`;
  streakDisplay.innerText = `Streak: ${userData.streak}`;
  
  // Sidebar
  weeksList.innerHTML = "";
  for(let i=1;i<=10;i++){
    const li = document.createElement("li");
    li.innerText = `Week ${i}`;
    if(i>userData.week) li.classList.add("locked");
    li.addEventListener("click",()=>{if(i<=userData.week) loadWeek(i)});
    weeksList.appendChild(li);
  }

  loadWeek(userData.week);
  audioPlayer.src = audioClips[Math.floor(Math.random()*audioClips.length)];
  audioPlayer.play().catch(()=>{});
}

function loadWeek(week){
  currentExercises = [...week1Exercises].sort(()=>Math.random()-0.5);
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
  if(ans.toLowerCase()===ex.answer.toLowerCase()){
    feedback.innerText = `✔ Correct +10 XP`;
    userData.xp += 10;
    userData.streak += 1;
  } else {
    feedback.innerText = `❌ Wrong, try again!`;
    userData.streak = 0;
    return;
  }

  userData.exerciseIndex += 1;
  if(userData.exerciseIndex>=currentExercises.length){
    userData.week += 1;
    alert(`🎉 You finished Week ${userData.week-1}! Week ${userData.week} unlocked!`);
    loadWeek(userData.week);
  } else {
    setTimeout(showExercise,300);
  }

  xpDisplay.innerText = `XP: ${userData.xp}`;
  streakDisplay.innerText = `Streak: ${userData.streak}`;
  weekDisplay.innerText = `Week: ${userData.week}`;

  // Save progress
  db.collection("users").doc(username).set(userData);
  progressFill.style.width = ((userData.exerciseIndex+1)/currentExercises.length)*100+"%";
}
