# 🏥 MediScan AI

**MediScan AI** is a production-ready, AI-powered digital health screening platform designed for preliminary clinical assessment. It combines Computer Vision, NLP, and risk-scoring models to deliver fast and intelligent health insights.

> ⚠️ **Disclaimer**
> This system is not a medical diagnostic tool. All results must be reviewed by a licensed healthcare professional.

---

## 🌟 Features

### 🔬 Multi-Modal AI Screening

* **Chest X-Ray Analysis**

  * Detects pulmonary abnormalities
  * Uses DenseNet and Vision Transformers

* **Skin Disease Detection**

  * Identifies dermatological conditions
  * Works on uploaded images

* **Diabetes Risk Calculator**

  * Computes risk based on BMI, age, and symptoms

* **Mental Health Analysis**

  * NLP-based emotional pattern detection

---

### ⚡ Performance

* Flask-based AI microservice
* Preloaded models
* Fast inference (1–2 seconds)

---

### 📊 Clinical Reports

* Structured triage output
* Risk levels and severity bands
* Clean, printable format

---

### 🎨 UI/UX

* Dark & Light mode
* Minimal, modern interface
* Built with React + Tailwind

---

### 🌍 Accessibility

* English
* Urdu

---

### 🔒 Security

* JWT authentication
* Password hashing (bcrypt)
* PostgreSQL database

---

## 💻 Frontend

* React 19 + Vite
* Tailwind CSS
* Context API & React Query

---

## ⚙️ Backend

* Node.js + Express (TypeScript)
* PostgreSQL (`pg`)
* JWT authentication
* API gateway for AI services

---

## 🤖 AI Microservice

* Python Flask
* PyTorch + Transformers

### 📡 Endpoints

```bash
/analyze/xray
/analyze/skin
/analyze/diabetes
/analyze/mental-health
```

---

## 🚀 Getting Started

### ✅ Requirements

* Node.js (v18+)
* Python (3.11+)
* PostgreSQL
* Git

---

## 🗄️ Database

```sql
CREATE DATABASE mediscan;
```

---

## ⚙️ Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediscan
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key

PORT=5000
PYTHON_SERVICE_URL=http://localhost:5001
```

---

## 📦 Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### AI Service

```bash
cd mediscan-models
pip install -r requirements.txt
```

---

## ▶️ Run Application

### 1. Start AI Service

```bash
python server.py
```

### 2. Start Backend

```bash
npm run dev
```

### 3. Start Frontend

```bash
npm run dev
```

Open:
```
http://localhost:5173
```

---

## 📂 Structure

```
MediScan-AI/
├── backend/
├── frontend/
├── mediscan-models/
└── README.md
```

---

## 🔮 Future Work

* Doctor integration
* Mobile app
* More disease models
* AI explainability

---

## 👩‍💻 Authors

* Nabiha Nasir
* Zubair

Cyber & Software Engineering Enthusiasts building AI solutions in healthcare
