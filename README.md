⚡ ChargeQuest – EV Charging Station Finder (Frontend)

ChargeQuest is a modern React-based web application that helps users discover nearby electric vehicle (EV) charging stations and navigate to them easily.

This frontend application integrates with a Spring Boot backend and supports secure authentication, station listing, availability tracking, and navigation redirection.

🚀 Key Features

🔐 JWT-based User Authentication (Login & Registration)

⚡ View All Charging Stations

📊 Station Availability Status

🧭 One-Click Navigation (Redirect to Google Maps)

🔄 Real-time Data Fetching from Backend

📱 Fully Responsive Design (Mobile + Desktop)

🧠 State Management using Redux Toolkit

🛠️ Tech Stack
Category	Technology
Frontend Framework	React 19
Build Tool	Vite
State Management	Redux Toolkit
Routing	React Router v7
Styling	Tailwind CSS v3
API Client	Axios
Authentication	JWT
🏗️ Architecture Overview
React (Frontend)
       ↓
Axios API Calls
       ↓
Spring Boot REST API (Backend)
       ↓
MySQL Database


The frontend consumes secured REST APIs and dynamically renders charging station data.

📂 Project Structure
```
chargequest-frontend/
├── public/
├── src/
│   ├── api/              # Axios API configuration
│   ├── components/       # Reusable components
│   ├── pages/            # Page-level components
│   ├── store/            # Redux store and slices
│   ├── utils/            # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── tailwind.config.js
└── package.json
```

🔐 Authentication Flow

User registers via /auth/register

Login via /auth/login

Backend returns JWT token

Token stored securely

Protected routes accessible only to authenticated users

⚡ Charging Station Features

Fetch all charging stations from backend

Display:

Station Name

Location Address

Available Slots

Charging Type

Navigate Button

Real-time updates when availability changes

🧭 Navigation Feature

When user clicks Navigate, the app redirects to Google Maps using:

https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE


No Google Maps API key required.

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/your-username/chargequest-frontend.git
cd chargequest-frontend

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create .env file:

VITE_API_BASE_URL=http://localhost:8080/api/v1

4️⃣ Run Application

Development:

npm run dev


Production Build:

npm run build
npm run preview

🔌 Expected Backend API

The frontend expects the following REST endpoints:

POST /auth/login

POST /auth/register

GET /stations

Backend Base URL:

http://localhost:8080/api/v1

📱 Responsive Design

Mobile-first layout

Tailwind CSS utility classes

Optimized for modern browsers

🧪 Future Enhancements

Razorpay Payment Integration

Slot Booking System

User Reviews & Ratings

Admin Dashboard

Real-time station availability via WebSockets

📜 License

MIT License

👨‍💻 Author

Satvik Patil
Java Full Stack Developer | React | Spring Boot | SQL
