const firebaseConfig = {
  apiKey: "AIzaSyBGXmQilnigdNGZhVAjQhTDWjH2iBt4iC0",
  authDomain: "campusconnect-70eba.firebaseapp.com",
  projectId: "campusconnect-70eba"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// LOGIN
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider).then(() => {
    window.location.href = "dashboard.html";
  });
}
function saveProfile() {
  const user = auth.currentUser;

  const skills = [...document.querySelectorAll("input[type=checkbox]:checked")]
    .map(i => i.value);

  const interests = skills; // you can separate later

  db.collection("users").doc(user.uid).set({
    name: user.displayName,
    skills,
    interests
  }).then(() => {
    alert("Profile saved!");
  });
}
function matchUsers(mySkills, other) {
  let score = 0;

  mySkills.forEach(skill => {
    if (other.skills.includes(skill)) score += 2;
  });

  return score;
}
const PASSCODE = "CLUB123";

function addEvent() {
  const code = prompt("Enter passcode");
  if (code !== PASSCODE) return alert("Wrong code");

  const name = document.getElementById("name").value;
  const club = document.getElementById("club").value;
  const date = document.getElementById("date").value;

  db.collection("events").add({
    name, club, date
  }).then(() => {
    alert("Event added!");
  });
}
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  }
});
