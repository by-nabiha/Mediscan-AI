import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Printer, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Scan, Intake } from "@/types";

interface ReportProps {
  id: number;
}

interface ReportUser {
  id: number;
  name: string;
  email: string;
}

interface ReportData {
  scan: Scan;
  user: ReportUser;
  intake?: Intake | null;
  createdAt: string;
}

const DISEASE_LABELS: Record<string, string> = {
  xray: "Chest X-Ray (Pulmonary Analysis)",
  skin: "Skin Lesion (Dermatological Analysis)",
  diabetes: "Diabetes Risk (Metabolic Assessment)",
  mentalHealth: "Mental Health (Psychological Screening)",
};

const DISEASE_DESCRIPTIONS: Record<string, string> = {
  xray: "AI-powered radiograph analysis for cardiopulmonary pathologies including Pneumonia, Atelectasis, Edema, and Cardiomegaly.",
  skin: "Deep learning evaluation of skin lesions for conditions such as Eczema, Melanoma, Psoriasis, and Basal Cell Carcinoma.",
  diabetes: "Metabolic risk model based on BMI, blood glucose, family history, and symptomatic indicators.",
  mentalHealth: "NLP-based emotional analysis evaluating sadness, anxiety, fear, and crisis signals from self-reported text.",
};

export default function Report({ id }: ReportProps) {
  const [, setLocation] = useLocation();

  const { data: report, isLoading, error } = useQuery<ReportData>({
    queryKey: ["report-detail", id],
    queryFn: () => api.get<ReportData>(`/reports/${id}`),
  });

  const handlePrint = () => {
    window.print();
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "none": return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", badge: "bg-emerald-100 text-emerald-800" };
      case "routine": return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", badge: "bg-amber-100 text-amber-800" };
      case "urgent": return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300", badge: "bg-orange-100 text-orange-800" };
      case "emergency": return { bg: "bg-red-50", text: "text-red-800", border: "border-red-300", badge: "bg-red-100 text-red-800" };
      default: return { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-300", badge: "bg-gray-100 text-gray-800" };
    }
  };

  const getDecisionTitle = (decision: string) => {
    switch (decision) {
      case "no_care": return "No Immediate Care Required";
      case "routine_care": return "Routine Clinical Care Recommended";
      case "urgent_care": return "Urgent Medical Care Required";
      case "multi_condition_emergency": return "Multi-Condition Emergency";
      case "crisis_override": return "Mental Health Crisis — Seek Help Immediately";
      default: return decision.replace(/_/g, " ");
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "no_care": return <CheckCircle2 className="h-7 w-7 text-emerald-600" />;
      case "routine_care": return <AlertTriangle className="h-7 w-7 text-amber-600" />;
      case "urgent_care": return <AlertTriangle className="h-7 w-7 text-orange-600" />;
      case "multi_condition_emergency": return <XCircle className="h-7 w-7 text-red-600" />;
      case "crisis_override": return <XCircle className="h-7 w-7 text-red-700" />;
      default: return <Activity className="h-7 w-7 text-gray-600" />;
    }
  };

  const getRiskBand = (score: number) => {
    if (score < 0.25) return { label: "Low", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score < 0.5) return { label: "Moderate", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (score < 0.75) return { label: "High", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { label: "Critical", color: "text-red-700 bg-red-50 border-red-200" };
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive">Report Failed to Load</h2>
          <p className="text-muted-foreground text-sm mt-2">
            An error occurred while loading this clinical report. The scan data may not be available.
          </p>
          <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => setLocation(`/history/${id}`)}>
            Back to Scan Details
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { scan, user, intake, createdAt } = report;
  const urgencyStyle = getUrgencyColor(scan.urgencyLevel);

  // Only show disease scores that were actually assessed (not null)
  const assessedDiseases = Object.entries(scan.diseaseScores || {}).filter(
    ([_, score]) => score !== null && score !== undefined
  ) as Array<[string, number]>;

  const referenceId = `MS-${String(scan.id).padStart(6, "0")}-${scan.userId}`;

  return (
    <AppLayout>
      {/* Action Bar — hidden during print */}
      <div className="max-w-4xl mx-auto pt-8 px-4 pb-4 print:hidden">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <button
            onClick={() => setLocation(`/history/${scan.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Scan Details</span>
          </button>
          <Button onClick={handlePrint} className="font-bold gap-1.5 cursor-pointer shadow-sm">
            <Printer className="h-4 w-4" />
            <span>Print / Save as PDF</span>
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          REPORT DOCUMENT 
      ══════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-8 print:px-0 print:pb-4 print:space-y-6">

        {/* ─── HEADER ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-primary/20 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                MediScan AI
              </h1>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Clinical Screening Report</p>
            <p className="text-xs text-muted-foreground mt-1">
              Document Reference: <span className="font-mono font-bold text-foreground">{referenceId}</span>
            </p>
          </div>
          <div className="text-left sm:text-right text-xs space-y-0.5">
            <p className="font-bold text-foreground text-sm">Report Generated</p>
            <p className="text-muted-foreground">{format(new Date(createdAt || scan.createdAt), "MMMM dd, yyyy")}</p>
            <p className="text-muted-foreground">{format(new Date(createdAt || scan.createdAt), "'at' hh:mm a")}</p>
          </div>
        </div>

        {/* ─── PATIENT INFORMATION ─── */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-primary inline-block"></span>
            Patient Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/20 border border-border rounded-xl p-5">
            <div>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Full Name</p>
              <p className="text-sm font-bold text-foreground">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Email Address</p>
              <p className="text-sm font-bold text-foreground truncate">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Patient ID</p>
              <p className="text-sm font-bold font-mono text-foreground">USR-{String(scan.userId).padStart(4, "0")}</p>
            </div>
            <div>
              <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Screening Date</p>
              <p className="text-sm font-bold text-foreground">
                {format(new Date(scan.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </section>

        {/* ─── INTAKE INFORMATION (if exists) ─── */}
        {intake && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block"></span>
              Clinical Intake Records
            </h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-1">Primary Complaint</p>
                    <p className="text-sm text-foreground font-medium">{intake.primaryConcern}</p>
                  </div>
                  <div>
                    <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-1">Symptom Duration</p>
                    <p className="text-sm text-foreground font-medium">{intake.symptomDuration}</p>
                  </div>
                  <div>
                    <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-1">Previous Episodes</p>
                    <p className="text-sm text-foreground font-medium">{intake.previousEpisodes ? "Yes — Prior episodes reported" : "No — First occurrence"}</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Medications</p>
                    <p className="text-sm text-foreground font-medium">{intake.currentMedications || "None reported"}</p>
                  </div>
                  <div>
                    <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-1">Known Allergies</p>
                    <p className="text-sm text-foreground font-medium">{intake.knownAllergies || "None reported"}</p>
                  </div>
                  <div>
                    <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider mb-1">Intake Recorded</p>
                    <p className="text-sm text-foreground font-medium">{format(new Date(intake.createdAt), "MMM dd, yyyy 'at' hh:mm a")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── TRIAGE DECISION ─── */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-primary inline-block"></span>
            Triage Determination
          </h2>
          <div className={`border-2 rounded-xl p-6 ${urgencyStyle.bg} ${urgencyStyle.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-4">
                {getDecisionIcon(scan.triageDecision)}
                <div>
                  <p className="text-xxs font-bold uppercase tracking-widest opacity-70 mb-0.5">Clinical Triage Outcome</p>
                  <h3 className={`text-xl font-black ${urgencyStyle.text}`}>{getDecisionTitle(scan.triageDecision)}</h3>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border tracking-widest ${urgencyStyle.badge} border-current/20`}>
                  {scan.urgencyLevel} urgency
                </span>
                {scan.compositeScore !== null && scan.compositeScore !== undefined && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    Composite Score: <strong className="text-foreground">{Math.round(scan.compositeScore)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── DISEASE SCORES TABLE ─── */}
        {assessedDiseases.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block"></span>
              Assessed Disease Indicators ({assessedDiseases.length} of 4 modules run)
            </h2>
            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Screening Module</th>
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-center">Score</th>
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-center">Risk Band</th>
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {assessedDiseases.map(([disease, score]) => {
                    const band = getRiskBand(score);
                    return (
                      <tr key={disease} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground text-xs sm:text-sm">{DISEASE_LABELS[disease] || disease}</p>
                          <p className="text-xxs text-muted-foreground mt-0.5 hidden sm:block">{DISEASE_DESCRIPTIONS[disease]}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xl font-black text-foreground">{Math.round(score * 100)}%</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xxs font-bold border ${band.color}`}>
                            {band.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right hidden sm:table-cell">
                          {score >= 0.75 ? (
                            <span className="text-xxs font-bold text-red-600 uppercase tracking-wide">⚠ Threshold Exceeded</span>
                          ) : score >= 0.5 ? (
                            <span className="text-xxs font-bold text-orange-600 uppercase tracking-wide">⚡ Elevated</span>
                          ) : (
                            <span className="text-xxs font-bold text-emerald-600 uppercase tracking-wide">✓ Within Range</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── X-RAY CONDITIONS TABLE ─── */}
        {scan.xrayConditions && scan.xrayConditions.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block"></span>
              Chest X-Ray Condition Findings
            </h2>
            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Condition</th>
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {scan.xrayConditions.map((cond, i) => (
                    <tr key={i} className="hover:bg-muted/10">
                      <td className="px-5 py-3 font-semibold capitalize">{cond.condition}</td>
                      <td className="px-5 py-3 text-right font-bold text-primary">{Math.round(cond.probability * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── SKIN CONDITIONS TABLE ─── */}
        {scan.skinConditions && scan.skinConditions.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block"></span>
              Skin Lesion Condition Findings
            </h2>
            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Condition</th>
                    <th className="px-5 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {scan.skinConditions.map((cond, i) => (
                    <tr key={i} className="hover:bg-muted/10">
                      <td className="px-5 py-3 font-semibold capitalize">{cond.condition}</td>
                      <td className="px-5 py-3 text-right font-bold text-primary">{Math.round(cond.probability * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── CLINICAL NARRATIVE ─── */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-primary inline-block"></span>
            Clinical Narrative & AI Findings
          </h2>
          <div className="bg-muted/10 border border-border rounded-xl p-6">
            <p className="text-sm leading-relaxed text-foreground/90">{scan.explanation}</p>
          </div>
        </section>

        {/* ─── THRESHOLD CROSSINGS ─── */}
        {scan.thresholdsCrossed && scan.thresholdsCrossed.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-red-400 inline-block"></span>
              Triggered Clinical Thresholds
            </h2>
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wide mb-3">
                The following conditions exceeded warning thresholds and triggered priority triage:
              </p>
              <ul className="space-y-2">
                {scan.thresholdsCrossed.map((threshold, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    {threshold.replace(/_/g, " ")} — threshold exceeded
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── FOOTER DISCLAIMER ─── */}
        <section>
          <div className="flex gap-4 p-5 bg-amber-50/60 border border-amber-300/80 rounded-xl text-amber-900 text-xs leading-relaxed">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950 mb-1">IMPORTANT CLINICAL DISCLAIMER</p>
              <p>
                This report is generated by an AI-powered screening tool and is <strong>not a substitute for a medical diagnosis</strong>.
                It is intended solely as a preliminary screening aid to assist healthcare professionals in prioritizing care.
                All findings must be reviewed and validated by a licensed physician or qualified medical practitioner before any
                clinical decisions are made.
              </p>
            </div>
          </div>
        </section>

        {/* ─── PRINT SIGNATURE LINE ─── */}
        <div className="hidden print:block border-t border-border pt-6 mt-4">
          <div className="grid grid-cols-3 gap-8 text-xs text-muted-foreground">
            <div>
              <div className="border-b border-foreground/30 pb-6 mb-1"></div>
              <p className="font-semibold">Reviewing Clinician Signature</p>
            </div>
            <div>
              <div className="border-b border-foreground/30 pb-6 mb-1"></div>
              <p className="font-semibold">Date of Review</p>
            </div>
            <div>
              <div className="border-b border-foreground/30 pb-6 mb-1"></div>
              <p className="font-semibold">Clinician License Number</p>
            </div>
          </div>
          <p className="text-center text-xxs text-muted-foreground mt-6">
            MediScan AI — {referenceId} — Confidential Patient Record — Not for Unauthorized Distribution
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          header, footer, nav { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .shadow-xs, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          section { break-inside: avoid; }
          table { break-inside: auto; }
          tr { break-inside: avoid; break-after: auto; }
        }
      `}} />
    </AppLayout>
  );
}
