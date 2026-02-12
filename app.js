// ====== Firebase config ======
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

// ====== Course Skeleton + Week 1-4 Exercises ======
const course = [
  // WEEK 1
  {
    week:1, level:"A1", lesson:"Basics: Greetings, Present Tense, Simple Sentences",
    media:"https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3",
    exercises:[
      {id:1,type:"multiple",question:"Translate: Hello",options:["Hallo","Tschüss","Ja"],answer:0},
      {id:2,type:"multiple",question:"Translate: Bye",options:["Danke","Tschüss","Bitte"],answer:1},
      {id:3,type:"multiple",question:"Translate: Yes",options:["Ja","Nein","Bitte"],answer:0},
      {id:4,type:"multiple",question:"Translate: No",options:["Nein","Ja","Hallo"],answer:0},
      {id:5,type:"multiple",question:"Translate: Please",options:["Danke","Bitte","Tschüss"],answer:1},
      {id:6,type:"open",question:"Write: My name is Asaf.",answer:"Ich heiße Asaf."},
      {id:7,type:"open",question:"Write: How are you?",answer:"Wie geht's?"}
    ]
  },
  // WEEK 2
  {
    week:2, level:"A1", lesson:"Numbers, Family, Days of Week",
    media:"https://www.sample-videos.com/audio/mp3/wave.mp3",
    exercises:[
      {id:1,type:"multiple",question:"Translate: One",options:["Eins","Zwei","Drei"],answer:0},
      {id:2,type:"multiple",question:"Translate: Two",options:["Zwei","Eins","Drei"],answer:0},
      {id:3,type:"multiple",question:"Translate: Monday",options:["Montag","Dienstag","Mittwoch"],answer:0},
      {id:4,type:"open",question:"Write: My brother",answer:"Mein Bruder"},
      {id:5,type:"open",question:"Write: My sister",answer:"Meine Schwester"}
    ]
  },
  // WEEK 3
  {
    week:3, level:"A2", lesson:"Past tense, common verbs",
    media:"https://www.sample-videos.com/audio/mp3/india-national-anthem.mp3",
    exercises:[
      {id:1,type:"multiple",question:"Translate: I went",options:["Ich ging","Ich gehe","Ich gehe"],answer:0},
      {id:2,type:"open",question:"Write: He ate",answer:"Er aß"},
      {id:3,type:"open",question:"Write: We drank",answer:"Wir tranken"}
    ]
  },
  // WEEK 4
  {
    week:4, level:"A2", lesson:"Future tense, daily activities",
    media:"https://www.sample-videos.com/audio/mp3/rock.mp3",
    exercises:[
      {id:1,type:"multiple",question:"Translate: I will go",options:["Ich werde gehen","Ich gehe","Ich ging"],answer:0},
      {id:2,type:"open",question:"Write: She will eat",answer:"Sie wird essen"},
      {id:3,type:"open",question:"Write: They will drink",answer:"Sie werden trinken"}
    ]
  }
];

// ====== Global Variables ======
let userId=null, currentWeek=1, currentExerciseIndex=0, xp=0, streak=0;

// ====== UI Elements ======
const questionDiv=document.getElementById("question");
const optionsDiv=document.getElementById("options");
const answerInput=document.getElementById("answerInput");
const submitBtn=document.getElementById("submitBtn");
const feedbackDiv=document.getElementById("feedback");
const xpDisplay=document.getElementById("xpDisplay");
const streakDisplay=document.getElementById("streakDisplay");
const weekDisplay=document.getElementById("weekDisplay");
const audioPlayer=document.getElementById("audioPlayer");

// ====== Auth ======
auth.signInAnonymously().then(user=>{
  userId=user.uid;
  loadUserData();
});

// ====== Load User Data ======
function loadUserData(){
  db.collection("users").doc(userId).get().then(doc=>{
    if(doc.exists){
      const data=doc.data();
      currentWeek=data.currentWeek||1;
      xp=data.xp||0;
      streak=data.streak||0;
      currentExerciseIndex=data.currentExerciseIndex||0;
    } else {
      db.collection("users").doc(userId).set({
        currentWeek:1, xp:0, streak:0, currentExerciseIndex:0
      });
    }
    updateUI();
    loadExercise();
    loadMedia();
  });
}

// ====== Update UI ======
function updateUI(){
  xpDisplay.textContent="XP: "+xp;
  streakDisplay.textContent="Streak: "+streak;
  weekDisplay.textContent="Week: "+currentWeek;
}

// ====== Load Exercise ======
function loadExercise(){
  const weekData=course.find(w=>w.week===currentWeek);
  if(!weekData){ questionDiv.textContent="Course complete!"; optionsDiv.innerHTML=""; answerInput.style.display="none"; return; }

  const ex=weekData.exercises[currentExerciseIndex];
  questionDiv.textContent=ex.question;
  optionsDiv.innerHTML="";
  answerInput.style.display=ex.type==="open"?"block":"none";
  answerInput.value="";

  if(ex.type==="multiple"){
    ex.options.forEach((opt,idx)=>{
      const btn=document.createElement("button");
      btn.textContent=opt;
      btn.onclick=()=>checkAnswer(idx);
      optionsDiv.appendChild(btn);
    });
  }
}

// ====== Check Answer ======
function checkAnswer(ans){
  const weekData=course.find(w=>w.week===currentWeek);
  const ex=weekData.exercises[currentExerciseIndex];
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

  updateUI();
  saveUserData(correct);

  if(correct){
    setTimeout(()=>{
      feedbackDiv.textContent="";
      currentExerciseIndex++;
      if(currentExerciseIndex>=weekData.exercises.length){
        currentWeek++;
        currentExerciseIndex=0;
        loadMedia();
      }
      updateUI();
      loadExercise();
    },1500);
  }
}

// ====== Save User Data ======
function saveUserData(correct){
  db.collection("users").doc(userId).set({
    currentWeek: currentWeek,
    xp: xp,
    streak: streak,
    currentExerciseIndex: currentExerciseIndex
  });
}

// ====== Load Media ======
function loadMedia(){
  const weekData=course.find(w=>w.week===currentWeek);
  if(weekData) audioPlayer.src=weekData.media;
}
