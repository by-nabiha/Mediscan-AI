import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Printer, ArrowLeft, ShieldAlert, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Scan, User, Intake } from "@/types";

interface ReportProps {
  id: number;
}

// Definition matching data retrieved from report endpoint
interface ReportData {
  id: number;
  scan: Scan;
  user: User;
  intake?: Intake | null;
  createdAt: string;
}

export default function Report({ id }: ReportProps) {
  const [, setLocation] = useLocation();

  // Fetch report details using react-query
  const { data: report, isLoading, error } = useQuery<ReportData>({
    queryKey: ["report-detail", id],
    queryFn: () => api.get<ReportData>(`/reports/${id}`),
  });

  const handlePrint = () => {
    window.print();
  };

  const getUrgencyBannerColor = (level: string) => {
    switch (level) {
      case "none":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "routine":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "urgent":
        return "bg-orange-50 text-orange-800 border-orange-300";
      case "emergency":
        return "bg-red-50 text-red-850 border-red-300";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getScoreBand = (score: number) => {
    if (score < 0.4) return "Low Risk / Concern";
    if (score < 0.7) return "Moderate Risk / Concern";
    return "High Risk / Concern";
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <h2 className="text-xl font-bold text-destructive">Report Failed to Load</h2>
          <p className="text-muted-foreground text-sm mt-1">
            An error occurred while loading this clinical report profile.
          </p>
          <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => setLocation(`/history/${id}`)}>
            Back to Details
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { scan, user, intake, createdAt } = report;

  // Filter out diseases that were not assessed (score is null)
  const assessedDiseases = Object.entries(scan.diseaseScores).filter(
    ([_, score]) => score !== null,
  ) as Array<[string, number]>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 print:p-0 print:py-4">
        {/* Navigation / Actions Bar (Hidden during Print) */}
        <div className="flex items-center justify-between gap-4 print:hidden border-b border-border/60 pb-5">
          <button
            onClick={() => setLocation(`/history/${scan.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Scan details</span>
          </button>

          <Button onClick={handlePrint} className="font-bold gap-1.5 cursor-pointer">
            <Printer className="h-4 w-4" />
            <span>Print / Download</span>
          </Button>
        </div>

        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/80 pb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              MediScan AI Screening Report
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Document Reference ID: MS-{scan.id}-{scan.userId}
            </p>
          </div>
          <div className="text-left sm:text-right text-xs">
            <p className="font-semibold text-foreground">Date Generated</p>
            <p className="text-muted-foreground font-medium mt-0.5">
              {format(new Date(createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
            </p>
          </div>
        </div>

        {/* 2. Patient Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-muted/20 border border-border rounded-xl p-5">
          <div className="space-y-0.5">
            <span className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Patient Name</span>
            <p className="text-sm font-bold text-foreground">{user.name}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Email Address</span>
            <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Age</span>
            <p className="text-sm font-bold text-foreground">{user.age ?? "Not specified"}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Gender</span>
            <p className="text-sm font-bold text-foreground capitalize">{user.gender ?? "Not specified"}</p>
          </div>
        </div>

        {/* 3. Intake Answers (If intake exists) */}
        {intake && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">
              Clinical Intake Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm leading-relaxed">
              <div>
                <span className="font-bold text-foreground/80 block text-xs">Primary Complaint Concern</span>
                <p className="text-muted-foreground mt-0.5">{intake.primaryConcern}</p>
              </div>
              <div>
                <span className="font-bold text-foreground/80 block text-xs">Symptom Duration</span>
                <p className="text-muted-foreground mt-0.5">{intake.symptomDuration}</p>
              </div>
              <div>
                <span className="font-bold text-foreground/80 block text-xs">Previous Episodes</span>
                <p className="text-muted-foreground mt-0.5">{intake.previousEpisodes ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="font-bold text-foreground/80 block text-xs">Active Medications</span>
                <p className="text-muted-foreground mt-0.5">{intake.currentMedications}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-foreground/80 block text-xs">Known Allergies</span>
                <p className="text-muted-foreground mt-0.5">{intake.knownAllergies}</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Triage Decision Banner */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">
            Triage Determination
          </h3>
          <div className={`border rounded-xl p-5 flex items-center justify-between ${getUrgencyBannerColor(scan.urgencyLevel)}`}>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider opacity-85">Calculated Priority level</span>
              <h4 className="text-lg font-black capitalize mt-0.5">
                {scan.triageDecision.replace(/_/g, " ")}
              </h4>
            </div>
            <span className="text-xs font-bold tracking-wider uppercase bg-white/40 border border-current/15 px-3 py-1 rounded-sm">
              Urgency: {scan.urgencyLevel}
            </span>
          </div>
        </div>

        {/* 5. Disease Scores Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">
            Assessed Disease Indicators
          </h3>
          <div className="overflow-hidden border border-border rounded-xl shadow-xs">
            <table className="w-full border-collapse text-left text-sm text-foreground">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Screening Module</th>
                  <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Confidence Score</th>
                  <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Risk Band Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {assessedDiseases.map(([disease, score]) => {
                  const label =
                    disease === "xray"
                      ? "Chest X-Ray"
                      : disease === "skin"
                      ? "Skin Lesion"
                      : disease === "diabetes"
                      ? "Diabetes Risk"
                      : "Mental Health";

                  return (
                    <tr key={disease} className="hover:bg-muted/10">
                      <td className="px-6 py-3.5 font-semibold capitalize">{label}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-foreground">{Math.round(score * 100)}%</td>
                      <td className="px-6 py-3.5 text-right text-muted-foreground text-xs font-semibold">
                        {getScoreBand(score)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Narrative Explanation */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">
            Clinical Explanation narrative
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90 bg-muted/10 border border-border/50 rounded-xl p-5">
            {scan.explanation}
          </p>
        </div>

        {/* 7. Threshold Overrides (if applicable) */}
        {scan.thresholdsCrossed && scan.thresholdsCrossed.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">
              Triggered Overrides & Limits
            </h3>
            <div className="bg-rose-50/40 border border-rose-200 text-rose-900 rounded-xl p-4">
              <p className="text-xs font-bold mb-2 uppercase tracking-wide">Crossed Clinical Thresholds:</p>
              <ul className="list-disc list-inside text-xs space-y-1 font-semibold text-rose-950">
                {scan.thresholdsCrossed.map((threshold, i) => (
                  <li key={i} className="capitalize">
                    {threshold.replace(/_/g, " ")} threshold limit exceeded
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 8. Print Disclaimer Box */}
        <div className="flex gap-4 p-5 bg-amber-50/50 border border-amber-300/80 rounded-xl text-amber-900 text-xs leading-relaxed">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-amber-950 mb-1">IMPORTANT CLINICAL DISCLAIMER</p>
            <p>
              This report is generated by an AI screening tool and is not a medical diagnosis. It is intended as a preliminary screening aid to assist healthcare professionals. Always consult a licensed physician for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>

        {/* print stylesheet hiding buttons and navbar */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white;
              color: black;
            }
            .print\\:hidden {
              display: none !important;
            }
            header, footer {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
            }
          }
        `}} />
      </div>
    </AppLayout>
  );
}
