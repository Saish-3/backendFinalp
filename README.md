# ApexGear — Sports Equipment Rental Management System

A full-stack MERN (MongoDB Atlas, Express.js, React + Vite, Node.js) application built for a sports equipment rental business.

---

## 🌟 Features & Architecture

### Core Capabilities
- **Role-Based Access Control (RBAC)**:
  - `member`: Explore catalog, check item availability, rent gear for 1–14 days, track active, overdue, and returned rentals.
  - `admin`: Full inventory CRUD (Create, Read, Update, Delete), return processing, all rental tracking, and overdue rental monitoring.
- **Atomic Availability Locks**: Prevents race conditions and double-booking using `Equipment.findOneAndUpdate({ _id, available: true }, { available: false }, { new: true })` with automated error rollbacks.
- **Dynamic Overdue Tracking**: Real-time virtual `isOverdue` computed dynamically against `dueDate` without background cron jobs.
- **Safety Validations**: Deletion of equipment is automatically blocked if active rental records exist.
- **Modern Responsive UI**: Card-based interface, responsive navigation, live due date calculator, filter/search controls, modal dialogues, and toast notifications.

---

## 📂 Project Structure

```text
finalp/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Equipment.js
│   │   └── Rental.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── equipmentController.js
│   │   └── rentalController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── equipmentRoutes.js
│   │   └── rentalRoutes.js
│   └── validators/
│       ├── authValidator.js
│       ├── equipmentValidator.js
│       └── rentalValidator.js
├── frontend/
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   └── axiosInstance.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── AdminRoute.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── Modal.jsx
│       │   └── EquipmentForm.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── EquipmentDetails.jsx
│           ├── MyRentals.jsx
│           ├── AdminPanel.jsx
│           └── NotFound.jsx
├── postman/
│   └── Equipment_Rental_API.postman_collection.json
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/equipment_rental?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string and secret
```

### 2. Seed Database
Seeds an admin account, sample member, sports equipment catalog, and sample active/overdue rentals:
```bash
npm run seed
```

**Default Credentials:**
- **Admin**: `admin@sportsrental.com` / `AdminPassword123!`
- **Member**: `john@example.com` / `MemberPassword123!`

### 3. Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
# App runs on http://localhost:5173
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (always `member` role) |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/equipment` | Public | List equipment (filter: `category`, `available`, `search`) |
| `GET` | `/api/equipment/:id` | Public | Retrieve single equipment item |
| `POST` | `/api/equipment` | Admin | Add new equipment item |
| `PUT` | `/api/equipment/:id` | Admin | Update existing equipment |
| `DELETE` | `/api/equipment/:id` | Admin | Delete equipment (blocked if active rental exists) |
| `POST` | `/api/rentals` | Member / Admin | Rent equipment (`{ equipmentId, days: 1-14 }`) |
| `GET` | `/api/rentals` | Private | List rentals (Members: own, Admin: all) |
| `GET` | `/api/rentals?overdue=true`| Admin | List overdue active rentals |
| `GET` | `/api/rentals/:id` | Owner / Admin | Retrieve rental details |
| `POST` | `/api/rentals/:id/return` | Admin | Mark rental returned & release equipment |
| `GET` | `/api/health` | Public | Service healthcheck |

---

## 🌐 Production Deployment Guide

### Deploying Backend (Render / Railway)
1. Push repository to GitHub.
2. In **Render** or **Railway**, create a new **Web Service** connected to your repository with root directory `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables:
   - `PORT`: `5000` (or provided dynamically)
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<Random 64-char string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (Your production frontend domain)
6. Run the seed script from Render Shell if initial data is needed:
   `node seed.js`

### Deploying Frontend (Vercel / Netlify)
1. In **Vercel** or **Netlify**, import the repository with root directory `frontend`.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
6. Deploy!

---

## 📬 Postman Collection

Import `postman/Equipment_Rental_API.postman_collection.json` into Postman.
- Configured with `{{baseUrl}}` variable defaulting to `http://localhost:5000/api`.
- Login requests automatically capture and set the `{{token}}` collection variable.
