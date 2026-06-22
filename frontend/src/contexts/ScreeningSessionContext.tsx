import { createContext, useContext, useState, type ReactNode } from "react";
import type { DiseaseScores, ConditionScore } from "@/types";

interface ScreeningSessionContextValue {
  intakeId: number | null;
  scores: DiseaseScores;
  xrayConditions: ConditionScore[] | null;
  skinConditions: ConditionScore[] | null;
  setIntakeId: (id: number | null) => void;
  setScore: (disease: keyof DiseaseScores, score: number | null) => void;
  setXrayConditions: (conditions: ConditionScore[] | null) => void;
  setSkinConditions: (conditions: ConditionScore[] | null) => void;
  clearSession: () => void;
}

const defaultScores: DiseaseScores = {
  xray: null,
  skin: null,
  diabetes: null,
  mentalHealth: null,
};

const ScreeningSessionContext = createContext<ScreeningSessionContextValue | null>(
  null,
);

export function ScreeningSessionProvider({ children }: { children: ReactNode }) {
  const [intakeId, setIntakeId] = useState<number | null>(null);
  const [scores, setScores] = useState<DiseaseScores>(defaultScores);
  const [xrayConditions, setXrayConditionsState] = useState<
    ConditionScore[] | null
  >(null);
  const [skinConditions, setSkinConditionsState] = useState<
    ConditionScore[] | null
  >(null);

  const setScore = (disease: keyof DiseaseScores, score: number | null) => {
    setScores((prev) => ({
      ...prev,
      [disease]: score,
    }));
  };

  const setXrayConditions = (conditions: ConditionScore[] | null) => {
    setXrayConditionsState(conditions);
  };

  const setSkinConditions = (conditions: ConditionScore[] | null) => {
    setSkinConditionsState(conditions);
  };

  const clearSession = () => {
    setIntakeId(null);
    setScores(defaultScores);
    setXrayConditionsState(null);
    setSkinConditionsState(null);
  };

  return (
    <ScreeningSessionContext.Provider
      value={{
        intakeId,
        scores,
        xrayConditions,
        skinConditions,
        setIntakeId,
        setScore,
        setXrayConditions,
        setSkinConditions,
        clearSession,
      }}
    >
      {children}
    </ScreeningSessionContext.Provider>
  );
}

export function useScreeningSession() {
  const ctx = useContext(ScreeningSessionContext);
  if (!ctx) {
    throw new Error(
      "useScreeningSession must be used within ScreeningSessionProvider",
    );
  }
  return ctx;
}
