# 🚀 TalentTop

An interactive web platform that helps kids learn programming through fun, practical coding challenges instead of traditional theory-based learning. Users solve challenges, submit solutions, get evaluated by an admin, and climb a dynamic leaderboard.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (via mysql2)
- **Auth:** JWT (jsonwebtoken) + bcrypt password hashing

## 📁 Project Structure
TalentTop/
├── frontend/ # Static HTML/CSS/JS pages
├── config/db.js # Database connection
├── middleware/ # Auth + error handling middleware
├── routes/ # Express route handlers
├── server.js # App entry point
└── .env # Environment variables (not committed)

## ⚙️ Setup & Installation

1. Clone the repository
2. Install dependencies:
npm install
3. Create a `.env` file in the root folder with:
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=talenttop
4. Import the database schema into MySQL (see `Users`, `Challenges`, `Submissions`, `Evaluations` tables)
5. Start the server:
node server.js
6. Open your browser at:
http://localhost:3000

## 🔐 Authentication

Protected routes require a JWT sent in the request header:
Authorization: Bearer <token>

The token is returned from `/login` upon successful authentication and expires after 2 hours.

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|--------------|----------------|----------------|
| POST | `/register` | Register a new user | No | - |
| POST | `/login` | Login and receive a JWT | No | - |
| GET | `/challenges` | List all challenges | No | - |
| POST | `/challenges` | Add a new challenge | Yes | admin |
| POST | `/submit` | Submit a solution to a challenge | No | - |
| GET | `/submissions` | List all submissions | No | - |
| POST | `/evaluate` | Evaluate a submission (score + feedback) | Yes | admin |
| GET | `/evaluations` | List all evaluations | No | - |
| GET | `/leaderboard` | Get ranked users by total points | No | - |
| GET | `/profile/:id` | Get a user's profile stats | No | - |

## 👥 User Roles

- **User:** register, login, browse challenges, submit solutions, view leaderboard/profile
- **Admin:** everything a user can do, plus adding challenges and evaluating submissions

## 🚧 Future Development (Project 2)

- Real XP/points system tied to the database
- File upload for solutions instead of text/link only
- Multi-level permissions
- Real-time notifications
