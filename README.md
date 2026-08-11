# NGOConnect — Smart NGO & Volunteer Community Engagement Platform

> **Connect. Volunteer. Create Impact.**

NGOConnect is a smart social-impact platform that connects NGOs with volunteers, manages volunteering opportunities and resource requirements, tracks participation, measures social impact, and creates a trusted community around social work.

---

## Technical Stack

* **Frontend**: React, Vite, Tailwind CSS, Lucide React, Recharts, jsPDF (client-side certificate builder)
* **Backend**: Node.js, Express.js, JWT, bcryptjs
* **Database**: MongoDB & Mongoose

---

## Database Schemas

NGOConnect features Mongoose schemas for comprehensive relational integrity:
1. **User**: Authentication credentials, user role (`volunteer`, `ngo`, `admin`), profile details, status.
2. **VolunteerProfile**: Gamified metrics (XP, level, badges, volunteer hours, impact score), bio, skills list, causes interests, location and availability.
3. **NGOProfile**: Organization bio, causes list, registration ID, website, address, verification status, and dynamic trust scores.
4. **Opportunity**: Volunteering openings created by NGOs showing category, date, slot limits, urgency and match percentage calculations.
5. **Application**: Volunteer signup bookings with status tracking (Pending, Accepted, Rejected, Completed).
6. **Participation**: Verification logs holding completed hours, people impacted count, and Issued Certificate ID.
7. **ResourceNeed**: NGO physical supply requests (clothing, food, books) detailing required/received quantities.
8. **Campaign & Event**: NGO-organized donation drives and summit gatherings.
9. **Notification**: User in-app notifications.
10. **Badge & Category**: Achievements listings and cause classification taxonomy.
11. **Review & Report**: Platform rating reviews and moderation flag tickets.

---

## Live Demo Accounts

Mock logins are pre-seeded in the database for Viva / presentation purposes:
* **Volunteer**: `volunteer@ngoconnect.demo` (Password: `password123`)
* **NGO**: `ngo@ngoconnect.demo` (Password: `password123`)
* **Admin**: `admin@ngoconnect.demo` (Password: `password123`)

---

## Installation & Setup

### 1. Database Connection
Ensure MongoDB is running locally. The application defaults to:
`mongodb://127.0.0.1:27017/ngoconnect`

### 2. Environment Configuration
Create a `.env` file in the root directory (dev defaults are already set up):
```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ngoconnect
JWT_SECRET=supersecretjwtkeyforngoconnectapp12345
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
Run the command below in the workspace root to install all packages for the root, server, and client folders:
```bash
npm run install-all
```

### 4. Seed Database
Seeds categories, badges, demo profiles, and opportunities:
```bash
npm run seed
```

### 5. Launch Development Servers
Runs both the Express API server and Vite React development server simultaneously:
```bash
npm run dev
```
* API Server: `http://localhost:5000`
* Frontend App: `http://localhost:5173`
