# OmniDecision AI — AI-Powered Enterprise Decision Intelligence Platform

> **Theme**: Decision Intelligence  
> **Challenge Solution**: Strategic Multi-Criteria Decision Analysis (MCDA), Monte Carlo Risk Simulation, and Multi-Agent Explainable AI Recommendations powered by Google Gemini 1.5/2.5.

---

## 🎯 1. Problem Statement

Organizations and executive leaders struggle to make timely, data-driven, and defensible decisions due to:
1. **Fragmented & Unstructured Data**: Crucial strategic data is scattered across disparate notes, market reports, and spreadsheets.
2. **Complex Trade-offs & Conflicting Objectives**: Balancing upfront cost vs. execution velocity vs. security compliance vs. technical debt is difficult without structured quantitative models.
3. **Uncertainty & Hidden Blindspots**: Decision-makers lack the tools to stress-test decisions against stochastic volatility (e.g. market downturns, cost inflation).
4. **Black-Box Obscurity**: Traditional decisions rely on intuition or black-box recommendations without transparent, audit-ready counterfactual explanations ("Why option A was chosen over option B").

---

## 🚀 2. Solution Description: OmniDecision AI

**OmniDecision AI** is an enterprise-grade Decision Intelligence workspace that combines quantitative **Multi-Criteria Decision Analysis (MCDA / AHP)**, **Monte Carlo Stochastic Risk Simulation (1,000 iterations)**, and **Multi-Perspective Generative AI Synthesis (Google Gemini API)**.

### ✨ Key Features:
- **AI Scenario Generator (Gemini Powered)**: Type or paste plain-text scenario prompts; Google Gemini parses unstructured text into structured decision matrices, options, criteria weights, and initial scores.
- **Interactive MCDA Matrix Studio**: Dynamic weight sliders with real-time percentage normalization and scoring input tables.
- **Stochastic Monte Carlo Risk Simulator**: Runs 1,000 randomized market iterations to calculate winning probability distributions under volatility (+/- 15%).
- **Multi-Dimensional Visual Analytics (Recharts)**:
  - **Profile Radar Charts**: Visualizing multi-attribute performance.
  - **Pareto Trade-off Frontier**: Scatter plot comparing composite score vs. risk exposure.
  - **Criteria Sensitivity Analysis**: Dynamic line curves demonstrating how rankings shift as criteria weights change.
- **Explainable Multi-Agent AI Executive Report**:
  - Executive Recommendation & Confidence Index.
  - Core Strategic Rationale drivers.
  - **Counterfactual Reasoning**: Identifies precise boundary conditions where secondary options supersede the top choice.
  - **Multi-Agent Stakeholder Views**: CFO (Financial ROI), CTO (Technical Feasibility), COO (Operations), and Chief Risk Officer (Compliance & Vulnerabilities).
- **Scenario Stress Testing**: One-click toggles for macro scenarios (*Market Recession*, *25% Cost Inflation*, *Strict GDPR Compliance*).
- **JWT Authentication & Audit Logs**: Secure authentication with password hashing (`bcryptjs`) and Zod request validation.

---

## 🛠️ 3. Assignment Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS + Custom Dark Glassmorphism Theme
- **Icons**: Lucide React
- **Visualizations**: Recharts (Radar, Scatter, Area, Line charts)
- **HTTP Client**: Axios with JWT Interceptors

### Backend
- **Runtime**: Node.js + Express.js
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Database**: SQLite (Zero-config persistent JSON storage)

### Artificial Intelligence
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Key Storage**: Kept strictly inside backend environment variables (`GEMINI_API_KEY`)

---

## 💻 4. Local Setup & Execution Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/omnidecision-ai.git
cd omnidecision-ai
```

### Step 2: Configure Environment Variables

#### Backend (`/server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5001
JWT_SECRET=super-secret-omnidecision-jwt-key-2026
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```
*(Note: If `GEMINI_API_KEY` is omitted, the backend automatically uses intelligent heuristic fallback reasoning to keep all features 100% testable).*

#### Frontend (`/client/.env`)
Create a `.env` file inside the `client/` directory (optional for custom API URL):
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### Step 3: Install Dependencies & Run

#### Start Backend Server:
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5001`*

#### Start Frontend Client:
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🚢 5. Deployment Guide

Follow the official deployment guidelines:

### Deploying Frontend (Vercel / Netlify)
1. Push project to GitHub.
2. Import `/client` directory into Vercel or Netlify.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable: `VITE_API_BASE_URL=https://your-backend-render-url.onrender.com/api`

### Deploying Backend (Render / Railway)
1. Import `/server` directory into Render Web Service or Railway.
2. Build Command: `npm install`
3. Start Command: `node index.js`
4. Environment Variables:
   - `PORT=5001`
   - `JWT_SECRET=your-production-secret`
   - `GEMINI_API_KEY=your_google_gemini_api_key`

---

## 📹 6. Demo Video & Submission Requirements

- **Problem Statement**: Detailed in Section 1.
- **Solution Overview**: Detailed in Section 2.
- **GitHub Repository**: Public source code repository containing `/client` and `/server`.
- **Demo Video**: 3–5 minute video demonstrating AI Scenario Parsing, MCDA Matrix Manipulation, Monte Carlo Risk Simulation, and Gemini Multi-Agent Synthesis.
