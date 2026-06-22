import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ClipboardList, Activity, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Scan } from "@/types";

export default function HistoryList() {
  const [, setLocation] = useLocation();

  // Fetch all user scans
  const { data: scans, isLoading, error } = useQuery<Scan[]>({
    queryKey: ["scans-list"],
    queryFn: () => api.get<Scan[]>("/scans"),
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

  const formatDecisionName = (decision: string) => {
    return decision.replace(/_/g, " ");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !scans) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <h2 className="text-xl font-bold text-destructive">Failed to Load History</h2>
          <p className="text-muted-foreground text-sm mt-1">
            An error occurred while connecting to the medical assessment server.
          </p>
          <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Sort scans by date newest first
  const sortedScans = [...scans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Navigation Link */}
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Title */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-primary" />
            <span>Screening History</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View all medical assessments and calculated triage outcomes compiled for your account.
          </p>
        </div>

        {/* Scans List Table */}
        {sortedScans.length > 0 ? (
          <Card className="border border-border shadow-xs overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Triage Decision</th>
                      <th className="px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Urgency Level</th>
                      <th className="px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Composite Score</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedScans.map((scan) => (
                      <tr
                        key={scan.id}
                        onClick={() => setLocation(`/history/${scan.id}`)}
                        className="hover:bg-muted/20 transition-all cursor-pointer"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {format(new Date(scan.createdAt), "MMM dd, yyyy")}
                          <span className="block text-xxs font-normal text-muted-foreground mt-0.5">
                            {format(new Date(scan.createdAt), "hh:mm a")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground/80 capitalize">
                          {formatDecisionName(scan.triageDecision)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xxs font-bold uppercase border border-current/10 ${getUrgencyBadgeColor(scan.urgencyLevel)}`}>
                            {scan.urgencyLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-foreground">
                          {scan.compositeScore !== null ? `${Math.round(scan.compositeScore)}%` : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">
                          <ArrowRight className="h-4.5 w-4.5 opacity-60 hover:opacity-100 transition-opacity" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-center bg-card shadow-xs">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No screenings yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto leading-relaxed">
              Complete your first health assessment profile to build a screening history log.
            </p>
            <Link href="/intake">
              <Button size="sm" className="mt-5 font-semibold cursor-pointer">
                Start First Screening
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
