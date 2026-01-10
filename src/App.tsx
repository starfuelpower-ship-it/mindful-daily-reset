import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AmbientProvider } from "@/contexts/AmbientContext";
import { CompanionProvider } from "@/contexts/CompanionContext";
import { MusicProvider } from "@/contexts/MusicContext";
import { QuotesProvider } from "@/contexts/QuotesContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AmbientLayer } from "@/components/AmbientLayer";
import { GlobalAmbientAudio } from "@/components/GlobalAmbientAudio";
import { CatCompanion } from "@/components/CatCompanion";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ThemePreviewReset } from "@/components/ThemePreviewReset";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Premium from "./pages/Premium";
import Stats from "./pages/Stats";
import Groups from "./pages/Groups";
import Journal from "./pages/Journal";
import Onboarding from "./pages/Onboarding";
import HabitManager from "./pages/HabitManager";
import Widgets from "./pages/Widgets";
import Rewards from "./pages/Rewards";
import CatCustomize from "./pages/CatCustomize";
import PointsShop from "./pages/PointsShop";
import GardenShop from "./pages/GardenShop";
import Achievements from "./pages/Achievements";
import Install from "./pages/Install";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ManagePremium from "./pages/ManagePremium";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 2 minutes - reduces unnecessary refetches
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Don't refetch when window regains focus (habits don't change that fast)
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <PremiumProvider>
                <OnboardingProvider>
                  <PointsProvider>
                    <AmbientProvider>
                      <CompanionProvider>
                        <MusicProvider>
                          <QuotesProvider>
                            <ThemePreviewReset />
                            <OfflineIndicator />
                            <AmbientLayer />
                            <GlobalAmbientAudio />
                            <CatCompanion />
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="/premium" element={<Premium />} />
                              <Route path="/stats" element={<Stats />} />
                              <Route path="/groups" element={<Groups />} />
                              <Route path="/journal" element={<Journal />} />
                              <Route path="/onboarding" element={<Onboarding />} />
                              <Route path="/habit-manager" element={<HabitManager />} />
                              <Route path="/widgets" element={<Widgets />} />
                              <Route path="/rewards" element={<Rewards />} />
                              <Route path="/cat" element={<CatCustomize />} />
                              <Route path="/points-shop" element={<PointsShop />} />
                              <Route path="/garden-shop" element={<GardenShop />} />
                              <Route path="/achievements" element={<Achievements />} />
                              <Route path="/install" element={<Install />} />
                              <Route path="/privacy" element={<PrivacyPolicy />} />
                              <Route path="/terms" element={<TermsOfService />} />
                              <Route path="/manage-premium" element={<ManagePremium />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </QuotesProvider>
                        </MusicProvider>
                      </CompanionProvider>
                    </AmbientProvider>
                  </PointsProvider>
                </OnboardingProvider>
              </PremiumProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
