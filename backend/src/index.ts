import express, { Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { readDB, writeDB, AuthenticatedRequest, User, ScreeningSession } from "./db";
import { authenticateToken } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mediscan-super-secret-key-12345";

// Configure Multer for file uploads (storing files in memory or uploads folder)
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// --- Authentication Endpoints ---

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: db.users.length + 1,
    name,
    email,
    passwordHash
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ id: user.id, name: user.name, email: user.email });
});

// --- Patient Intake Endpoints ---

app.post("/api/intake", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { name, age, gender, symptoms, medicalHistory, vitals } = req.body;
  if (!name || !age || !gender || !vitals) {
    return res.status(400).json({ message: "Missing required patient intake fields" });
  }

  const db = readDB();
  const newSession: ScreeningSession = {
    id: db.sessions.length + 1,
    userId: req.userId!,
    date: new Date().toISOString(),
    patient: { name, age: Number(age), gender, symptoms, medicalHistory, vitals },
    results: {}
  };

  db.sessions.push(newSession);
  writeDB(db);

  return res.json(newSession);
});

// --- Vision Screening (X-Ray & Skin) Endpoints ---

app.post("/api/screening/xray", authenticateToken, upload.single("image"), (req: AuthenticatedRequest, res) => {
  const sessionId = Number(req.body.sessionId);
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const db = readDB();
  const session = db.sessions.find(s => s.id === sessionId && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Simulate/run Xray analysis finding. In a real system, you can connect python scripts here.
  session.results.xray = {
    completed: true,
    score: 84,
    findings: "Consolidation detected in right lower lobe. Consistent with bacterial pneumonia.",
    confidence: 0.88,
    details: {
      findingsList: [
        { label: "Pneumonia", confidence: 0.88 },
        { label: "Infiltration", confidence: 0.32 },
        { label: "Atelectasis", confidence: 0.15 }
      ]
    }
  };

  writeDB(db);
  return res.json(session.results.xray);
});

app.post("/api/screening/skin", authenticateToken, upload.single("image"), (req: AuthenticatedRequest, res) => {
  const sessionId = Number(req.body.sessionId);
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const db = readDB();
  const session = db.sessions.find(s => s.id === sessionId && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Simulate Skin classifier findings
  session.results.skin = {
    completed: true,
    score: 45,
    findings: "Melanocytic nevus suspected. Recommend monitoring.",
    confidence: 0.72,
    details: {
      diagnoses: [
        { name: "Melanocytic nevus", probability: 0.72 },
        { name: "Seborrheic keratosis", probability: 0.18 },
        { name: "Melanoma", probability: 0.05 }
      ]
    }
  };

  writeDB(db);
  return res.json(session.results.skin);
});

// --- Metabolic & Mental Health Endpoints ---

app.post("/api/screening/diabetes", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { sessionId, glucose, bmi, age, bloodPressure, insulin } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const db = readDB();
  const session = db.sessions.find(s => s.id === sessionId && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Calculate simple diabetes risk score based on vitals inputs
  const glucoseVal = Number(glucose || 0);
  const bmiVal = Number(bmi || 0);
  let riskScore = 15;
  if (glucoseVal > 140) riskScore += 30;
  if (glucoseVal > 200) riskScore += 40;
  if (bmiVal > 25) riskScore += 15;
  if (bmiVal > 30) riskScore += 20;

  session.results.diabetes = {
    completed: true,
    score: riskScore,
    findings: riskScore > 50 ? "High risk of type 2 diabetes." : "Low risk of type 2 diabetes.",
    confidence: 0.85,
    details: { glucose: glucoseVal, bmi: bmiVal, insulin }
  };

  writeDB(db);
  return res.json(session.results.diabetes);
});

app.post("/api/screening/mental-health", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { sessionId, phq9Answers, gad7Answers } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const db = readDB();
  const session = db.sessions.find(s => s.id === sessionId && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  const phq9Score = phq9Answers ? (phq9Answers as number[]).reduce((a, b) => a + b, 0) : 0;
  const gad7Score = gad7Answers ? (gad7Answers as number[]).reduce((a, b) => a + b, 0) : 0;

  let depressionSeverity = "Minimal";
  if (phq9Score >= 15) depressionSeverity = "Severe";
  else if (phq9Score >= 10) depressionSeverity = "Moderate";
  else if (phq9Score >= 5) depressionSeverity = "Mild";

  let anxietySeverity = "Minimal";
  if (gad7Score >= 15) anxietySeverity = "Severe";
  else if (gad7Score >= 10) anxietySeverity = "Moderate";
  else if (gad7Score >= 5) anxietySeverity = "Mild";

  session.results.mentalHealth = {
    completed: true,
    score: Math.max(phq9Score, gad7Score),
    findings: `Depression: ${depressionSeverity} (PHQ-9 Score: ${phq9Score}). Anxiety: ${anxietySeverity} (GAD-7 Score: ${gad7Score}).`,
    confidence: 0.90,
    details: { phq9Score, gad7Score, depressionSeverity, anxietySeverity }
  };

  writeDB(db);
  return res.json(session.results.mentalHealth);
});

// --- Triage & Dashboard Endpoints ---

app.get("/api/triage/:sessionId", authenticateToken, (req: AuthenticatedRequest, res) => {
  const sessionId = Number(req.params.sessionId);
  const db = readDB();
  const session = db.sessions.find(s => s.id === sessionId && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Triage Calculation Logic
  let maxScore = 0;
  const recommendations: string[] = [];
  let referral = "Routine follow-up";

  if (session.results.xray?.completed) {
    const xrayScore = session.results.xray.score || 0;
    maxScore = Math.max(maxScore, xrayScore);
    if (xrayScore > 75) {
      recommendations.push("Urgent Chest CT recommended to confirm pneumonia consolidation");
      referral = "Pulmonologist Consult";
    }
  }

  if (session.results.skin?.completed) {
    const skinScore = session.results.skin.score || 0;
    maxScore = Math.max(maxScore, skinScore);
    if (skinScore > 60) {
      recommendations.push("Biopsy recommendation for abnormal dermal/skin lesion findings");
      referral = "Dermatologist Consult";
    }
  }

  if (session.results.diabetes?.completed) {
    const diabetesScore = session.results.diabetes.score || 0;
    maxScore = Math.max(maxScore, diabetesScore);
    if (diabetesScore > 50) {
      recommendations.push("Perform HbA1c screening test and evaluate fasting blood sugar level");
      referral = "Endocrinologist Consult";
    }
  }

  if (session.results.mentalHealth?.completed) {
    const mentalScore = session.results.mentalHealth.score || 0;
    maxScore = Math.max(maxScore, mentalScore);
    if (mentalScore > 14) {
      recommendations.push("Counseling and psychological support recommendation");
      referral = "Therapist/Psychiatrist Consult";
    }
  }

  let riskLevel: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (maxScore >= 80) riskLevel = "Critical";
  else if (maxScore >= 60) riskLevel = "High";
  else if (maxScore >= 30) riskLevel = "Moderate";

  session.triage = {
    riskLevel,
    recommendations: recommendations.length > 0 ? recommendations : ["No anomalies detected. Continue lifestyle recommendations."],
    referral
  };

  writeDB(db);
  return res.json(session.triage);
});

app.get("/api/dashboard", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  const userSessions = db.sessions.filter(s => s.userId === req.userId);

  const completedCount = userSessions.length;
  const criticalCount = userSessions.filter(s => s.triage?.riskLevel === "Critical" || s.triage?.riskLevel === "High").length;
  
  return res.json({
    totalScreenings: completedCount,
    criticalCount,
    lastScreeningDate: userSessions.length > 0 ? userSessions[userSessions.length - 1].date : null,
    recentSessions: userSessions.slice(-5).reverse().map(s => ({
      id: s.id,
      date: s.date,
      patientName: s.patient.name,
      riskLevel: s.triage?.riskLevel || "Low",
      completedModules: Object.keys(s.results)
    }))
  });
});

app.get("/api/history", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  const userSessions = db.sessions.filter(s => s.userId === req.userId);
  return res.json(
    userSessions.reverse().map(s => ({
      id: s.id,
      date: s.date,
      patientName: s.patient.name,
      riskLevel: s.triage?.riskLevel || "Low",
      completedModules: Object.keys(s.results)
    }))
  );
});

app.get("/api/history/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const session = db.sessions.find(s => s.id === id && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }
  return res.json(session);
});

app.get("/api/trends", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  const userSessions = db.sessions.filter(s => s.userId === req.userId);
  
  const trends = userSessions.map(s => ({
    date: s.date.split("T")[0],
    xrayScore: s.results.xray?.score || 0,
    skinScore: s.results.skin?.score || 0,
    diabetesScore: s.results.diabetes?.score || 0,
    mentalHealthScore: s.results.mentalHealth?.score || 0,
  }));

  return res.json(trends);
});

app.get("/api/report/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const session = db.sessions.find(s => s.id === id && s.userId === req.userId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }
  return res.json(session);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
