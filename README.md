# Udyam Setu (उद्यम सेतु)

**AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant for Rural Micro-Entrepreneurs**  
*Smart India Hackathon 2026 — Problem Statement SIH26091 (Ministry of Social Justice & Empowerment)*

---

## 🌟 Tech Stack Overview

- **Frontend**: Vite + React 18, React Router v6, Tailwind CSS, Lucide Icons, Bilingual i18n (English & हिंदी).
- **Backend**: Node.js + Express, REST API.
- **Database**: PostgreSQL (Normalized schema, FK cascades, master reference tables, hyper-local context cache).
- **External Data Layer**: Google Maps Platform (Places, Geocoding, Routes), Census of India, AGMARKNET Mandi prices, data.gov.in / MyScheme catalog loader.
- **Engine**: Rule-based Financial Structuring & Scheme Matcher Engine extensible for ML models.

---

## 📁 Repository Structure

```
udyam-setu/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL pool + resilient local fallback store
│   │   ├── controllers/
│   │   │   ├── userController.js     # POST/GET /api/users
│   │   │   ├── businessController.js # POST/GET /api/businesses/:userId
│   │   │   ├── salesController.js    # POST/GET /api/sales/:userId
│   │   │   ├── expensesController.js # POST/GET /api/expenses/:userId
│   │   │   ├── profileController.js  # POST/GET /api/profile/:userId (Sections D, E, F)
│   │   │   ├── itemsController.js    # POST/GET /api/items/:userId
│   │   │   ├── analysisController.js # GET /api/analysis/:userId (Financial Metrics)
│   │   │   ├── schemesController.js  # GET /api/schemes/:userId (Scheme Matcher)
│   │   │   └── contextController.js  # GET /api/local-context/:userId
│   │   ├── services/
│   │   │   ├── financialService.js   # 1:1 port of financial calculations
│   │   │   ├── schemeMatchingService.js # Extensible rule/ML scheme matching engine
│   │   │   └── externalData/
│   │   │       ├── mapsService.js    # Google Maps Places/Geocoding/Routes
│   │   │       ├── censusService.js  # Census of India demographic indicators
│   │   │       ├── agmarknetService.js # AGMARKNET APMC mandi prices & trends
│   │   │       ├── mySchemeService.js # data.gov.in / MyScheme catalog loader
│   │   │       └── localContextAggregator.js # 24hr TTL caching aggregator
│   │   ├── db/
│   │   │   ├── schema.sql            # Normalized PostgreSQL DDL
│   │   │   ├── seeds.sql             # Reference master seed data
│   │   │   └── migrate.js            # Transactional migration runner
│   │   ├── routes/
│   │   │   └── api.js                # Express API router
│   │   └── index.js                  # Express backend entry point
│   ├── tests/
│   │   ├── crud.test.js              # CRUD integration tests
│   │   ├── analysis.test.js          # Financial calculation tests
│   │   ├── localContext.test.js      # External API & caching tests
│   │   └── schemes.test.js           # Government scheme matching tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Mobile card framing + header + progress + actions
│   │   │   └── Common.jsx            # Field, TextInput, Chip, VoiceRow, QACard
│   │   ├── context/
│   │   │   └── AppContext.jsx        # Global state + local storage + backend sync
│   │   ├── i18n/
│   │   │   └── translations.js       # English & Hindi translation dictionary
│   │   ├── pages/
│   │   │   ├── WelcomePage.jsx       # Route: /
│   │   │   ├── UserDetailsPage.jsx   # Route: /details
│   │   │   ├── QuestionnairePage.jsx # Route: /questionnaire (Sections A to F)
│   │   │   ├── ItemsPage.jsx         # Route: /items
│   │   │   └── DashboardPage.jsx     # Route: /dashboard (Analysis + Schemes Modal)
│   │   ├── services/
│   │   │   └── api.js                # Frontend REST client
│   │   ├── App.jsx                   # React Router definition
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Running the Project

### 1. Start the Backend API Server

```bash
cd backend
npm install
npm start
```
The server will start on `http://localhost:5000`.

### 2. Run Database Migrations (PostgreSQL)

Set your PostgreSQL connection string in `.env` or run directly:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/udyam_setu npm run migrate
```

### 3. Run Backend Automated Test Suites

```bash
cd backend
npm test
```
Runs 19 automated integration and unit test suites across all endpoints.

### 4. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Register user demographic profile (`name`, `age`, `gender`, `phone`, `district`, `state`) |
| `GET` | `/api/users/:userId` | Retrieve user details |
| `POST` | `/api/businesses/:userId` | Save Section A (`type`, `what`, `workers`, `hours`) |
| `POST` | `/api/sales/:userId` | Save Section B (`customersPerDay`, `dailySales`, `monthlyRevenue`) |
| `POST` | `/api/expenses/:userId` | Save Section C (`rent`, `electricity`, `rawMaterials`, `transport`, `wages`, `packaging`, `emi`, `other`) |
| `POST` | `/api/profile/:userId` | Save Sections D, E, F (`customers`, `competition`, `problems`) |
| `POST` | `/api/items/:userId` | Save unit economics item catalog |
| `GET` | `/api/analysis/:userId` | Compute financial metrics (Revenue, Profit, Cash Flow, Break-Even, Working Capital, ROI, Risk) |
| `GET` | `/api/schemes/:userId` | Rank matching government schemes with eligibility percentages |
| `GET` | `/api/local-context/:userId` | Retrieve cached hyper-local context (Maps, Census, AGMARKNET Mandi prices) |
| `GET` | `/api/summary/:userId` | Composite profile view for entrepreneur |
