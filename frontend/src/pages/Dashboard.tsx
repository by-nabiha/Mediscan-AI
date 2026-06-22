import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, ArrowRight, ShieldCheck, Activity, BarChart, Clock } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { DashboardSummary } from "@/types";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch summary endpoint using react-query
  const { data: summary, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get<DashboardSummary>("/dashboard/summary"),
  });

  const getUrgencyBadgeColor = (level: string) => {
    switch (level) {
      case "none":
        return "bg-green-150 text-green-800 border-green-200";
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

  const formatDecisionName = (decision: string) => {
    return decision.replace(/_/g, " ");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 py-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>

          {/* Grid Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !summary) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-destructive">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            An error occurred while connecting to the MediScan clinical database.
          </p>
          <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Derived counts
  const highRiskEvents =
    (summary.urgencyBreakdown?.urgent ?? 0) + (summary.urgencyBreakdown?.emergency ?? 0);

  const urgencyLevels = [
    { key: "emergency", label: "Emergency", count: summary.urgencyBreakdown?.emergency ?? 0, color: "bg-destructive" },
    { key: "urgent", label: "Urgent Care", count: summary.urgencyBreakdown?.urgent ?? 0, color: "bg-orange-500" },
    { key: "routine", label: "Routine Care", count: summary.urgencyBreakdown?.routine ?? 0, color: "bg-amber-500" },
    { key: "none", label: "No Care Needed", count: summary.urgencyBreakdown?.none ?? 0, color: "bg-green-500" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 py-4">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Analyze disease screening indicators and history.
            </p>
          </div>
          <Link href="/intake">
            <Button className="font-semibold gap-1.5 cursor-pointer shadow-md shadow-primary/10">
              <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>New Screening</span>
            </Button>
          </Link>
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Scans */}
          <Card className="border border-border">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Screenings
                </span>
                <p className="text-3xl font-black text-foreground">{summary.totalScans}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BarChart className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Latest Scan Urgency */}
          <Card className="border border-border">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Latest Triage Level
                </span>
                <div>
                  {summary.latestScan ? (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border border-current/10 ${getUrgencyBadgeColor(summary.latestScan.urgencyLevel)}`}>
                      {summary.latestScan.urgencyLevel}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground italic">None</span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: High Risk Events */}
          <Card className="border border-border">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  High Risk Flags
                </span>
                <p className="text-3xl font-black text-rose-600">{highRiskEvents}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Dashboard Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Recent Scans (2/3) */}
          <Card className="lg:col-span-2 border border-border flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Recent Screenings</CardTitle>
                <CardDescription>
                  Your most recent clinical assessments and triage decisions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border">
                {summary.recentScans && summary.recentScans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          <th className="px-6 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                            Triage Decision
                          </th>
                          <th className="px-6 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                            Urgency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {summary.recentScans.map((scan) => (
                          <tr
                            key={scan.id}
                            onClick={() => setLocation(`/history/${scan.id}`)}
                            className="hover:bg-muted/30 transition-all cursor-pointer"
                          >
                            <td className="px-6 py-4 font-medium text-foreground">
                              {format(new Date(scan.createdAt), "MMM d, yyyy")}
                            </td>
                            <td className="px-6 py-4 font-bold text-foreground/80 capitalize">
                              {formatDecisionName(scan.triageDecision)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xxs font-bold uppercase border border-current/5 ${getUrgencyBadgeColor(scan.urgencyLevel)}`}>
                                {scan.urgencyLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <p className="text-sm text-muted-foreground italic">
                      No clinical assessments performed yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
            {summary.recentScans && summary.recentScans.length > 0 && (
              <div className="p-4 border-t border-border bg-muted/10 text-right">
                <Link href="/history" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <span>View All History</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </Card>

          {/* Right Panel: Urgency Breakdown (1/3) */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Urgency Breakdown</CardTitle>
              <CardDescription>
                Screening counts categorised by priority bands.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {urgencyLevels.map((lvl) => {
                const total = summary.totalScans || 1;
                const percentage = (lvl.count / total) * 100;
                return (
                  <div key={lvl.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-foreground/80">{lvl.label}</span>
                      <span className="font-bold text-foreground">
                        {lvl.count} <span className="text-muted-foreground font-medium text-xs">({Math.round(percentage)}%)</span>
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      indicatorClassName={lvl.color}
                      className="h-2"
                    />
                  </div>
                );
              })}

              {/* Secure Notice */}
              <div className="pt-4 border-t border-border flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  All patient records are encrypted locally and fully compliant with data safety standards.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
