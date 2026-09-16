# FalconShield AI - Credit Card Fraud Detection Platform

> Enterprise-grade real-time AI credit card fraud detection system modeled after **FICO Falcon Fraud Manager**.

---

## 🌟 Overview & System Features

FalconShield AI continuously monitors cardholder spending patterns, velocity spikes, geographic anomalies, device risks, and merchant categories to flag and block fraudulent transactions in real time.

### Key Capabilities
- 🤖 **AI Machine Learning Engine**: Python FastAPI microservice utilizing a Random Forest & XGBoost model to output fraud probability scores (0-100%), anomaly scores, risk levels, and action recommendations.
- ⚡ **Real-Time Automated Rules Engine**: Configurable thresholds (max amount, velocity spikes, high-risk countries, late-night transactions).
- 🛡️ **JWT & RBAC Security**: Role-Based Access Control (`ADMIN`, `FRAUD_ANALYST`, `CUSTOMER_SUPPORT`).
- 📡 **Live Stream Ticker**: WebSocket connection for real-time transaction monitoring.
- 📊 **Executive Analytics & Heatmaps**: Interactive Recharts analytics, geographic risk heatmap, and CSV/PDF export report generator.
- 📖 **Swagger OpenAPI Docs**: Served natively at `http://localhost:5000/api-docs`.

---

## 🏗️ Tech Stack

- **Frontend**: React.js 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite, Axios, React Router v6
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JWT, WebSockets (`ws`)
- **Database**: PostgreSQL (Production / Docker) & SQLite (Local Zero-Config Fallback)
- **AI/ML Service**: Python 3.10, FastAPI, Scikit-Learn, Pandas, NumPy, Uvicorn, Joblib
- **Orchestration**: Docker & Docker Compose

---

## 🚀 Quick Start Instructions

### Option 1: Docker Compose (Recommended Production Setup)

Run all 4 container services (Postgres, ML Microservice, Express API, React Frontend) with a single command:

```bash
docker-compose up --build
```

Access Points:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Swagger API Docs**: `http://localhost:5000/api-docs`
- **Python ML Microservice**: `http://localhost:8000/docs`

---

### Option 2: Local Development Mode (Zero-Config Execution)

#### 1. ML Microservice Setup (Terminal 1)
```bash
cd ml-service
pip install -r requirements.txt
python train.py
python main.py
```
*(Runs at `http://127.0.0.1:8000`)*

#### 2. Backend Setup (Terminal 2)
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```
*(Runs at `http://localhost:5000`)*

#### 3. Frontend Setup (Terminal 3)
```bash
cd frontend
npm install
npm run dev
```
*(Runs at `http://localhost:3000`)*

---

## 🔐 Credentials for Demo Access

Use the **1-Click Quick Role Switcher** on the Login Page or enter the credentials below:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@falconshield.ai` | `password123` |
| **Lead Fraud Analyst** | `analyst@falconshield.ai` | `password123` |
| **Customer Support** | `support@falconshield.ai` | `password123` |

---

## 📁 Repository Structure

```
creditcard fraud/
├── frontend/             # React + TS + Tailwind CSS dashboard
├── backend/              # Express + TS REST API & WebSocket server
├── ml-service/           # Python FastAPI Machine Learning microservice
├── database/             # PostgreSQL schema.sql & seed.sql
├── docker/               # Container Dockerfiles
└── docker-compose.yml    # Multicontainer orchestration
```
