import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, TrendingUp, Info, HelpCircle, Activity } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { TrendsData, TrendPoint } from "@/types";

export default function Trends() {
  const [, setLocation] = useLocation();

  // Fetch score trends using react-query
  const { data: trends, isLoading, error } = useQuery<TrendsData>({
    queryKey: ["scans-trends"],
    queryFn: () => api.get<TrendsData>("/scans/trends"),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !trends) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <h2 className="text-xl font-bold text-destructive">Failed to Load Trends</h2>
          <p className="text-muted-foreground text-sm mt-1">
            An error occurred while loading historical trend charts.
          </p>
          <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </AppLayout>
    );
  }

  const hasData =
    trends.xray.length > 0 ||
    trends.skin.length > 0 ||
    trends.diabetes.length > 0 ||
    trends.mentalHealth.length > 0;

  // Render a specific disease line chart
  const renderChart = (
    title: string,
    points: TrendPoint[],
    lineColor: string,
    description: string,
  ) => {
    // Check if we have at least 2 points to draw a trend line
    if (points.length < 2) {
      return (
        <Card className="border border-border flex flex-col justify-between min-h-[360px]">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center flex-1 bg-muted/10">
            <Info className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-xs font-semibold text-muted-foreground">Insufficient Data</p>
            <p className="text-xxs text-muted-foreground mt-1 max-w-[200px]">
              Complete at least 2 screenings assessing this condition to generate trend lines.
            </p>
          </CardContent>
        </Card>
      );
    }

    // Format coordinates for Recharts mapping score values out of 100
    const chartData = points.map((p) => ({
      ...p,
      dateFormatted: format(new Date(p.createdAt), "MMM d"),
      scorePercentage: Math.round(p.score * 100),
    }));

    return (
      <Card className="border border-border min-h-[360px] shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={500}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={500}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{
                    color: lineColor,
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "#64748b",
                  }}
                  formatter={(value: any) => [`${value}%`, "Severity Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="scorePercentage"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Navigation Link */}
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            <span>Score Trends Over Time</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor chronological changes and severity fluctuations for your clinical screenings.
          </p>
        </div>

        {hasData ? (
          /* Charts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderChart(
              "Chest X-Ray Analysis",
              trends.xray,
              "#0d9488", // Medical teal
              "Pulmonary anomaly confidence mapping history.",
            )}
            {renderChart(
              "Skin Disease Evaluation",
              trends.skin,
              "#e11d48", // Rose red
              "Dermatological lesion probability charts.",
            )}
            {renderChart(
              "Diabetes Risk Assessment",
              trends.diabetes,
              "#d97706", // Amber
              "Glycemic metabolic symptom severity progression.",
            )}
            {renderChart(
              "Mental Health Screening",
              trends.mentalHealth,
              "#4f46e5", // Indigo
              "Distress markers and self-report score patterns.",
            )}
          </div>
        ) : (
          /* Full Empty State */
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border rounded-xl text-center bg-card shadow-xs">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 animate-bounce">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No trends recorded</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[320px] mx-auto leading-relaxed">
              Complete more screenings to see trends. You need at least 2 screenings containing scores to track trends.
            </p>
            <Link href="/intake">
              <Button size="sm" className="mt-5 font-semibold cursor-pointer">
                Start Screening Session
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
