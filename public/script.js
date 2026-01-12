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

// AUTH CHECK
auth.onAuthStateChanged(user => {
  if (!user && !location.href.includes("index")) {
    window.location.href = "index.html";
  }

  if (user) {
    const nameEl = document.getElementById("userName");
    if (nameEl) nameEl.innerText = "Welcome, " + user.displayName;

    if (document.getElementById("events")) loadEvents();
  }
});

// SAVE PROFILE
function saveProfile() {
  const user = auth.currentUser;
  if (!user) return alert("Login first");

  const skills = [...document.querySelectorAll(".skill:checked")].map(i => i.value);
  const interests = [...document.querySelectorAll(".interest:checked")].map(i => i.value);

  if (!skills.length || !interests.length) {
    return alert("Select at least 1 skill & 1 interest");
  }

  db.collection("users").doc(user.uid).set({
    name: user.displayName,
    email: user.email,
    skills,
    interests
  }).then(() => {
    alert("Profile saved!");
  });
}

// FIND MATCHES
function findMatches() {
  const user = auth.currentUser;

  db.collection("users").doc(user.uid).get().then(myDoc => {
    const myData = myDoc.data();

    db.collection("users").get().then(snapshot => {
      let html = "";

      snapshot.forEach(doc => {
        if (doc.id === user.uid) return;

        const other = doc.data();
        let score = 0;

        myData.skills.forEach(s => {
          if (other.skills.includes(s)) score++;
        });

        if (score > 0) {
          html += `<p><b>${other.name}</b> - Score: ${score}</p>`;
        }
      });

      document.getElementById("matches").innerHTML = html || "No matches found.";
    });
  });
}

// EVENTS
function addEvent() {
  const code = prompt("Enter club passcode");
  if (code !== "CLUB123") return alert("Wrong code");

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
          <p>${e.club} | ${e.date}</p>
        </div>
      `;
    });

    document.getElementById("events").innerHTML = html;
  });
}

// NAVIGATION
function goToProfile() { window.location.href = "profile.html"; }
function goToEvents() { window.location.href = "events.html"; }

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
