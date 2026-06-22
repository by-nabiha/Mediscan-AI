import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Language } from "@/types";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "home.title": "Your Trusted Digital Health Companion",
    "home.subtitle":
      "Accessible, precise, and supportive screening for you and your family.",
    "home.start_screening": "Start Screening",
    "nav.dashboard": "Dashboard",
    "nav.history": "History",
    "nav.trends": "Trends",
    "nav.logout": "Log out",
    "nav.login": "Log in",
    "nav.register": "Register",
    "triage.title": "Triage Results",
    "triage.run": "Run Triage",
  },
  ur: {
    "home.title": "آپ کا قابل اعتماد ڈیجیٹل ہیلتھ ساتھی",
    "home.subtitle":
      "آپ اور آپ کے خاندان کے لیے قابل رسائی، درست اور معاون اسکریننگ۔",
    "home.start_screening": "اسکریننگ شروع کریں",
    "nav.dashboard": "ڈیش بورڈ",
    "nav.history": "تاریخ",
    "nav.trends": "رجحانات",
    "nav.logout": "لاگ آؤٹ کریں",
    "nav.login": "لاگ ان کریں",
    "nav.register": "رجسٹر کریں",
    "triage.title": "ٹرائیج کے نتائج",
    "triage.run": "ٹرائیج چلائیں",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string) => translations[language][key] ?? key,
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
