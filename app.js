import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:"YOUR_API_KEY",
  authDomain:"german-special-forces.firebaseapp.com",
  projectId:"german-special-forces"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser;

let userData = {
  xp:0,
  streak:0,
  currentWeek:1,
  completedWeeks:[],
  exerciseIndex:0,
  questionOrder:[],
  mode:"words"
};

/* =======================
   WEEK 1 WORD QUESTIONS
======================= */

const exercisesWeek1 = [
{q:"Hello",a:["Hallo","Tschüss","Danke"],correct:0},
{q:"Goodbye",a:["Bitte","Tschüss","Ja"],correct:1},
{q:"Thank you",a:["Danke","Nein","Hallo"],correct:0},
{q:"Please",a:["Bitte","Danke","Hallo"],correct:0},
{q:"Yes",a:["Nein","Ja","Bitte"],correct:1},
{q:"No",a:["Ja","Nein","Hallo"],correct:1},
{q:"Good morning",a:["Guten Morgen","Gute Nacht","Hallo"],correct:0},
{q:"Good night",a:["Guten Tag","Gute Nacht","Danke"],correct:1},
{q:"How are you?",a:["Wie geht's?","Wo bist du?","Was ist das?"],correct:0},
{q:"I am fine",a:["Ich bin gut","Ich bin traurig","Ich bin müde"],correct:0}
];

/* =======================
   OPEN QUESTIONS
======================= */

const openQuestionsWeek1 = [
"Write a short greeting conversation in German.",
"Write 3 sentences introducing yourself in German.",
"Create a short dialogue between two friends meeting.",
"Write a sentence using Guten Morgen.",
"Write a sentence using Danke and Bitte."
];

/* =======================
   LOGIN
======================= */

document.getElementById("loginBtn").onclick = async () => {

  const username = document.getElementById("username").value.trim().toLowerCase();
  if(!username) return alert("Enter username");

  currentUser = username;

  const ref = doc(db,"users",currentUser);
  const snap = await getDoc(ref);

  if(snap.exists()){
    userData = snap.data();
  } else {
    userData.questionOrder = shuffle([...Array(exercisesWeek1.length).keys()]);
    await setDoc(ref,userData);
  }

  document.getElementById("login").style.display="none";
  document.getElementById("dashboard").style.display="block";
  document.getElementById("sidebar").style.display="block";

  renderSidebar();
  updateStats();
  renderExercise();
};

/* =======================
   SHUFFLE
======================= */

function shuffle(array){
for(let i=array.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];
}
return array;
}

/* =======================
   SIDEBAR WITH FOLDERS
======================= */

function renderSidebar(){
const sidebar=document.getElementById("sidebar");
sidebar.innerHTML="";

for(let i=1;i<=3;i++){

const week=document.createElement("div");
week.className="week-tab";
week.innerText="Week "+i;

if(i===userData.currentWeek){
week.classList.add("week-active");
}

if(userData.completedWeeks.includes(i)){
week.classList.add("week-completed");
}

week.onclick=()=>toggleWeekMenu(i);

sidebar.appendChild(week);

/* Sub menu */
if(i===userData.currentWeek){

const subMenu=document.createElement("div");
subMenu.style.marginLeft="10px";

["Words","Open Questions","Audio"].forEach(option=>{

const sub=document.createElement("div");
sub.style.padding="8px";
sub.style.cursor="pointer";
sub.innerText=option;

sub.onclick=()=>switchMode(option.toLowerCase());

subMenu.appendChild(sub);

});

sidebar.appendChild(subMenu);
}
}
}

/* =======================
   SWITCH MODE
======================= */

function switchMode(mode){

userData.mode=mode;
userData.exerciseIndex=0;

if(mode==="words"){
if(!userData.questionOrder || userData.questionOrder.length===0){
userData.questionOrder=shuffle([...Array(exercisesWeek1.length).keys()]);
}
}

renderExercise();
}

/* =======================
   STATS
======================= */

function updateStats(){
document.getElementById("xp").innerText="XP: "+userData.xp;
document.getElementById("streak").innerText="Streak: "+userData.streak;
document.getElementById("weekDisplay").innerText="Week "+userData.currentWeek;
}

/* =======================
   RENDER CONTENT
======================= */

function renderExercise(){

const exDiv=document.getElementById("exercise");
const feedback=document.getElementById("feedback");
feedback.innerText="";
feedback.className="feedback";

if(userData.mode==="words"){
renderWordExercise();
}
else if(userData.mode==="open questions"){
renderOpenQuestion();
}
else if(userData.mode==="audio"){
renderAudioSection();
}
}

/* =======================
   WORD MODE
======================= */

function renderWordExercise(){

const exDiv=document.getElementById("exercise");

if(userData.exerciseIndex>=exercisesWeek1.length){
exDiv.innerHTML="<h2>🎉 Words Completed!</h2>";
return;
}

const index=userData.questionOrder[userData.exerciseIndex];
const current=exercisesWeek1[index];

exDiv.innerHTML="<h3>"+current.q+"</h3>";

current.a.forEach((answer,i)=>{
const btn=document.createElement("button");
btn.className="answer-btn";
btn.innerText=answer;
btn.onclick=()=>checkAnswer(i,current.correct);
exDiv.appendChild(btn);
});
}

/* =======================
   OPEN QUESTIONS MODE
======================= */

function renderOpenQuestion(){

const exDiv=document.getElementById("exercise");

const random=openQuestionsWeek1[Math.floor(Math.random()*openQuestionsWeek1.length)];

exDiv.innerHTML=`
<h3>${random}</h3>
<textarea style="width:100%;height:120px;margin-top:15px;"></textarea>
<br><br>
<button class="primary-btn">Submit</button>
`;

}

/* =======================
   AUDIO MODE
======================= */

function renderAudioSection(){

const exDiv=document.getElementById("exercise");

exDiv.innerHTML=`
<h3>Audio Lessons</h3>

<p>Audio 1</p>
<audio controls>
<source src="" type="audio/mpeg">
</audio>

<p>Audio 2</p>
<audio controls>
<source src="" type="audio/mpeg">
</audio>

<p>Audio 3</p>
<audio controls>
<source src="" type="audio/mpeg">
</audio>
`;

}

/* =======================
   CHECK ANSWER
======================= */

async function checkAnswer(selected,correct){

const feedback=document.getElementById("feedback");

if(selected===correct){

feedback.innerText="✅ Correct!";
feedback.classList.add("correct");

userData.xp+=10;
userData.streak+=1;
userData.exerciseIndex++;

await setDoc(doc(db,"users",currentUser),userData);

updateStats();

setTimeout(()=>renderExercise(),800);

}else{

feedback.innerText="❌ Wrong. Try again.";
feedback.classList.add("wrong");

userData.streak=0;
updateStats();
}
}

/* =======================
   TOGGLE WEEK MENU
======================= */

function toggleWeekMenu(week){
userData.currentWeek=week;
renderSidebar();
renderExercise();
}
