# 💰 SpendCoach — AI-Powered Personal Finance Coach

> Your AI-powered personal finance coach for India's 300M+ UPI users — delivered via WhatsApp, requiring zero app download to start.

---

## 🏗 Architecture

```
spendcoach/
├── backend/              # Node.js + Express + MongoDB Atlas API
│   ├── config/db.js      # MongoDB connection
│   ├── middleware/auth.js # JWT protection middleware
│   ├── models/
│   │   ├── User.js       # User schema (bcrypt hashed passwords)
│   │   └── Transaction.js# Transaction schema
│   ├── routes/
│   │   ├── auth.js       # /api/auth — signup, login, profile
│   │   └── transactions.js # /api/transactions — CRUD + summary
│   ├── .env              # 🔒 Never commit this!
│   ├── .env.example      # Safe template to share
│   └── server.js         # Express app entry point
│
└── frontend/             # React + Vite SPA
    └── src/
        ├── components/
        │   ├── UI.jsx          # Button, Input, Card, StatCard, Alert, Spinner
        │   ├── Sidebar.jsx     # Navigation sidebar
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx # Global auth state (JWT stored in localStorage)
        ├── pages/
        │   ├── Login.jsx       # Login page
        │   ├── Signup.jsx      # 2-step signup with password strength
        │   ├── Dashboard.jsx   # Main dashboard shell
        │   ├── DashboardHome.jsx # Stats, charts, recent transactions
        │   ├── Transactions.jsx  # Full CRUD transaction manager
        │   └── OtherPages.jsx  # AI Coach, Goals, Analytics, Profile
        ├── services/api.js     # Axios instance with JWT interceptors
        └── App.jsx             # Router setup
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/spendcoach
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

Backend runs on → http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Development
npm run build   # Production build
```

Frontend runs on → http://localhost:3000

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

## 🔐 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Auth (Protected — Bearer JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Transactions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List (filter by type/category) |
| POST | `/api/transactions` | Add new transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/summary` | Monthly stats + category breakdown |

---

## 🔒 Security Features

- **Password hashing** — bcrypt with 12 salt rounds
- **JWT authentication** — 7-day expiry, signed with secret key
- **Input validation** — express-validator on all endpoints
- **CORS** — restricted to known origins
- **Environment variables** — all secrets via `.env` (never committed)
- **No raw SMS stored** — DPDP-compliant design
- **Token auto-invalidation** — 401 interceptor clears localStorage

---

## 💡 Features by Tab

| Tab | Features |
|-----|----------|
| 🏠 Dashboard | Stats cards, category breakdown, recent transactions, AI insight |
| 💳 Transactions | Add/filter/delete, search, category icons, debit/credit badges |
| 🎯 Goals | Visual progress bars, multiple savings goals, deadline tracking |
| 📊 Analytics | 7-month income vs spend bar chart, savings rate trend |
| 🤖 AI Coach | Claude-powered chat, quick suggestions, streaming responses |
| 👤 Profile | Edit name/phone/income/goal, plan upgrade, sign out |

---

## 🗺 Monetization Tiers

| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0/mo | Weekly summary, basic categories, 3 goals |
| Pro | ₹199/mo | AI coach, budget alerts, unlimited goals, bill negotiator |
| Corporate | ₹99/emp | HR dashboard, team financial wellness |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Vite 5 |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Fonts | Syne (display) + DM Sans (body) |
| Deployment | Railway / Render / AWS |

---

## 🚨 Important Security Notes

1. **Rotate your MongoDB password** if it was ever shared publicly
2. **Never commit `.env`** — it's in `.gitignore`
3. **Change `JWT_SECRET`** to a long random string in production
4. **Enable MongoDB Atlas IP allowlist** to restrict access

---

## 📁 .gitignore

```
node_modules/
.env
dist/
*.log
```
