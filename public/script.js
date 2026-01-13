const firebaseConfig = {
  apiKey: "api-key",
  authDomain: "campus-connect",
  projectId: "campusconnect"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// LOGIN
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider).then(result => {
    const email = result.user.email;

    if (!email.endsWith("@citchennai.net")) {
      alert("Please use your college email only!");
      auth.signOut();
      return;
    }

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
    if (document.querySelector(".skill")) loadProfileData(); 
  }
});

// SAVE PROFILE
function saveProfile() {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  const details = extractDetailsFromEmail(user.email);

  const skills = [...document.querySelectorAll(".skill:checked")]
    .map(i => i.value);

  const interests = [...document.querySelectorAll(".interest:checked")]
    .map(i => i.value);

  db.collection("users").doc(user.uid).set({
    name: user.displayName,
    email: user.email,
    department: details.department,
    year: details.year,
    skills,
    interests
  })
  .then(() => alert("Profile saved!"))
  .catch(err => console.error(err));
}


// FIND MATCHES
function findMatches() {
  const user = auth.currentUser;

  db.collection("users").doc(user.uid).get().then(myDoc => {
    const myData = myDoc.data();

    db.collection("users").get().then(snapshot => {
      let html = "";

      snapshot.forEach(doc => {
        if (doc.id !== user.uid) {
          const u = doc.data();

          let score = 0;
          myData.skills.forEach(s => {
            if (u.skills?.includes(s)) score++;
          });

          if (score > 0) {
            html += `
              <div class="match">
                <b>${u.name}</b><br>
                Dept: ${u.department}<br>
                Year: ${u.year}<br>
                Skills: ${u.skills.join(", ")}<br>
                Interests: ${u.interests.join(", ")}<br>
                Score: ${score}
              </div>
            `;

          }
        }
      });

      document.getElementById("matches").innerHTML =
        html || "No matches found.";
    });
  });
}


// EVENTS
function addEvent() {
  const name = document.getElementById("name").value;
  const club = document.getElementById("club").value;
  const date = document.getElementById("date").value;

  db.collection("events").add({ name, club, date }).then(() => {
    alert("Event added!");
    window.location.href = "events.html";
  });
}


function loadEvents() {
  db.collection("events")
    .orderBy("date")
    .get()
    .then(snapshot => {
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

      document.getElementById("events").innerHTML =
        html || "No upcoming events.";
    });
}

// NAVIGATION
function goToProfile() { window.location.href = "profile.html"; }
function goToEvents() { window.location.href = "events.html"; }
function goToAddEvent() { window.location.href = "addevent.html"; }
function goToDashboard() { window.location.href = "dashboard.html"; }


function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
function extractDetailsFromEmail(email) {
  const main = email.split("@")[0];      // aldrin.cse2025
  const parts = main.split(".");         // ["aldrin", "cse2025"]

  if (parts.length < 2) return null;

  const depYear = parts[1];              // cse2025
  const dept = depYear.slice(0, 3);      // cse
  const admissionYear = parseInt(depYear.slice(3)); // 2025

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1 = Jan

  // Academic year starts in July
  const academicYear = (month >= 7) ? year : year - 1;

  const studyYear = academicYear - admissionYear + 1;

  return {
    department: dept.toUpperCase(),
    year: studyYear
  };
}

function getStudentYear(admissionYear) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // Jan = 1

  let academicYear;

  if (currentMonth >= 7) {
    academicYear = currentYear;
  } else {
    academicYear = currentYear - 1;
  }

  return academicYear - admissionYear + 1;
}
// LOAD PROFILE & AUTO-TICK CHECKBOXES
function loadProfileData() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("users").doc(user.uid).get().then(doc => {
    if (!doc.exists) return;

    const data = doc.data();

    // Auto-tick Skills
    if (data.skills) {
      data.skills.forEach(skill => {
        const checkbox = document.querySelector(
          `.skill[value="${skill}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Auto-tick Interests
    if (data.interests) {
      data.interests.forEach(interest => {
        const checkbox = document.querySelector(
          `.interest[value="${interest}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }
  });
}
function checkPasscode() {
  const code = prompt("Enter club passcode");

  if (code === "CLUB123") {
    sessionStorage.setItem("eventAuth", "true"); 
    window.location.href = "addevent.html";
  } else {
    alert("Wrong passcode!");
  }
}
