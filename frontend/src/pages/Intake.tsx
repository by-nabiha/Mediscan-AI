import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useScreeningSession } from "@/contexts/ScreeningSessionContext";
import { createMutationFn } from "@/lib/api-client";
import type { Intake as IntakeType } from "@/types";

interface IntakePayload {
  primaryConcern: string;
  symptomDuration: string;
  previousEpisodes: boolean;
  currentMedications: string;
  knownAllergies: string;
}

const intakeMutationFn = createMutationFn<IntakePayload, IntakeType>("/intake");

export default function Intake() {
  const [, setLocation] = useLocation();
  const { setIntakeId, clearSession } = useScreeningSession();
  const [step, setStep] = useState(1);

  // Form states
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [previousEpisodes, setPreviousEpisodes] = useState<boolean | null>(null);
  const [currentMedications, setCurrentMedications] = useState("");
  const [knownAllergies, setKnownAllergies] = useState("");

  const intakeMutation = useMutation({ mutationFn: intakeMutationFn });

  const progressPercentage = (step / 5) * 100;

  const handleNext = () => {
    if (step === 1 && !primaryConcern.trim()) {
      toast.error("Please enter your primary concern");
      return;
    }
    if (step === 2 && !symptomDuration.trim()) {
      toast.error("Please specify how long you have had symptoms");
      return;
    }
    if (step === 3 && previousEpisodes === null) {
      toast.error("Please select an option");
      return;
    }
    if (step === 4 && !currentMedications.trim()) {
      toast.error("Please enter medications or 'None'");
      return;
    }

    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!knownAllergies.trim()) {
      toast.error("Please enter allergies or 'None'");
      return;
    }

    const payload: IntakePayload = {
      primaryConcern,
      symptomDuration,
      previousEpisodes: !!previousEpisodes,
      currentMedications,
      knownAllergies,
    };

    // Make sure previous session score artifacts are reset when initiating a new workflow
    clearSession();

    intakeMutation.mutate(
      { data: payload },
      {
        onSuccess: (data) => {
          setIntakeId(data.id);
          toast.success("Intake checklist saved");
          setLocation("/screening");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save intake");
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Patient Intake Portal
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Step {step} of 5
          </span>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2 mb-8" />

        <Card className="shadow-lg border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {step === 1 && "What symptoms or health concerns are you experiencing?"}
              {step === 2 && "How long have these symptoms been present?"}
              {step === 3 && "Have you experienced these symptoms before?"}
              {step === 4 && "Are you currently taking any prescription or OTC medications?"}
              {step === 5 && "Do you have any known medical or drug allergies?"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Please describe what brings you in today in your own words."}
              {step === 2 && "Specify symptom duration (e.g. days, weeks, months)."}
              {step === 3 && "Indicate if this is a recurring condition."}
              {step === 4 && "List any daily pills, supplements, or write 'None'."}
              {step === 5 && "List any foods, latex, or pharmaceuticals you react to, or write 'None'."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 input */}
            {step === 1 && (
              <div className="space-y-2">
                <Input
                  value={primaryConcern}
                  onChange={(e) => setPrimaryConcern(e.target.value)}
                  placeholder="e.g. Sharp pain in chest when breathing deeply, dry cough"
                  className="h-12"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2 input */}
            {step === 2 && (
              <div className="space-y-2">
                <Input
                  value={symptomDuration}
                  onChange={(e) => setSymptomDuration(e.target.value)}
                  placeholder="e.g. 3 days, 2 weeks"
                  className="h-12"
                  autoFocus
                />
              </div>
            )}

            {/* Step 3 input */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPreviousEpisodes(true)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    previousEpisodes === true
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <span className="text-lg font-bold">Yes</span>
                  <span className="text-xs text-muted-foreground mt-1">This is a recurring concern</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviousEpisodes(false)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    previousEpisodes === false
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <span className="text-lg font-bold">No</span>
                  <span className="text-xs text-muted-foreground mt-1">This is the first time</span>
                </button>
              </div>
            )}

            {/* Step 4 input */}
            {step === 4 && (
              <div className="space-y-2">
                <Input
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Lisinopril 10mg daily, or type 'None'"
                  className="h-12"
                  autoFocus
                />
              </div>
            )}

            {/* Step 5 input */}
            {step === 5 && (
              <div className="space-y-2">
                <Input
                  value={knownAllergies}
                  onChange={(e) => setKnownAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, or type 'None'"
                  className="h-12"
                  autoFocus
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={intakeMutation.isPending}
                className="gap-1 cursor-pointer"
              >
                <span>{step === 5 ? "Submit" : "Next"}</span>
                {step === 5 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
