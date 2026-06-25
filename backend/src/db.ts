import fs from "fs";
import path from "path";

const DB_FILE = path.join(__dirname, "../data/db.json");

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

export interface Patient {
  name: string;
  age: number;
  gender: string;
  symptoms: string;
  medicalHistory: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    glucose?: string;
    bmi?: string;
    insulin?: string;
  };
}

export interface ModuleResult {
  completed: boolean;
  score?: number;
  findings?: string;
  confidence?: number;
  details?: Record<string, any>;
}

export interface ScreeningSession {
  id: number;
  userId: number;
  date: string;
  patient: Patient;
  results: {
    xray?: ModuleResult;
    skin?: ModuleResult;
    diabetes?: ModuleResult;
    mentalHealth?: ModuleResult;
  };
  triage?: {
    riskLevel: "Low" | "Moderate" | "High" | "Critical";
    recommendations: string[];
    referral: string;
  };
}

export interface DBStructure {
  users: User[];
  sessions: ScreeningSession[];
}

const defaultDB: DBStructure = {
  users: [],
  sessions: []
};

export function readDB(): DBStructure {
  if (!fs.existsSync(DB_FILE)) {
    writeDB(defaultDB);
    return defaultDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return defaultDB;
  }
}

export function writeDB(data: DBStructure): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}
