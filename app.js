import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:"YOUR_API_KEY",
  authDomain:"german-special-forces.firebaseapp.com",
  projectId:"german-special-forces"
};

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);

let currentUser;

let userData={
  xp:0,
  streak:0,
  currentWeek:1,
  completedWeeks:[],
  exerciseIndex:0,
  questionOrder:[]
};

/* ===== 50 REAL QUESTIONS ===== */

const exercisesWeek1=[

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

];

/* ===== LOGIN ===== */

document.getElementById("loginBtn").onclick=async()=>{

const username=document.getElementById("username").value.trim().toLowerCase();
if(!username)return alert("Enter username");

currentUser=username;

const ref=doc(db,"users",currentUser);
const snap=await getDoc(ref);

if(snap.exists()){
userData=snap.data();
}else{
userData.questionOrder=shuffle([...Array(exercisesWeek1.length).keys()]);
await setDoc(ref,userData);
}

if(!userData.questionOrder || userData.questionOrder.length===0){
userData.questionOrder=shuffle([...Array(exercisesWeek1.length).keys()]);
}

document.getElementById("login").style.display="none";
document.getElementById("dashboard").style.display="block";
document.getElementById("sidebar").style.display="block"; // 👈 show sidebar after login

renderSidebar();
updateStats();
renderExercise();
};

/* ===== SHUFFLE ===== */

function shuffle(array){
for(let i=array.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];
}
return array;
}

/* ===== SIDEBAR ===== */

function renderSidebar(){
const sidebar=document.getElementById("sidebar");
sidebar.innerHTML="";

for(let i=1;i<=3;i++){

const tab=document.createElement("div");
tab.className="week-tab";
tab.innerText="Week "+i;

if(i===userData.currentWeek){
tab.classList.add("week-active");
}
if(userData.completedWeeks.includes(i)){
tab.classList.add("week-completed");
}

sidebar.appendChild(tab);
}
}

/* ===== STATS ===== */

function updateStats(){
document.getElementById("xp").innerText="XP: "+userData.xp;
document.getElementById("streak").innerText="Streak: "+userData.streak;
document.getElementById("weekDisplay").innerText="Week "+userData.currentWeek;

const percent=(userData.exerciseIndex/exercisesWeek1.length)*100;
document.getElementById("progressBar").style.width=percent+"%";
}

/* ===== EXERCISE ===== */

function renderExercise(){

const exDiv=document.getElementById("exercise");
const feedback=document.getElementById("feedback");
feedback.innerText="";
feedback.className="feedback";

if(userData.exerciseIndex>=exercisesWeek1.length){

exDiv.innerHTML="<h2>🎉 Week Completed!</h2>";

if(!userData.completedWeeks.includes(1)){
userData.completedWeeks.push(1);
setDoc(doc(db,"users",currentUser),userData);
renderSidebar();
}

return;
}

const questionIndex=userData.questionOrder[userData.exerciseIndex];
const current=exercisesWeek1[questionIndex];

exDiv.innerHTML="<h3>"+current.q+"</h3>";

current.a.forEach((answer,index)=>{
const btn=document.createElement("button");
btn.className="answer-btn";
btn.innerText=answer;
btn.onclick=()=>checkAnswer(index,current.correct);
exDiv.appendChild(btn);
});
}

/* ===== CHECK ANSWER ===== */

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
