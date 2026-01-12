const firebaseConfig = {
  apiKey: "AIzaSyBGXmQilnigdNGZhVAjQhTDWjH2iBt4iC0",
  authDomain: "campusconnect-70eba.firebaseapp.com",
  projectId: "campusconnect-70eba"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ---------- LOGIN ----------
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(() => {
    window.location.href = "dashboard.html";
  });
}

// ---------- AUTH CHECK ----------
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    if (document.getElementById("userName")) {
      document.getElementById("userName").innerText =
        "Welcome, " + user.displayName;
    }

    createSampleEvents();
    loadEvents();
    createSampleUsers();

  }
});


// ---------- PROFILE SAVE ----------
function saveProfile() {
  const user = auth.currentUser;
  if (!user) return alert("Login first");

  const skills = [...document.querySelectorAll(".skill:checked")].map(i => i.value);
  const interests = [...document.querySelectorAll(".interest:checked")].map(i => i.value);

  db.collection("users").doc(user.uid).set({
    name: user.displayName,
    skills,
    interests
  }).then(() => {
    alert("Profile saved!");
  });
}

// ---------- LOAD PROFILE ----------
function loadProfile(uid) {
  db.collection("users").doc(uid).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById("profile").innerHTML = `
        <p><b>Skills:</b> ${data.skills.join(", ")}</p>
        <p><b>Interests:</b> ${data.interests.join(", ")}</p>
      `;
    }
  });
}

// ---------- MATCH PEERS ----------
function findMatches() {
  const user = auth.currentUser;

  db.collection("users").doc(user.uid).get().then(myDoc => {
    const myData = myDoc.data();

    db.collection("users").get().then(snapshot => {
      let result = "";

      snapshot.forEach(doc => {
        if (doc.id !== user.uid) {
          const other = doc.data();
          let score = 0;

          myData.skills.forEach(skill => {
            if (other.skills.includes(skill)) score += 2;
          });

          if (score > 0) {
            result += `<p><b>${other.name}</b> - Match Score: ${score}</p>`;
          }
        }
      });

      document.getElementById("matches").innerHTML = result || "No matches yet.";
    });
  });
}

// ---------- EVENTS ----------
const PASSCODE = "CLUB123";

function addEvent() {
  const code = prompt("Enter club passcode");
  if (code !== PASSCODE) return alert("Wrong code");

  const name = document.getElementById("name").value;
  const club = document.getElementById("club").value;
  const date = document.getElementById("date").value;

  db.collection("events").add({ name, club, date }).then(() => {
    alert("Event added!");
    loadEvents();
  });
}

function loadEvents() {
  db.collection("events").get().then(snapshot => {
    let html = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      html += `
        <div class="event">
          <h4>${e.name}</h4>
          <p>Club: ${e.club}</p>
          <p>Date: ${e.date}</p>
        </div>
      `;
    });
    document.getElementById("events").innerHTML = html;
  });
}

// ---------- NAVIGATION ----------
function goToProfile() { window.location.href = "profile.html"; }
function goToEvents() { window.location.href = "events.html"; }

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
function createSampleEvents() {
  db.collection("events").get().then(snapshot => {
    if (!snapshot.empty) return;

    const samples = [
      { name: "AI Hackathon", club: "Tech Club", date: "2026-02-10" },
      { name: "Web Dev Bootcamp", club: "Coding Club", date: "2026-02-15" },
      { name: "Robotics Meetup", club: "Robotics Club", date: "2026-02-20" }
    ];

    samples.forEach(e => db.collection("events").add(e));
  });
}
function createSampleUsers() {
  const samples = [
    { name: "Aarav", skills: ["java", "web"], interests: ["hackathons"] },
    { name: "Meera", skills: ["python", "ai"], interests: ["ai"] },
    { name: "Rahul", skills: ["react", "node"], interests: ["web3"] }
  ];

  samples.forEach((u, i) => {
    db.collection("users").doc("sample" + i).set(u);
  });
}
function findMatches() {
  const mySkills = [...document.querySelectorAll("input[type=checkbox]:checked")]
    .map(i => i.value);

  db.collection("users").get().then(snapshot => {
    let html = "";

    snapshot.forEach(doc => {
      const u = doc.data();
      if (!u.skills) return;

      let score = 0;
      mySkills.forEach(s => {
        if (u.skills.includes(s)) score += 1;
      });

      if (score > 0) {
        html += `
          <div class="match">
            <b>${u.name}</b><br>
            Skills: ${u.skills.join(", ")}<br>
            Score: ${score}
          </div>
        `;
      }
    });

    document.getElementById("matches").innerHTML =
      html || "No matches yet.";
  });
}
