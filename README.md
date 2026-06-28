# MediScan AI

**MediScan AI** is a production-ready, AI-powered digital health screening platform designed to assist in preliminary clinical assessment. It leverages **Computer Vision, NLP, and Risk Scoring Algorithms** to provide fast, intelligent health insights.

> **Clinical Disclaimer**
> MediScan AI is not a medical diagnostic tool. It is intended only for preliminary screening. All outputs must be reviewed by a licensed healthcare professional before making any medical decisions.

---

## Features

### Multi-Modal AI Screening

* **Chest X-Ray Analysis**
  Detects pulmonary anomalies using DenseNet (torchxrayvision) and Vision Transformers (ViT)

* **Skin Disease Detection**
  Identifies dermatological abnormalities from uploaded images

* **Diabetes Risk Calculator**
  Computes metabolic risk based on BMI, age, and symptoms

* **Mental Health NLP Analysis**
  Analyzes text input for emotional distress and psychological risk indicators

---

### High-Performance AI Engine

* Persistent Flask microservice
* Preloaded ML models enabling 1–2 second inference time

---

### Smart Clinical Reports

* Detailed triage reports
* Risk bands and severity levels
* Demographic-based insights
* Print-ready output

---

### Modern UI/UX

* Dark and Light mode
* Glassmorphism design
* Clean, premium interface
* Built with Outfit font

---

### Accessibility

* English and Urdu bilingual support

---

### Security

* JWT Authentication
* Encrypted passwords using bcrypt
* Secure PostgreSQL storage

---

## Architecture

MediScan AI follows a three-tier scalable architecture:

### Frontend (Client)

* React 19 with Vite
* Tailwind CSS v4
* React Query and Context API
* Shadcn UI and Radix UI

---

### Backend (API Layer)

* Node.js with Express (TypeScript)
* PostgreSQL using pg
* JWT Authentication
* Acts as a bridge between frontend and AI microservice

---

### AI Microservice

* Python Flask
* PyTorch and Transformers
* TorchXRayVision

Loads models once for fast predictions and exposes REST endpoints:

```
/analyze/xray
/analyze/skin
/analyze/diabetes
/analyze/mental-health
```

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Python (3.11 or higher)
* PostgreSQL
* Git

---

## Database Setup

```sql
CREATE DATABASE mediscan;
```

---

## Environment Variables

Create a `.env` file in the backend directory:

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

## Installation

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

### AI Microservice

```bash
cd mediscan-models
pip install -r requirements.txt
```

---

## Running the Application

### Start AI Service (Important: Start First)

```bash
cd mediscan-models
python server.py
```

---

### Start Backend

```bash
cd backend
npm run dev
```

---

### Start Frontend

```bash
cd frontend
npm run dev
```

---

Open in browser:

```
http://localhost:5173
```

---

## Project Structure

```
MediScan-AI/

├── backend/
│   ├── src/
│   │   └── index.ts
│   └── package.json

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   └── App.tsx
│   │   └── index.css
│   └── package.json

├── mediscan-models/
│   ├── diabetes-model/
│   ├── triage_engine.py
│   └── server.py

└── README.md
```

---

## Contributing

Contributions are welcome:

* Fork the repository
* Create a new branch
* Submit a pull request

---

## Future Improvements

* Real-time doctor integration
* Mobile application
* Expanded disease detection models
* AI explainability dashboard

---

## Author

Nabiha Nasir
AI and Software Engineering Enthusiast
Focused on building real-world AI systems in healthcare
