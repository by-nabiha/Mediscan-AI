import { Link, useLocation } from "wouter";
import { Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const isReportPage = location.startsWith("/report/");

  // Hide header on report printing to satisfy print stylesheet rules
  return (
    <div className="min-h-screen flex flex-col">
      {!isReportPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/85 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center gap-2 font-bold text-xl text-primary transition-opacity hover:opacity-90"
            >
              <Activity className="h-6 w-6 stroke-[2.5]" />
              <span>MediScan AI</span>
            </Link>

            {/* Right side navigation & controls */}
            <div className="flex items-center gap-6">
              {/* Navigation links for logged in user */}
              {user && (
                <nav className="hidden md:flex items-center gap-5">
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === "/dashboard"
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href="/history"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.startsWith("/history")
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("nav.history")}
                  </Link>
                  <Link
                    href="/trends"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === "/trends"
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("nav.trends")}
                  </Link>
                </nav>
              )}

              {/* Language Selector Pill */}
              <div className="inline-flex rounded-full bg-muted p-1 border border-border/60">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-card text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("ur")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    language === "ur"
                      ? "bg-card text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  UR
                </button>
              </div>

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Mobile Navigation Menu button or links */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="text-sm text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      {t("nav.logout")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="cursor-pointer">
                      {t("nav.register")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      {!isReportPage && (
        <footer className="border-t border-border/60 bg-muted/40 py-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MediScan AI. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}
