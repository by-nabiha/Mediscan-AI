import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, FileText, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Scan } from "@/types";

interface HistoryDetailProps {
  id: number;
}

export default function HistoryDetail({ id }: HistoryDetailProps) {
  const [, setLocation] = useLocation();

  // Fetch scan detail endpoint using react-query
  const { data: scan, isLoading, error } = useQuery<Scan>({
    queryKey: ["scan-detail", id],
    queryFn: () => api.get<Scan>(`/scans/${id}`),
  });

  const getUrgencyBadgeColor = (level: string) => {
    switch (level) {
      case "none":
        return "bg-green-100 text-green-800 border-green-200";
      case "routine":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "emergency":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

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
        return "Triage Outcome Completed";
    }
  };

  const formatDecisionName = (decision: string) => {
    return decision.replace(/_/g, " ");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !scan) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <h2 className="text-xl font-bold text-destructive">Scan Not Found</h2>
          <p className="text-muted-foreground text-sm mt-1">
            The requested screening record could not be loaded from the server.
          </p>
          <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => setLocation("/history")}>
            Back to History
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Filter out diseases that were not assessed (score is null)
  const assessedDiseases = Object.entries(scan.diseaseScores).filter(
    ([_, score]) => score !== null,
  ) as Array<[string, number]>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Navigation / Actions Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setLocation("/history")}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to History</span>
          </button>
          <Link href={`/report/${scan.id}`}>
            <Button size="sm" className="font-semibold gap-1.5 cursor-pointer">
              <FileText className="h-4 w-4" />
              <span>Generate Report</span>
            </Button>
          </Link>
        </div>

        {/* Date + Urgency Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-muted-foreground">
            Screened on {format(new Date(scan.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
          </span>
        </div>

        {/* Decision Banner */}
        <div className={`border rounded-xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${getBannerStyles(scan.triageDecision)}`}>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">
              Triage Calculation Outcome
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              {getDecisionTitle(scan.triageDecision)}
            </h2>
          </div>
          <div className="shrink-0">
            <span className={`inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-current/25 ${getUrgencyBadgeColor(scan.urgencyLevel)}`}>
              {scan.urgencyLevel}
            </span>
          </div>
        </div>

        {/* Narrative Card */}
        <Card className="border border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Clinical Summary Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base leading-relaxed text-foreground/95">
            {scan.explanation}
          </CardContent>
        </Card>

        {/* Disease Scores Progress Breakdown */}
        <Card className="border border-border mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Disease Modules Breakdown
            </CardTitle>
            <CardDescription>
              Metric severity levels recorded during this screening.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessedDiseases.map(([disease, score]) => {
              // Format disease name
              const label =
                disease === "xray"
                  ? "Chest X-Ray"
                  : disease === "skin"
                  ? "Skin Lesion"
                  : disease === "diabetes"
                  ? "Diabetes Risk"
                  : "Mental Health";

              return (
                <div key={disease} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                    <span className="text-foreground/80">{label}</span>
                    <span>{Math.round(score * 100)}%</span>
                  </div>
                  <Progress value={score * 100} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* X-Ray Conditions Table */}
        {scan.xrayConditions && scan.xrayConditions.length > 0 && (
          <Card className="border border-border mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" />
                <span>Chest X-Ray Condition Findings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-t border-border">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-foreground">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scan.xrayConditions.map((cond, i) => (
                      <tr key={i} className="hover:bg-muted/10">
                        <td className="px-6 py-3.5 font-semibold capitalize">{cond.condition}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-primary">{Math.round(cond.probability * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skin Conditions Table */}
        {scan.skinConditions && scan.skinConditions.length > 0 && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" />
                <span>Skin Lesion Condition Findings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-t border-border">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-foreground">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scan.skinConditions.map((cond, i) => (
                      <tr key={i} className="hover:bg-muted/10">
                        <td className="px-6 py-3.5 font-semibold capitalize">{cond.condition}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-primary">{Math.round(cond.probability * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
