// ===== Firebase config =====
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
const auth = firebase.auth();

// ===== Course Data (Week 1 only, you can expand) =====
const course = [
  {week:1, lesson:"Greetings & Basics", media:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
   exercises:[
     {type:"multiple", question:"Hello", options:["Hallo","Tschüss","Ja"], answer:0},
     {type:"multiple", question:"Bye", options:["Danke","Tschüss","Bitte"], answer:1},
     {type:"multiple", question:"Yes", options:["Ja","Nein","Bitte"], answer:0},
     {type:"open", question:"Write: My name is Asaf.", answer:"Ich heiße Asaf."},
     {type:"open", question:"Write: I am happy.", answer:"Ich bin glücklich."}
   ]},
  {week:2, lesson:"Numbers & Family", media:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
   exercises:[
     {type:"multiple", question:"One", options:["Eins","Zwei","Drei"], answer:0},
     {type:"multiple", question:"Two", options:["Zwei","Eins","Drei"], answer:0},
     {type:"open", question:"Write: My brother", answer:"Mein Bruder"}
   ]}
];

// ===== Global Variables =====
let userId=null, currentWeek=1, currentExerciseIndex=0, xp=0, streak=0;

// ===== UI Elements =====
const questionDiv=document.getElementById("question");
const optionsDiv=document.getElementById("options");
const answerInput=document.getElementById("answerInput");
const submitBtn=document.getElementById("submitBtn");
const feedbackDiv=document.getElementById("feedback");
const xpDisplay=document.getElementById("xpDisplay");
const streakDisplay=document.getElementById("streakDisplay");
const weekDisplay=document.getElementById("weekDisplay");
const audioPlayer=document.getElementById("audioPlayer");

// ===== Auth =====
auth.signInAnonymously().then(user=>{
  userId=user.uid;
  initUser();
});

function initUser(){
  const userRef = db.collection("users").doc(userId);
  userRef.get().then(doc=>{
    if(doc.exists){
      const data = doc.data();
      currentWeek = data.currentWeek || 1;
      currentExerciseIndex = data.currentExerciseIndex || 0;
      xp = data.xp || 0;
      streak = data.streak || 0;
      initUI();
    } else {
      userRef.set({currentWeek:1,currentExerciseIndex:0,xp:0,streak:0})
        .then(()=> initUser());
    }
  });
}

// ===== Initialize UI =====
function initUI(){
  updateStats();
  renderWeeks();
  loadExercise();
  loadMedia();
}

// ===== Update Stats =====
function updateStats(){
  xpDisplay.textContent="XP: "+xp;
  streakDisplay.textContent="Streak: "+streak;
  weekDisplay.textContent="Week: "+currentWeek;
  updateProgressBar();
}

// ===== Render Weeks Sidebar =====
function renderWeeks(){
  const list = document.getElementById("weeksList");
  list.innerHTML="";
  course.forEach(w=>{
    const li=document.createElement("li");
    li.textContent=`Week ${w.week}: ${w.lesson}`;
    if(w.week>currentWeek) li.classList.add("locked");
    else li.onclick = ()=>{
      currentWeek=w.week;
      currentExerciseIndex=0;
      updateStats();
      loadExercise();
      loadMedia();
    };
    if(w.week<currentWeek) li.textContent+=" ✅";
    list.appendChild(li);
  });
}

// ===== Load Exercise =====
function loadExercise(){
  const weekData = course.find(w=>w.week===currentWeek);
  if(!weekData){ questionDiv.textContent="Course Complete!"; optionsDiv.innerHTML=""; answerInput.style.display="none"; return;}
  const ex = weekData.exercises[currentExerciseIndex];
  questionDiv.textContent=ex.question;
  optionsDiv.innerHTML="";
  answerInput.style.display=ex.type==="open"?"block":"none";
  answerInput.value="";

  if(ex.type==="multiple"){
    ex.options.forEach((opt,idx)=>{
      const btn = document.createElement("button");
      btn.textContent=opt;
      btn.classList.add("optionBtn");
      btn.onclick = ()=> checkAnswer(idx);
      optionsDiv.appendChild(btn);
    });
  }
}

// ===== Check Answer =====
function checkAnswer(ans){
  const weekData = course.find(w=>w.week===currentWeek);
  const ex = weekData.exercises[currentExerciseIndex];
  let correct=false;
  if(ex.type==="multiple" && ans===ex.answer) correct=true;
  if(ex.type==="open" && answerInput.value.trim().toLowerCase()===ex.answer.toLowerCase()) correct=true;

  if(correct){
    feedbackDiv.textContent="✅ Correct! +10 XP";
    xp+=10;
    streak+=1;
  } else {
    feedbackDiv.textContent="❌ Wrong, try again!";
  }

  saveUser();
  updateStats();

  if(correct){
    setTimeout(()=>{
      feedbackDiv.textContent="";
      currentExerciseIndex++;
      if(currentExerciseIndex>=weekData.exercises.length){
        currentWeek++;
        currentExerciseIndex=0;
        loadMedia();
        renderWeeks();
      }
      loadExercise();
    },1200);
  }
}

// ===== Save User =====
function saveUser(){
  db.collection("users").doc(userId).set({
    currentWeek,
    currentExerciseIndex,
    xp,
    streak
  });
}

// ===== Load Media =====
function loadMedia(){
  const weekData = course.find(w=>w.week===currentWeek);
  if(weekData){
    audioPlayer.src=weekData.media;
    audioPlayer.load();
  }
}

// ===== Progress Bar =====
function updateProgressBar(){
  const weekData = course.find(w=>w.week===currentWeek);
  const progress = (currentExerciseIndex/weekData.exercises.length)*100;
  document.getElementById("progressFill").style.width = progress+"%";
}

// ===== Submit Button for open-ended =====
submitBtn.onclick = () => {
  const weekData = course.find(w=>w.week===currentWeek);
  if(!weekData) return;
  const ex = weekData.exercises[currentExerciseIndex];
  if(ex.type==="open") checkAnswer(null);
};
