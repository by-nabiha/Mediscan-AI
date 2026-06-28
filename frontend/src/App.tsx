import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScreeningSessionProvider } from "@/contexts/ScreeningSessionContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Intake from "@/pages/Intake";
import ScreeningHub from "@/pages/ScreeningHub";
import ChestXray from "@/pages/ChestXray";
import SkinDisease from "@/pages/SkinDisease";
import DiabetesRisk from "@/pages/DiabetesRisk";
import MentalHealth from "@/pages/MentalHealth";
import Triage from "@/pages/Triage";
import Dashboard from "@/pages/Dashboard";
import HistoryList from "@/pages/HistoryList";
import HistoryDetail from "@/pages/HistoryDetail";
import Trends from "@/pages/Trends";
import Report from "@/pages/Report";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mediscan-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <ScreeningSessionProvider>
              <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
                <Switch>
                  {/* Public Routes */}
                <Route path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />

                {/* Protected Routes */}
                <Route path="/intake">
                  {() => <ProtectedRoute component={Intake} />}
                </Route>
                <Route path="/screening">
                  {() => <ProtectedRoute component={ScreeningHub} />}
                </Route>
                <Route path="/screening/xray">
                  {() => <ProtectedRoute component={ChestXray} />}
                </Route>
                <Route path="/screening/skin">
                  {() => <ProtectedRoute component={SkinDisease} />}
                </Route>
                <Route path="/screening/diabetes">
                  {() => <ProtectedRoute component={DiabetesRisk} />}
                </Route>
                <Route path="/screening/mental-health">
                  {() => <ProtectedRoute component={MentalHealth} />}
                </Route>
                <Route path="/triage">
                  {() => <ProtectedRoute component={Triage} />}
                </Route>
                <Route path="/dashboard">
                  {() => <ProtectedRoute component={Dashboard} />}
                </Route>
                <Route path="/history">
                  {() => <ProtectedRoute component={HistoryList} />}
                </Route>
                <Route path="/history/:id">
                  {(params) => (
                    <ProtectedRoute
                      component={() => <HistoryDetail id={Number(params.id)} />}
                    />
                  )}
                </Route>
                <Route path="/trends">
                  {() => <ProtectedRoute component={Trends} />}
                </Route>
                <Route path="/report/:id">
                  {(params) => (
                    <ProtectedRoute
                      component={() => <Report id={Number(params.id)} />}
                    />
                  )}
                </Route>

                {/* Fallback route */}
                <Route>
                  {() => (
                    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
                      <h2 className="text-2xl font-bold text-foreground">
                        Page Not Found
                      </h2>
                      <p className="mt-2 text-muted-foreground">
                        The requested page could not be located.
                      </p>
                    </div>
                  )}
                </Route>
                </Switch>
                <Toaster position="top-right" closeButton richColors />
              </div>
            </ScreeningSessionProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
