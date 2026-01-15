# CampusConnect

A student collaboration platform with Firebase authentication and events.

🎓 CampusConnect
CampusConnect is a unified web platform designed to streamline campus communication, student networking, and event management. It replaces fragmented, unofficial systems with one trusted and official digital hub for students, clubs, and administrators.

🚀 Features
1. Secure Login
Google Authentication

Restricted to official college email IDs

Automatic user profile creation

2. Student Networking
Discover students across departments and years

Send and manage connection requests

View accepted connections

Search by name, department, skills, or interests

3. Profile Management
Auto-detect department & year from email

Add skills and interests

Personalized matchmaking system

4. Events Management
Club-restricted event creation

Add venue, date, time & registration links

View upcoming events

One-click event registration

5. Requests & Connections
Accept / Reject requests

View current connections

Build a campus network

🛠️ Tech Stack
Frontend: HTML, CSS, JavaScript

Backend: Firebase

Authentication: Firebase Auth (Google Login)

Database: Cloud Firestore

Hosting: Firebase Hosting / GitHub Pages

📁 Project Structure
/public
  ├── index.html
  ├── dashboard.html
  ├── network.html
  ├── events.html
  ├── addevent.html
  ├── profile.html
  ├── connections.html
  ├── style.css
  └── script.js
🔐 Authentication Rules
Only college emails allowed

New users are auto-added to Firestore

Each user gets:

Name

Email

Department

Year

Skills

Interests

Connections

Requests

📊 Firestore Collections
Users
{
  "name": "John",
  "email": "john.cse2025@college.edu",
  "department": "CSE",
  "year": 2,
  "skills": ["Java", "UI/UX"],
  "interests": ["AI", "Robotics"],
  "connections": [],
  "requests": []
}
Events
{
  "name": "Tech Fest",
  "club": "CSI",
  "venue": "Seminar Hall A",
  "time": "10:00",
  "date": "2026-02-10",
  "link": "https://forms.gle/..."
}
🔎 Search System
Users can search by:

Name

Department

Year

Skills

Interests

Search is real-time and dynamic.

🧠 Future Enhancements
Gemini AI for smart matchmaking

In-app chat system

Student–Senior–Alumni mentorship

AI-based event recommendations

Push notifications

Admin dashboard

🎯 Goal
CampusConnect centralizes all student information, networking, and events into one official platform, eliminating confusion caused by scattered WhatsApp groups, unofficial forms, and unreliable communication channels.


