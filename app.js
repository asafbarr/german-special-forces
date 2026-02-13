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
  questionOrder:{},
  mode:"words"
};

/* =====================
   WEEK STRUCTURE
===================== */

const weeks = {

1:{
  words: generateWeek1Words(),
  open:[
    {q:"Say in German: I like books",a:"ich mag bücher"},
    {q:"Say in German: Good morning my friend",a:"guten morgen mein freund"},
    {q:"Say in German: Thank you very much",a:"vielen dank"},
    {q:"Say in German: I am from Germany",a:"ich komme aus deutschland"},
    {q:"Say in German: I drink water",a:"ich trinke wasser"}
  ]
},

2:{words:[],open:[]},
3:{words:[],open:[]}

};

/* =====================
   GENERATE 50 WORDS
===================== */

function generateWeek1Words(){

const base=[
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
["Tomorrow","Morgen"]
];

let questions=[];

for(let i=0;i<50;i++){

const pair=base[i%base.length];
const wrong1=base[(i+3)%base.length][1];
const wrong2=base[(i+6)%base.length][1];

let answers=shuffle([pair[1],wrong1,wrong2]);

questions.push({
  q:pair[0],
  a:answers,
  correct:answers.indexOf(pair[1])
});
}

return questions;
}

/* =====================
   LOGIN
===================== */

document.getElementById("loginBtn").onclick=async()=>{

const username=document.getElementById("username").value.trim().toLowerCase();
if(!username)return alert("Enter username");

currentUser=username;

const ref=doc(db,"users",currentUser);
const snap=await getDoc(ref);

if(snap.exists()){
userData=snap.data();
}else{
await setDoc(ref,userData);
}

if(!userData.questionOrder[userData.currentWeek]){
userData.questionOrder[userData.currentWeek]=
shuffle([...Array(weeks[userData.currentWeek].words.length).keys()]);
}

document.getElementById("login").style.display="none";
document.getElementById("dashboard").style.display="block";
document.getElementById("sidebar").style.display="block";

renderSidebar();
updateStats();
renderContent();
};

/* =====================
   SHUFFLE
===================== */

function shuffle(arr){
for(let i=arr.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[arr[i],arr[j]]=[arr[j],arr[i]];
}
return arr;
}

/* =====================
   SIDEBAR
===================== */

function renderSidebar(){

const sidebar=document.getElementById("sidebar");
sidebar.innerHTML="";

for(let i=1;i<=3;i++){

const weekTab=document.createElement("div");
weekTab.className="week-tab";
weekTab.innerText="Week "+i;

if(i===userData.currentWeek)
weekTab.classList.add("week-active");

weekTab.onclick=()=>selectWeek(i);

sidebar.appendChild(weekTab);

if(i===userData.currentWeek){

["Words","Open Questions"].forEach(mode=>{
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

/* =====================
   SELECT WEEK
===================== */

function selectWeek(week){
userData.currentWeek=week;
userData.exerciseIndex=0;
renderSidebar();
renderContent();
}

/* =====================
   SWITCH MODE
===================== */

function switchMode(mode){
userData.mode=mode;
userData.exerciseIndex=0;
renderContent(); // 🔥 force render
}

/* =====================
   STATS
===================== */

function updateStats(){
document.getElementById("xp").innerText="XP: "+userData.xp;
document.getElementById("streak").innerText="Streak: "+userData.streak;
document.getElementById("weekDisplay").innerText="Week "+userData.currentWeek;
}

/* =====================
   RENDER CONTENT
===================== */

function renderContent(){

if(userData.mode==="words") renderWords();
if(userData.mode==="open questions") renderOpen();
}

/* =====================
   WORD MODE
===================== */

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

const order=userData.questionOrder[userData.currentWeek];
const index=order[userData.exerciseIndex];
const current=week.words[index];

exDiv.innerHTML="<h3>"+current.q+"</h3>";

current.a.forEach((answer,i)=>{
const btn=document.createElement("button");
btn.className="answer-btn";
btn.innerText=answer;
btn.onclick=()=>checkWordAnswer(i,current.correct);
exDiv.appendChild(btn);
});
}

/* =====================
   CHECK WORD ANSWER
===================== */

async function checkWordAnswer(selected,correct){

const feedback=document.getElementById("feedback");

if(selected===correct){

feedback.innerText="✅ Correct!";
feedback.classList.add("correct");

userData.xp+=10;
userData.streak++;
userData.exerciseIndex++;

await setDoc(doc(db,"users",currentUser),userData);
updateStats();

setTimeout(()=>renderWords(),700);

}else{

feedback.innerText="❌ Wrong. Try again.";
feedback.classList.add("wrong");

userData.streak=0;
updateStats();
}
}

/* =====================
   OPEN MODE
===================== */

function renderOpen(){

const exDiv=document.getElementById("exercise");
const feedback=document.getElementById("feedback");
feedback.innerText="";
feedback.className="feedback";

const week=weeks[userData.currentWeek];
if(!week.open.length){
exDiv.innerHTML="<h3>No open questions yet.</h3>";
return;
}

const random=week.open[Math.floor(Math.random()*week.open.length)];

exDiv.innerHTML=`
<h3>${random.q}</h3>
<input id="openAnswer" style="width:100%;padding:10px;">
<br><br>
<button class="primary-btn" id="checkOpen">Check</button>
`;

document.getElementById("checkOpen").onclick=()=>{

const userInput=document.getElementById("openAnswer").value.trim().toLowerCase();

if(userInput===random.a){

feedback.innerText="✅ Correct! +15 XP";
feedback.classList.add("correct");

userData.xp+=15;
userData.streak++;

setDoc(doc(db,"users",currentUser),userData);
updateStats();

}else{

feedback.innerText="❌ Wrong. Correct answer: "+random.a;
feedback.classList.add("wrong");

userData.streak=0;
updateStats();
}
};
}
