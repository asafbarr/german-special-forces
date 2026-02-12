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

// ====== Course Skeleton (Week 1-4 example) ======
const course = [
  {week:1,level:"A1",lesson:"Basics: Greetings, Present Tense, Simple Sentences",
   media:"https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
   exercises:[
     {id:1,type:"multiple",question:"Translate: Hello",options:["Hallo","Tschüss","Ja"],answer:0},
     {id:2,type:"multiple",question:"Translate: Bye",options:["Danke","Tschüss","Bitte"],answer:1},
     {id:3,type:"multiple",question:"Translate: Yes",options:["Ja","Nein","Bitte"],answer:0},
     {id:4,type:"open",question:"Write: My name is Asaf.",answer:"Ich heiße Asaf."}
   ]},
  {week:2,level:"A1",lesson:"Numbers, Family, Days of Week",
   media:"https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
   exercises:[
     {id:1,type:"multiple",question:"Translate: One",options:["Eins","Zwei","Drei"],answer:0},
     {id:2,type:"multiple",question:"Translate: Two",options:["Zwei","Eins","Drei"],answer:0},
     {id:3,type:"open",question:"Write: My brother",answer:"Mein Bruder"}
   ]},
  {week:3,level:"A2",lesson:"Past tense, common verbs",
   media:"https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
   exercises:[
     {id:1,type:"multiple",question:"Translate: I went",options:["Ich ging","Ich gehe","Ich gehe"],answer:0},
     {id:2,type:"open",question:"Write: He ate",answer:"Er aß"}
   ]},
  {week:4,level:"A2",lesson:"Future tense, daily activities",
   media:"https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
   exercises:[
     {id:1,type:"multiple",question:"Translate: I will go",options:["Ich werde gehen","Ich gehe","Ich ging"],answer:0},
     {id:2,type:"open",question:"Write: She will eat",answer:"Sie wird essen"}
   ]}
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
    renderWeeksList();
    loadExercise();
    loadMedia();
  });
}

// ====== Update UI ======
function updateUI(){
  xpDisplay.textContent="XP: "+xp;
  streakDisplay.textContent="Streak: "+streak;
  weekDisplay.textContent="Week: "+currentWeek;
  updateProgressBar();
}

// ====== Render Weeks Sidebar ======
function renderWeeksList(){
  const list=document.getElementById("weeksList");
  list.innerHTML="";
  course.forEach(week=>{
    const li=document.createElement("li");
    li.textContent=`Week ${week.week}: ${week.lesson}`;
    li.style.cursor="pointer";

    if(week.week > currentWeek) {
      li.style.opacity=0.4;
      li.onclick=()=>alert("Finish previous weeks first!");
    } else {
      li.onclick=()=>{
        currentWeek=week.week;
        currentExerciseIndex=0;
        updateUI();
        loadExercise();
        loadMedia();
      };
    }

    if(week.week < currentWeek) li.textContent+=" ✅";

    list.appendChild(li);
  });
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
        renderWeeksList();
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
  if(weekData){
    audioPlayer.src=weekData.media;
    audioPlayer.load();
  }
}

// ====== Progress Bar ======
function updateProgressBar(){
  const weekData=course.find(w=>w.week===currentWeek);
  const progress = (currentExerciseIndex/weekData.exercises.length)*100;
  document.getElementById("progressFill").style.width = progress + "%";
}

// ====== Submit Button for Open-ended ======
submitBtn.onclick = () => {
  const weekData=course.find(w=>w.week===currentWeek);
  const ex=weekData.exercises[currentExerciseIndex];
  if(ex.type==="open") checkAnswer(null);
}
