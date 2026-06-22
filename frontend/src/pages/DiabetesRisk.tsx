import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, AlertTriangle, Activity } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useScreeningSession } from "@/contexts/ScreeningSessionContext";
import { createMutationFn } from "@/lib/api-client";
import type { DiabetesResult } from "@/types";

const schema = z.object({
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or less"),
  bmi: z
    .number({ invalid_type_error: "BMI must be a number" })
    .min(10, "BMI must be at least 10")
    .max(70, "BMI must be 70 or less"),
  familyHistory: z.boolean().default(false),
  excessiveThirst: z.boolean().default(false),
  frequentUrination: z.boolean().default(false),
  fatigue: z.boolean().default(false),
  blurredVision: z.boolean().default(false),
  slowHealingWounds: z.boolean().default(false),
  bloodGlucose: z
    .number()
    .min(0, "Blood glucose must be positive")
    .optional()
    .nullable()
    .or(z.literal(NaN)),
});

type FormData = z.infer<typeof schema>;

const diabetesMutationFn = createMutationFn<FormData, DiabetesResult>("/screening/diabetes");

export default function DiabetesRisk() {
  const [, setLocation] = useLocation();
  const { setScore } = useScreeningSession();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      familyHistory: false,
      excessiveThirst: false,
      frequentUrination: false,
      fatigue: false,
      blurredVision: false,
      slowHealingWounds: false,
      bloodGlucose: null,
    },
  });

  const mutation = useMutation({ mutationFn: diabetesMutationFn });

  const onSubmit = (data: FormData) => {
    // Sanitize blood glucose field if empty
    const sanitized = {
      ...data,
      bloodGlucose:
        data.bloodGlucose === null || isNaN(data.bloodGlucose)
          ? undefined
          : data.bloodGlucose,
    };

    mutation.mutate(
      { data: sanitized },
      {
        onSuccess: (res) => {
          setScore("diabetes", res.confidenceScore);
          toast.success(`Screening Complete. Risk level: ${res.riskLevel.toUpperCase()}`);
          setLocation("/screening");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Diabetes assessment failed");
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Navigation Link */}
        <button
          onClick={() => setLocation("/screening")}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Screening Hub</span>
        </button>

        {/* Card */}
        <Card className="shadow-lg border border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Diabetes Risk Assessment</CardTitle>
                <CardDescription>
                  Enter medical stats and check symptoms to compute glycemic risks.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Biometrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g. 45"
                    {...register("age", { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p className="text-xs font-medium text-destructive">{errors.age.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">Body Mass Index (BMI)</Label>
                  <Input
                    id="bmi"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 24.5"
                    {...register("bmi", { valueAsNumber: true })}
                  />
                  {errors.bmi && (
                    <p className="text-xs font-medium text-destructive">{errors.bmi.message}</p>
                  )}
                </div>
              </div>

              {/* Optional Blood Glucose */}
              <div className="space-y-2">
                <Label htmlFor="bloodGlucose">Fast Blood Glucose (mg/dL) - Optional</Label>
                <Input
                  id="bloodGlucose"
                  type="number"
                  placeholder="e.g. 95 (leave empty if unknown)"
                  {...register("bloodGlucose", { valueAsNumber: true })}
                />
                {errors.bloodGlucose && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.bloodGlucose.message}
                  </p>
                )}
              </div>

              {/* Symptom Checklist */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <h4 className="font-bold text-sm text-foreground">Risk Factors & Symptoms</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Family History */}
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <Controller
                      name="familyHistory"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="familyHistory"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="familyHistory" className="cursor-pointer text-xs sm:text-sm font-medium flex-1">
                      Family History of Diabetes
                    </Label>
                  </div>

                  {/* Excessive Thirst */}
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <Controller
                      name="excessiveThirst"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="excessiveThirst"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="excessiveThirst" className="cursor-pointer text-xs sm:text-sm font-medium flex-1">
                      Excessive Thirst (Polydipsia)
                    </Label>
                  </div>

                  {/* Frequent Urination */}
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <Controller
                      name="frequentUrination"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="frequentUrination"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="frequentUrination" className="cursor-pointer text-xs sm:text-sm font-medium flex-1">
                      Frequent Urination (Polyuria)
                    </Label>
                  </div>

                  {/* Fatigue */}
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <Controller
                      name="fatigue"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="fatigue"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="fatigue" className="cursor-pointer text-xs sm:text-sm font-medium flex-1">
                      Unusual Fatigue / Lethargy
                    </Label>
                  </div>

                  {/* Blurred Vision */}
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <Controller
                      name="blurredVision"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="blurredVision"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="blurredVision" className="cursor-pointer text-xs sm:text-sm font-medium flex-1">
                      Blurred Vision
                    </Label>
                  </div>

                  {/* Slow-Healing Wounds */}
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <Controller
                      name="slowHealingWounds"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="slowHealingWounds"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="slowHealingWounds" className="cursor-pointer text-xs sm:text-sm font-medium flex-1">
                      Slow-Healing Cuts or Sores
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={mutation.isPending} className="w-full cursor-pointer mt-4">
                {mutation.isPending ? "Calculating risk score..." : "Submit Assessment"}
              </Button>

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
      </div>
    </AppLayout>
  );
}
