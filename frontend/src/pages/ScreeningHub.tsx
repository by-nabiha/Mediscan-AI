import { Link } from "wouter";
import { Activity, Brain, Image, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScreeningSession } from "@/contexts/ScreeningSessionContext";

export default function ScreeningHub() {
  const { scores } = useScreeningSession();

  // Determine if at least one score exists in session context
  const hasScores =
    scores.xray !== null ||
    scores.skin !== null ||
    scores.diabetes !== null ||
    scores.mentalHealth !== null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center md:text-left mb-10">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Screening Hub
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
            Select Screening Modules
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            You can run as many disease screening models as needed. The clinical analyzer will cross-reference your results during the final triage calculation.
          </p>
        </div>

        {/* Modules Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* X-Ray Module */}
          <Card className={`relative flex flex-col h-full border transition-all duration-300 ${
            scores.xray !== null
              ? "border-primary/40 bg-primary/2"
              : "border-border hover:border-primary/20 bg-card"
          }`}>
            <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  {scores.xray !== null && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Score: {Math.round(scores.xray * 100)}%</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Chest X-Ray</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Inspect radiological lung scans for symptoms of pneumonia, consolidation, or pulmonary anomalies.
                </p>
              </div>
              <Link href="/screening/xray">
                <Button variant={scores.xray !== null ? "outline" : "default"} className="w-full cursor-pointer">
                  {scores.xray !== null ? "Retest X-Ray" : "Start X-Ray Module"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Skin Disease Module */}
          <Card className={`relative flex flex-col h-full border transition-all duration-300 ${
            scores.skin !== null
              ? "border-primary/40 bg-primary/2"
              : "border-border hover:border-primary/20 bg-card"
          }`}>
            <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Image className="h-5 w-5" />
                  </div>
                  {scores.skin !== null && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Score: {Math.round(scores.skin * 100)}%</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Skin Disease</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Assess dermatological conditions and lesion photographs using visual scanning neural models.
                </p>
              </div>
              <Link href="/screening/skin">
                <Button variant={scores.skin !== null ? "outline" : "default"} className="w-full cursor-pointer">
                  {scores.skin !== null ? "Retest Skin Photo" : "Start Skin Module"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Diabetes Module */}
          <Card className={`relative flex flex-col h-full border transition-all duration-300 ${
            scores.diabetes !== null
              ? "border-primary/40 bg-primary/2"
              : "border-border hover:border-primary/20 bg-card"
          }`}>
            <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="h-5 w-5 animate-pulse" />
                  </div>
                  {scores.diabetes !== null && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Score: {Math.round(scores.diabetes * 100)}%</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Diabetes Risk</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Calculate likelihood indices utilizing symptoms, physical BMI values, and medical records.
                </p>
              </div>
              <Link href="/screening/diabetes">
                <Button variant={scores.diabetes !== null ? "outline" : "default"} className="w-full cursor-pointer">
                  {scores.diabetes !== null ? "Retest Diabetes" : "Start Diabetes Module"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mental Health Module */}
          <Card className={`relative flex flex-col h-full border transition-all duration-300 ${
            scores.mentalHealth !== null
              ? "border-primary/40 bg-primary/2"
              : "border-border hover:border-primary/20 bg-card"
          }`}>
            <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Brain className="h-5 w-5" />
                  </div>
                  {scores.mentalHealth !== null && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Score: {Math.round(scores.mentalHealth * 100)}%</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Mental Health</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Screen for anxiety and urgent crisis scenarios based on free-form writing patterns.
                </p>
              </div>
              <Link href="/screening/mental-health">
                <Button variant={scores.mentalHealth !== null ? "outline" : "default"} className="w-full cursor-pointer">
                  {scores.mentalHealth !== null ? "Retest Mental Health" : "Start Mental Health Module"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footnotes & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl border border-border bg-muted/30 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold">Screening Progress</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {scores.xray !== null && <span className="text-xs bg-card px-2 py-0.5 rounded-sm border border-border text-foreground font-medium">X-Ray</span>}
                {scores.skin !== null && <span className="text-xs bg-card px-2 py-0.5 rounded-sm border border-border text-foreground font-medium">Skin</span>}
                {scores.diabetes !== null && <span className="text-xs bg-card px-2 py-0.5 rounded-sm border border-border text-foreground font-medium">Diabetes</span>}
                {scores.mentalHealth !== null && <span className="text-xs bg-card px-2 py-0.5 rounded-sm border border-border text-foreground font-medium">Mental Health</span>}
                {!hasScores && <span className="text-xs text-muted-foreground">Select a module above to begin.</span>}
              </div>
            </div>
          </div>

          <Link href="/triage">
            <Button disabled={!hasScores} className="w-full sm:w-auto gap-2 font-semibold cursor-pointer">
              <span>Proceed to Triage</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
