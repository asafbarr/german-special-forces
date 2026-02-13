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
  questionOrder:{}, // 👈 now stored per week
  mode:"words"
};

/* =========================
   WEEK CONTENT STRUCTURE
========================= */

const weeks = {

1: {
  words: generateWeek1Words(),
  open: [
    "Write a short greeting dialogue.",
    "Introduce yourself in 3 German sentences.",
    "Write a goodbye conversation.",
    "Write a sentence using Guten Morgen.",
    "Write a sentence using Danke and Bitte."
  ],
  audio: ["","",""]
},

2: {
  words: [],   // ready for future content
  open: [],
  audio: ["","",""]
},

3: {
  words: [],
  open: [],
  audio: ["","",""]
}

};

/* =========================
   GENERATE 50 QUESTIONS
========================= */

function generateWeek1Words(){

const base = [
["Hello","Hallo"],
["Goodbye","Tschüss"],
["Thank you","Danke"],
["Please","Bitte"],
["Yes","Ja"],
["No","Nein"],
["Good morning","Guten Morgen"],
["Good night","Gute Nacht"],
["Water","Wasser"],
["Bread","Brot"],
["Milk","Milch"],
["Coffee","Kaffee"],
["Tea","Tee"],
["Mother","Mutter"],
["Father","Vater"],
["Brother","Bruder"],
["Sister","Schwester"],
["Friend","Freund"],
["School","Schule"],
["Office","Büro"],
["City","Stadt"],
["Country","Land"],
["Train","Zug"],
["Today","Heute"],
["Tomorrow","Morgen"],
["Yesterday","Gestern"]
];

let questions=[];

for(let i=0;i<50;i++){

const pair = base[i % base.length];

const wrong1 = base[(i+3)%base.length][1];
const wrong2 = base[(i+5)%base.length][1];

questions.push({
  q: pair[0],
  a: shuffle([pair[1],wrong1,wrong2]),
  correct: null
});

}

questions.forEach(q=>{
q.correct = q.a.indexOf(base.find(p=>p[0]===q.q)[1]);
});

return questions;
}

/* =========================
   LOGIN
========================= */

document.getElementById("loginBtn").onclick = async ()=>{

const username=document.getElementById("username").value.trim().toLowerCase();
if(!username) return alert("Enter username");

currentUser=username;

const ref=doc(db,"users",currentUser);
const snap=await getDoc(ref);

if(snap.exists()){
userData=snap.data();
}else{
await setDoc(ref,userData);
}

if(!userData.questionOrder[userData.currentWeek]){
userData.questionOrder[userData.currentWeek] =
shuffle([...Array(weeks[userData.currentWeek].words.length).keys()]);
}

document.getElementById("login").style.display="none";
document.getElementById("dashboard").style.display="block";
document.getElementById("sidebar").style.display="block";

renderSidebar();
updateStats();
renderContent();
};

/* =========================
   SHUFFLE
========================= */

function shuffle(array){
for(let i=array.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];
}
return array;
}

/* =========================
   SIDEBAR
========================= */

function renderSidebar(){

const sidebar=document.getElementById("sidebar");
sidebar.innerHTML="";

for(let i=1;i<=3;i++){

const weekTab=document.createElement("div");
weekTab.className="week-tab";
weekTab.innerText="Week "+i;

if(i===userData.currentWeek)
weekTab.classList.add("week-active");

if(userData.completedWeeks.includes(i))
weekTab.classList.add("week-completed");

weekTab.onclick=()=>selectWeek(i);

sidebar.appendChild(weekTab);

if(i===userData.currentWeek){

["Words","Open Questions","Audio"].forEach(mode=>{
const sub=document.createElement("div");
sub.style.marginLeft="10px";
sub.style.padding="6px";
sub.style.cursor="pointer";
sub.innerText=mode;
sub.onclick=()=>switchMode(mode.toLowerCase());
sidebar.appendChild(sub);
});
}
}
}

/* =========================
   WEEK SELECT
========================= */

function selectWeek(week){
userData.currentWeek=week;
userData.exerciseIndex=0;
renderSidebar();
renderContent();
}

/* =========================
   MODE SWITCH
========================= */

function switchMode(mode){
userData.mode=mode;
userData.exerciseIndex=0;
renderContent();
}

/* =========================
   STATS
========================= */

function updateStats(){
document.getElementById("xp").innerText="XP: "+userData.xp;
document.getElementById("streak").innerText="Streak: "+userData.streak;
document.getElementById("weekDisplay").innerText="Week "+userData.currentWeek;
}

/* =========================
   RENDER CONTENT
========================= */

function renderContent(){

if(userData.mode==="words") renderWords();
if(userData.mode==="open questions") renderOpen();
if(userData.mode==="audio") renderAudio();
}

/* =========================
   WORD MODE
========================= */

function renderWords(){

const exDiv=document.getElementById("exercise");
const feedback=document.getElementById("feedback");
feedback.innerText="";
feedback.className="feedback";

const week=weeks[userData.currentWeek];
if(!week.words.length){
exDiv.innerHTML="<h3>No content yet.</h3>";
return;
}

if(userData.exerciseIndex>=week.words.length){
exDiv.innerHTML="<h2>🎉 Completed!</h2>";
return;
}

const order=userData.questionOrder[userData.currentWeek];
const index=order[userData.exerciseIndex];
const current=week.words[index];

exDiv.innerHTML="<h3>"+current.q+"</h3>";

current.a.forEach((answer,i)=>{
const btn=document.createElement("button");
btn.className="answer-btn";
btn.innerText=answer;
btn.onclick=()=>checkAnswer(i,current.correct);
exDiv.appendChild(btn);
});
}

/* =========================
   OPEN MODE
========================= */

function renderOpen(){

const exDiv=document.getElementById("exercise");
const week=weeks[userData.currentWeek];

if(!week.open.length){
exDiv.innerHTML="<h3>No open questions yet.</h3>";
return;
}

const random=week.open[Math.floor(Math.random()*week.open.length)];

exDiv.innerHTML=`
<h3>${random}</h3>
<textarea style="width:100%;height:120px;"></textarea>
`;
}

/* =========================
   AUDIO MODE
========================= */

function renderAudio(){

const exDiv=document.getElementById("exercise");
exDiv.innerHTML="<h3>Audio coming soon...</h3>";
}

/* =========================
   CHECK ANSWER
========================= */

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
setTimeout(()=>renderContent(),800);

}else{

feedback.innerText="❌ Wrong. Try again.";
feedback.classList.add("wrong");

userData.streak=0;
updateStats();
}
}
