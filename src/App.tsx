import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AmbientProvider } from "@/contexts/AmbientContext";
import { AmbientLayer } from "@/components/AmbientLayer";
import { AmbientAudioPlayer } from "@/components/AmbientAudioPlayer";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PremiumProvider>
              <AmbientProvider>
                <AmbientLayer />
                <AmbientAudioPlayer />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AmbientProvider>
            </PremiumProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
