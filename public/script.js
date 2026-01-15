const firebaseConfig = {
  apiKey: "AIzaSyDxhZxUBWBH6FoujyXNU4XsQ8iSQ6T-Y2g",
  authDomain: "campusconnect-70eba.firebaseapp.com",
  projectId: "campusconnect-70eba"
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
    return;
  }

  if (!user) return;

  const userRef = db.collection("users").doc(user.uid);

  // 🔹 AUTO-CREATE USER DOC IF MISSING
  userRef.get().then(doc => {
    if (!doc.exists) {
      const details = extractDetailsFromEmail(user.email);

      userRef.set({
        name: user.displayName,
        email: user.email,
        department: details?.department || "",
        year: details?.year || "",
        skills: [],
        interests: [],
        connections: [],
        requests: []
      });

      console.log("New user document created");
    }
  });

  // Normal page loads
  if (document.getElementById("networkList")) loadNetwork();
  if (document.getElementById("events")) loadEvents();
  if (document.querySelector(".skill")) loadProfileData();
  if (document.getElementById("requests")) loadRequests();
  if (document.getElementById("users")) loadUsers();
  if (document.getElementById("connections")) loadConnections();

  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.innerText = "Welcome, " + user.displayName;
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

  const userRef = db.collection("users").doc(user.uid);

  userRef.set({
    name: user.displayName,
    email: user.email,
    department: details.department,
    year: details.year,
    skills,
    interests
  }, { merge: true })   // 👈 ONLY update profile fields
  .then(() => alert("Profile saved!"))
  .catch(err => console.error(err));
}


// FIND MATCHES
function findMatches() {
  const user = auth.currentUser;

  db.collection("users").doc(user.uid).get().then(myDoc => {
    const myData = myDoc.data();

    db.collection("users").get().then(snapshot => {
      let matches = [];

      snapshot.forEach(doc => {
        if (doc.id !== user.uid) {
          const u = doc.data();

          let score = 0;
          myData.skills.forEach(s => {
            if (u.skills?.includes(s)) score+=2;
          });

          myData.interests.forEach(i => {
            if (u.interests?.includes(i)) score++;
          });

          if (score > 0) {
            matches.push({
              id: doc.id,
              data: u,
              score: score
            });
          }
        }
      });

      // 🔽 Sort by score (High → Low)
      matches.sort((a, b) => b.score - a.score);

      // 🖼 Build HTML
      let html = "";
      matches.forEach(m => {
        const u = m.data;

        html += `
          <div class="match">
            <b>${u.name}</b><br>
            Dept: ${u.department}<br>
            Year: ${u.year}<br>
            Skills: ${u.skills.join(", ")}<br>
            Interests: ${u.interests.join(", ")}<br>
          <b>Score: ${m.score}</b>
          </div>
        `;
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
  const link = document.getElementById("eventLink").value; // ✅ FIXED

  if (!name || !club || !date || !link) {
    alert("Please fill all fields!");
    return;
  }

  db.collection("events").add({
    name,
    club,
    date,
    link
  }).then(() => {
    alert("Event added!");
    window.location.href = "events.html";
  }).catch(err => {
    console.error(err);
    alert("Error adding event");
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
          <div class="event" onclick="openEvent('${e.link}')">
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
function openEvent(link) {
  if (!link) {
    alert("No link available for this event");
    return;
  }
  window.open(link, "_blank");
}




// NAVIGATION
function goToProfile() { window.location.href = "profile.html"; }
function goToEvents() { window.location.href = "events.html"; }
function goToAddEvent() { window.location.href = "addevent.html"; }
function goToDashboard() { window.location.href = "dashboard.html"; }
function goToNetwork() { window.location.href = "network.html"; }



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


function loadUsers() {
  const myId = auth.currentUser.uid;

  db.collection("users").doc(myId).get().then(myDoc => {
    const myData = myDoc.data() || {};
    const myConnections = myData.connections || [];
    const myRequests = myData.requests || [];

    db.collection("users").get().then(snapshot => {
      let html = "";

      snapshot.forEach(doc => {
        if (doc.id === myId) return;
        if (myConnections.includes(doc.id)) return;
        if (myRequests.includes(doc.id)) return;

        const u = doc.data();

        html += `
          <div class="profile-card">
            <b>${u.name}</b><br>
            Dept: ${u.department}<br>
            <button onclick="sendRequest('${doc.id}')">Connect</button>
          </div>
        `;
      });

      document.getElementById("users").innerHTML = html || "No new students.";
    });
  });
}



function sendRequest(otherId) {
  db.collection("users").doc(otherId).update({
    requests: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
  });

  alert("Request sent!");
  loadUsers();
}


function loadConnections() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("users").doc(user.uid).get().then(doc => {
    const data = doc.data();
    const connections = data.connections || [];

    if (connections.length === 0) {
      document.getElementById("connections").innerHTML = "No connections yet.";
      return;
    }

    let html = "";
    let loaded = 0;

    connections.forEach(uid => {
      db.collection("users").doc(uid).get().then(userDoc => {
        if (!userDoc.exists) return;

        const u = userDoc.data();

        html += `
          <div class="profile-card">
            <h4>${u.name}</h4>
            <p>Dept: ${u.department}</p>
            <p>Year: ${u.year}</p>
            <p>Skills: ${u.skills.join(", ")}</p>
          </div>
        `;

        loaded++;

        if (loaded === connections.length) {
          document.getElementById("connections").innerHTML = html;
        }
      });
    });
  });
}



function loadNetwork() {
  const user = auth.currentUser;

  db.collection("users").doc(user.uid).get().then(myDoc => {
    const myData = myDoc.data();
    const myConnections = myData.connections || [];

    db.collection("users").get().then(snapshot => {
      let html = "";

      snapshot.forEach(doc => {
        if (doc.id !== user.uid && !myConnections.includes(doc.id)) {
          const u = doc.data();

          html += `
            <div class="profile-card">
              <b>${u.name}</b><br>
              Dept: ${u.department}<br>
              Year: ${u.year}<br>
              Skills: ${u.skills.join(", ")}<br>
              Interests: ${u.interests.join(", ")}<br>
              <button onclick="sendRequest('${doc.id}')">Connect</button>
            </div>
          `;
        }
      });

      document.getElementById("networkList").innerHTML =
        html || "No new students found.";
    });
  });
}
function loadRequests() {
  const user = auth.currentUser;
  if (!user) return;

  const requestsDiv = document.getElementById("requests");
  requestsDiv.innerHTML = "Loading...";

  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (!doc.exists) {
        requestsDiv.innerHTML = "User not found.";
        return;
      }

      const data = doc.data();
      const requests = data.requests || [];

      if (requests.length === 0) {
        requestsDiv.innerHTML = "No requests";
        return;
      }

      let html = "";
      let loaded = 0;

      requests.forEach(uid => {
        db.collection("users").doc(uid).get()
          .then(uDoc => {
            if (!uDoc.exists) return;

            const u = uDoc.data();

            html += `
              <div class="profile-card">
                <b>${u.name}</b><br>
                Dept: ${u.department}<br>
                <button onclick="acceptRequest('${uid}')">Accept</button>
                <button onclick="rejectRequest('${uid}')">Reject</button>
              </div>
            `;

            loaded++;

            // Update UI only after all requests load
            if (loaded === requests.length) {
              requestsDiv.innerHTML = html;
            }
          })
          .catch(err => console.error("User fetch error:", err));
      });
    })
    .catch(err => {
      console.error("Request load error:", err);
      requestsDiv.innerHTML = "Error loading requests.";
    });
}


function acceptRequest(otherId) {
  const myId = auth.currentUser.uid;

  const myRef = db.collection("users").doc(myId);
  const otherRef = db.collection("users").doc(otherId);

  myRef.update({
    requests: firebase.firestore.FieldValue.arrayRemove(otherId),
    connections: firebase.firestore.FieldValue.arrayUnion(otherId)
  });

  otherRef.update({
    connections: firebase.firestore.FieldValue.arrayUnion(myId)
  });

  alert("Connection accepted!");
  loadRequests();
  loadUsers();
}


function rejectRequest(otherId) {
  const myId = auth.currentUser.uid;

  db.collection("users").doc(myId).update({
    requests: firebase.firestore.FieldValue.arrayRemove(otherId)
  });

  alert("Request rejected");
  loadRequests();
}

