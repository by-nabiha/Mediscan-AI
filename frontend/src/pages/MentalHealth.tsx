import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Heart, Phone, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScreeningSession } from "@/contexts/ScreeningSessionContext";
import { createMutationFn } from "@/lib/api-client";
import type { MentalHealthResult } from "@/types";

const mentalHealthMutationFn = createMutationFn<{ text: string }, MentalHealthResult>(
  "/screening/mental-health",
);

export default function MentalHealth() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { setScore } = useScreeningSession();

  const [text, setText] = useState("");
  const [crisisResult, setCrisisResult] = useState<MentalHealthResult | null>(null);

  const mutation = useMutation({ mutationFn: mentalHealthMutationFn });

  // Localization labels
  const labelText =
    language === "ur"
      ? "براہ کرم اپنی موجودہ جذباتی حالت، افکار یا احساسات کو تفصیل سے بیان کریں (کم از کم 20 حروف)"
      : "Please describe your current emotional state, thoughts, or feelings in detail (minimum 20 characters)";

  const placeholderText =
    language === "ur"
      ? "لکھیں کہ آپ حال ہی میں کیسا محسوس کر رہے ہیں..."
      : "Write how you have been feeling recently...";

  const submitText = language === "ur" ? "تجزیہ جمع کروائیں" : "Submit Analysis";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 20) {
      toast.error(
        language === "ur"
          ? "براہ کرم کم از کم 20 حروف لکھیں۔"
          : "Please write at least 20 characters to run analysis.",
      );
      return;
    }

    mutation.mutate(
      { data: { text } },
      {
        onSuccess: (res) => {
          if (res.isCrisis) {
            // Crisis state detected - show crisis overlay and prevent proceeding
            setCrisisResult(res);
            setScore("mentalHealth", res.confidenceScore / 100);
            toast.warning("Crisis Support resources triggered. Please review immediately.");
          } else {
            // Normal path - save score and redirect to ScreeningHub
            setScore("mentalHealth", res.confidenceScore / 100);
            toast.success("Mental health assessment complete.");
            setLocation("/screening");
          }
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Mental health assessment failed",
          );
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Navigation Link */}
        {!crisisResult && (
          <button
            onClick={() => setLocation("/screening")}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Screening Hub</span>
          </button>
        )}

        {/* Crisis Warning Banner */}
        {crisisResult && (
          <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-6 mb-8 text-rose-900 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 fill-rose-600" />
              </div>
              <div className="space-y-3 flex-1">
                <h2 className="text-xl font-bold tracking-tight text-rose-950">
                  You are not alone. Help is available right now.
                </h2>
                <p className="text-sm leading-relaxed text-rose-800">
                  Our clinical screening indicated markers of high immediate distress. We care about your safety and well-being. Please reach out to one of the following helpline support services:
                </p>
                <ul className="space-y-2 mt-4">
                  {crisisResult.crisisResources.map((resource, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 bg-white/70 border border-rose-100 rounded-lg p-3 text-sm font-semibold text-rose-950 shadow-xs"
                    >
                      <Phone className="h-4 w-4 text-rose-600" />
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto font-bold bg-rose-600 hover:bg-rose-700 cursor-pointer"
                    onClick={() => window.open("tel:911")} // Mock call action
                  >
                    Call Emergency Services
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-rose-200 text-rose-800 hover:bg-rose-100/50 cursor-pointer"
                    onClick={() => {
                      setCrisisResult(null);
                      setText("");
                      setLocation("/screening");
                    }}
                  >
                    Exit Screening Hub
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Form */}
        {!crisisResult && (
          <Card className="shadow-lg border border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold">Mental Health Screening</CardTitle>
                  <CardDescription>
                    Self-report distress analyzer using natural language indicators.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="writing-area" className="text-sm font-semibold leading-relaxed">
                    {labelText}
                  </Label>
                  <Textarea
                    id="writing-area"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholderText}
                    rows={6}
                    className="resize-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                      Character count: <span className="font-semibold">{text.length}</span> (minimum 20)
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending || text.trim().length < 20}
                  className="w-full cursor-pointer font-semibold"
                >
                  {mutation.isPending ? "Analyzing text structure..." : submitText}
                </Button>

                {/* Secure Badge */}
                <div className="flex items-center gap-2 justify-center py-2 text-xs text-muted-foreground border-t border-border/40">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Your journal logs are securely processed and never shared.</span>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-3 p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg text-amber-800 text-xs leading-relaxed">
                  <AlertTriangle className="h-4.5 w-4.5 stroke-[2.5] text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Clinical Disclaimer:</span> This AI tool acts as an early stage screening aid only. Results do not constitute an official diagnosis or therapeutic recommendation. Please consult a qualified practitioner.
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
