import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWAkeJhwzxwdKsbCKavOu9C-pZIZENftI",
  authDomain: "german-special-forces.firebaseapp.com",
  projectId: "german-special-forces"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser;
let userData = { xp:0, streak:0, exerciseIndex:0 };

const exercisesWeek1 = Array.from({length:50}, (_,i)=>({
  q:`Translate to German: Hello (${i+1})`,
  a:["Hallo","Tschüss","Danke"],
  correct:0
}));

const loginBtn = document.getElementById("loginBtn");
const loginDiv = document.getElementById("login");
const dashboard = document.getElementById("dashboard");

loginBtn.onclick = async () => {

  const username = document.getElementById("username").value.trim().toLowerCase();
  if(!username) return alert("Enter username");

  currentUser = username;

  const ref = doc(db,"users",currentUser);
  const snap = await getDoc(ref);

  if(snap.exists()){
    userData = snap.data();
  } else {
    await setDoc(ref,userData);
  }

  loginDiv.style.display="none";
  dashboard.style.display="block";

  updateStats();
  renderExercise();
};

function updateStats(){
  document.getElementById("xp").innerText="XP: "+userData.xp;
  document.getElementById("streak").innerText="Streak: "+userData.streak;
  updateProgress();
}

function updateProgress(){
  const percent=(userData.exerciseIndex/exercisesWeek1.length)*100;
  document.getElementById("progressBar").style.width=percent+"%";
}

function renderExercise(){

  const exDiv=document.getElementById("exercise");
  const feedback=document.getElementById("feedback");
  feedback.innerText="";
  feedback.className="feedback";

  if(userData.exerciseIndex>=exercisesWeek1.length){
    exDiv.innerHTML="<h2>🎉 Week Completed!</h2>";
    return;
  }

  const current=exercisesWeek1[userData.exerciseIndex];

  exDiv.innerHTML=`<h3>${current.q}</h3>`;

  current.a.forEach((answer,index)=>{
    const btn=document.createElement("button");
    btn.className="answer-btn";
    btn.innerText=answer;
    btn.onclick=()=>checkAnswer(index);
    exDiv.appendChild(btn);
  });
}

async function checkAnswer(selected){

  const current=exercisesWeek1[userData.exerciseIndex];
  const feedback=document.getElementById("feedback");

  if(selected===current.correct){

    feedback.innerText="✅ Correct!";
    feedback.classList.add("correct");

    userData.xp+=10;
    userData.streak+=1;
    userData.exerciseIndex++;

    await setDoc(doc(db,"users",currentUser),userData);

    updateStats();

    setTimeout(()=>renderExercise(),800);

  } else {

    feedback.innerText="❌ Wrong. Try again.";
    feedback.classList.add("wrong");

    userData.streak=0;
    updateStats();
  }
}
