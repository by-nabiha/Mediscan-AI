import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckSquare, ShieldCheck, AlertCircle, Save, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useScreeningSession } from "@/contexts/ScreeningSessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { createMutationFn } from "@/lib/api-client";
import type { TriageResult, Scan, DiseaseScores } from "@/types";

const triageMutationFn = createMutationFn<DiseaseScores, TriageResult>("/screening/triage");
const saveScanMutationFn = createMutationFn<Partial<Scan>, Scan>("/scans");

export default function Triage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const {
    scores,
    intakeId,
    xrayConditions,
    skinConditions,
    clearSession,
  } = useScreeningSession();

  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const triageMutation = useMutation({ mutationFn: triageMutationFn });
  const saveScanMutation = useMutation({ mutationFn: saveScanMutationFn });

  // Get active scores count
  const activeScores = Object.entries(scores).filter(([_, val]) => val !== null);

  const handleRunTriage = () => {
    triageMutation.mutate(
      { data: scores },
      {
        onSuccess: (data) => {
          setTriageResult(data);
          toast.success("Triage analysis compiled successfully");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Triage analysis failed");
        },
      },
    );
  };

  const handleSaveResult = () => {
    if (!triageResult) return;

    const payload: Partial<Scan> = {
      triageDecision: triageResult.decision,
      urgencyLevel: triageResult.urgencyLevel,
      compositeScore: triageResult.compositeScore,
      thresholdsCrossed: triageResult.thresholdsCrossed,
      isCrisisOverride: triageResult.isCrisisOverride,
      explanation: triageResult.explanation,
      diseaseScores: scores,
      intakeId: intakeId,
      xrayConditions: xrayConditions,
      skinConditions: skinConditions,
    };

    saveScanMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("Screening result saved to history");
          clearSession();
          setLocation("/dashboard");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save result");
        },
      },
    );
  };

  // Banner styling helpers
  const getBannerStyles = (decision: string) => {
    switch (decision) {
      case "no_care":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "routine_care":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "urgent_care":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "multi_condition_emergency":
        return "bg-red-50 text-red-800 border-red-200";
      case "crisis_override":
        return "bg-rose-900 text-rose-50 border-rose-950";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getDecisionTitle = (decision: string) => {
    switch (decision) {
      case "no_care":
        return "No Care Needed";
      case "routine_care":
        return "Routine Care Recommended";
      case "urgent_care":
        return "Urgent Care Required";
      case "multi_condition_emergency":
        return "Multi-Condition Emergency";
      case "crisis_override":
        return "Mental Health Crisis - Seek Help Now";
      default:
        return "General Triage Completed";
    }
  };

  const getUrgencyBadgeColor = (level: string) => {
    switch (level) {
      case "none":
        return "bg-green-100 text-green-800";
      case "routine":
        return "bg-amber-100 text-amber-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      case "emergency":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Navigation Link */}
        <button
          onClick={() => setLocation("/screening")}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Screening Hub</span>
        </button>

        {/* Phase 1 - Score Review */}
        {!triageResult && (
          <div className="space-y-6">
            <div className="text-center md:text-left mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Triage Portal
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
                {t("triage.title")}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Review your collected clinical scores before submitting them for composite triage calculations.
              </p>
            </div>

            {/* Scores Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* X-Ray */}
              <Card className="border border-border">
                <CardContent className="p-5 flex flex-col justify-between h-36">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">Chest X-Ray</span>
                    <span className="text-xs text-primary font-semibold">Vision Model</span>
                  </div>
                  {scores.xray !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {Math.round(scores.xray * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">confidence score</span>
                      </div>
                      <Progress value={scores.xray * 100} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Module not tested.</span>
                  )}
                </CardContent>
              </Card>

              {/* Skin */}
              <Card className="border border-border">
                <CardContent className="p-5 flex flex-col justify-between h-36">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">Skin Lesion</span>
                    <span className="text-xs text-primary font-semibold">Vision Model</span>
                  </div>
                  {scores.skin !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {Math.round(scores.skin * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">confidence score</span>
                      </div>
                      <Progress value={scores.skin * 100} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Module not tested.</span>
                  )}
                </CardContent>
              </Card>

              {/* Diabetes */}
              <Card className="border border-border">
                <CardContent className="p-5 flex flex-col justify-between h-36">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">Diabetes Risk</span>
                    <span className="text-xs text-primary font-semibold">Symptoms Calculator</span>
                  </div>
                  {scores.diabetes !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {Math.round(scores.diabetes * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">risk level confidence</span>
                      </div>
                      <Progress value={scores.diabetes * 100} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Module not tested.</span>
                  )}
                </CardContent>
              </Card>

              {/* Mental Health */}
              <Card className="border border-border">
                <CardContent className="p-5 flex flex-col justify-between h-36">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">Mental Health</span>
                    <span className="text-xs text-primary font-semibold">NLP Analyzer</span>
                  </div>
                  {scores.mentalHealth !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {Math.round(scores.mentalHealth * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">severity indicator</span>
                      </div>
                      <Progress value={scores.mentalHealth * 100} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Module not tested.</span>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Run Triage */}
            <div className="pt-6 text-center">
              <Button
                size="lg"
                onClick={handleRunTriage}
                disabled={triageMutation.isPending || activeScores.length === 0}
                className="w-full font-bold cursor-pointer gap-2"
              >
                <span>{t("triage.run")}</span>
              </Button>
              {activeScores.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please complete at least one screening module before calculating triage.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phase 2 - Triage Results */}
        {triageResult && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Screening Results
              </span>
              <h1 className="text-3xl font-bold tracking-tight mt-1 text-foreground">
                Triage Assessment
              </h1>
            </div>

            {/* Large Prominent Decision Banner */}
            <div className={`border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${getBannerStyles(triageResult.decision)}`}>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Calculated Triage Decision
                </span>
                <h2 className="text-2xl font-black tracking-tight">
                  {getDecisionTitle(triageResult.decision)}
                </h2>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-current/25 ${getUrgencyBadgeColor(triageResult.urgencyLevel)}`}>
                  {triageResult.urgencyLevel}
                </span>
              </div>
            </div>

            {/* Composite Score & Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Composite Score Card (Only rendered if applicable) */}
              {triageResult.compositeScore !== null && (
                <Card className="md:col-span-1 border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground">Composite Index</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted/60"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * triageResult.compositeScore) / 100}
                          className="text-primary transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-foreground">
                        {Math.round(triageResult.compositeScore)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-4 font-medium">Weighted severity scale</span>
                  </CardContent>
                </Card>
              )}

              {/* Explanation Text */}
              <Card className={`border border-border ${triageResult.compositeScore !== null ? "md:col-span-2" : "col-span-3"}`}>
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-muted-foreground">Clinical Narrative Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm sm:text-base leading-relaxed text-foreground/90">
                  {triageResult.explanation}
                </CardContent>
              </Card>
            </div>

            {/* Overrides Table */}
            {triageResult.overrides && triageResult.overrides.length > 0 && (
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span>Crossed Thresholds & Overrides</span>
                  </CardTitle>
                  <CardDescription>
                    The following conditions exceeded typical clinical warning thresholds and triggered priority triage levels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-foreground">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Target Module</th>
                          <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Assessed Score</th>
                          <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Warning Limit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {triageResult.overrides.map((override, i) => (
                          <tr key={i} className="hover:bg-muted/10">
                            <td className="px-6 py-4 font-semibold capitalize">{override.disease}</td>
                            <td className="px-6 py-4 text-right font-bold text-rose-600">{Math.round(override.score * 100)}%</td>
                            <td className="px-6 py-4 text-right text-muted-foreground">{Math.round(override.threshold * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Bar */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setTriageResult(null)}
                className="w-full sm:w-auto cursor-pointer"
                disabled={saveScanMutation.isPending}
              >
                Modify Module Scores
              </Button>

              <Button
                onClick={handleSaveResult}
                disabled={saveScanMutation.isPending}
                className="w-full sm:w-auto font-bold cursor-pointer gap-2"
              >
                <Save className="h-4 w-4" />
                <span>{saveScanMutation.isPending ? "Saving results..." : "Save Screening Result"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
