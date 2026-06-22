import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Upload, Image as ImageIcon, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useScreeningSession } from "@/contexts/ScreeningSessionContext";
import { createMutationFn } from "@/lib/api-client";
import type { SkinResult } from "@/types";

const skinMutationFn = createMutationFn<{ image: string }, SkinResult>("/screening/skin");

export default function SkinDisease() {
  const [, setLocation] = useLocation();
  const { setScore, setSkinConditions } = useScreeningSession();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const skinMutation = useMutation({ mutationFn: skinMutationFn });

  // Handle selected files
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setPreviewUrl(resultStr);
      // Send only the base64 portion after the comma
      const base64Data = resultStr.split(",")[1];
      setBase64Image(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Generate mock canvas Skin lesion
  const generateSampleSkin = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Warm pinkish/peach skin tone
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(0, 0, 400, 300);

      // Add soft warm undertones
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(120, 80, 80, 0, Math.PI * 2);
      ctx.arc(280, 220, 100, 0, Math.PI * 2);
      ctx.fill();

      // Erythema red border
      ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
      ctx.beginPath();
      ctx.ellipse(200, 150, 65, 45, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      // Inner lesion body (dark brown)
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.ellipse(200, 150, 45, 30, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      // Irregular darker spots (atypical patches)
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(180, 145, 6, 0, Math.PI * 2);
      ctx.arc(215, 155, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const dataUrl = canvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);
    setBase64Image(dataUrl.split(",")[1]);
    toast.success("Generated sample skin lesion photo");
  };

  // Run analysis mutation with progress animation
  const runAnalysis = () => {
    if (!base64Image) {
      toast.error("Please upload or generate a scan first");
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progress bar (0 -> 100%)
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Trigger API call
    skinMutation.mutate(
      { data: { image: base64Image } },
      {
        onSuccess: (data) => {
          setTimeout(() => {
            setScore("skin", data.confidenceScore);
            setSkinConditions(data.conditions);
            toast.success(`Evaluated ${data.conditions.length} potential conditions.`);
            setLocation("/screening");
          }, 1600); // Allow animation to settle
        },
        onError: (err) => {
          clearInterval(interval);
          setAnalyzing(false);
          toast.error(err instanceof Error ? err.message : "Skin analysis failed");
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-10 px-4">
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
            <CardTitle className="text-xl sm:text-2xl font-bold">Skin Disease Evaluation</CardTitle>
            <CardDescription>
              Upload a clear macro photograph of the skin lesion to screen for epidermal irregularities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!previewUrl ? (
              // Upload Zone
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 bg-muted/10 hover:bg-primary/2 transition-all cursor-pointer min-h-[220px] text-center"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Upload className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Click to upload image</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  Drag and drop lesion photographs (PNG or JPG files).
                </p>
                <Button size="sm" variant="secondary" className="mt-4 cursor-pointer">
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              // Preview Zone
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-border bg-black aspect-4/3 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Skin preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center p-6">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
                      <span className="text-sm font-semibold mb-2">Analyzing Skin Surface...</span>
                      <Progress value={analysisProgress} className="h-2 w-48" />
                    </div>
                  )}
                </div>

                {!analyzing && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setPreviewUrl(null);
                        setBase64Image(null);
                      }}
                    >
                      Change File
                    </Button>
                    <Button className="flex-1 cursor-pointer font-semibold" onClick={runAnalysis}>
                      Run Analysis
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Use Sample Helper */}
            {!previewUrl && !analyzing && (
              <div className="flex flex-col items-center justify-center p-4 border border-border bg-muted/20 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Don't have a lesion photo? Test using a system-drawn model.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateSampleSkin}
                  className="cursor-pointer gap-1.5"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Use Sample Skin Photo</span>
                </Button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-3 p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg text-amber-800 text-xs leading-relaxed">
              <AlertTriangle className="h-4.5 w-4.5 stroke-[2.5] text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Clinical Disclaimer:</span> This AI tool acts as an early stage screening aid only. Results do not constitute an official diagnosis or therapeutic recommendation. Please consult a qualified practitioner.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
