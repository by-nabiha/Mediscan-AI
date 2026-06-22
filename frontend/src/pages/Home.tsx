import { Link } from "wouter";
import { ArrowRight, ShieldCheck, HeartHandshake, Eye, Activity, Brain, Image, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Hero Section */}
        <section className="py-20 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Health Analysis</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            {t("home.title")}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/intake" : "/login"}>
              <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer">
                <span>{t("home.start_screening")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {!user && (
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold cursor-pointer">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Screening Modules Grid */}
        <section className="py-16 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Comprehensive Screening Modules</h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Identify potential flags across four key clinical focus areas using deep computer vision and diagnostic models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Chest X-Ray Card */}
            <Card className="flex flex-col h-full hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Chest X-Ray</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  Upload radiographs to inspect for pulmonary anomalies, signs of congestion, and bacterial infiltrations.
                </p>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Computer Vision</span>
              </CardContent>
            </Card>

            {/* Skin Disease Card */}
            <Card className="flex flex-col h-full hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Image className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Skin Disease</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  Analyze skin dermatological photographs to screen for potential lesions, epidermal patches, or atypical moles.
                </p>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Visual Inspection</span>
              </CardContent>
            </Card>

            {/* Diabetes Risk Card */}
            <Card className="flex flex-col h-full hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Diabetes Risk</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  Evaluate metabolic scores using age, physical BMI, and current clinical symptoms of insulin deficiency.
                </p>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Risk Score Calculator</span>
              </CardContent>
            </Card>

            {/* Mental Health Card */}
            <Card className="flex flex-col h-full hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Mental Health</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  Free-form text analysis tool tracking emotional patterns, distress, anxiety indicators, and crisis flags.
                </p>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Natural Language</span>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features / How It Works */}
        <section className="py-16 border-t border-border/40 bg-muted/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold">Why Use MediScan AI</h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                Our platform provides preliminary clinical indicators using modern technologies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Secure & Confidential</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your medical inputs and assessment histories are fully protected.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Compassionate Triage</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Designed with supportive flows and resources in case of urgent crisis triggers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Clear Trend Mapping</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Monitor composite disease indicators and changes over time in a personalized dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
