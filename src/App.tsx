import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ExchangePage from "@/pages/ExchangePage";
import WalletPage from "@/pages/WalletPage";
import AdminPage from "@/pages/AdminPage";
import CasinoPage from "@/pages/CasinoPage";
import AviatorPage from "@/pages/AviatorPage";
import PlinkoPage from "@/pages/PlinkoPage";
import CrashPage from "@/pages/CrashPage";
import DicePage from "@/pages/DicePage";
import MinesPage from "@/pages/MinesPage";
import HistoryPage from "@/pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages without sidebar layout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* App pages with sidebar layout */}
            <Route path="/exchange" element={<Layout><ExchangePage /></Layout>} />
            <Route path="/cricket" element={<Layout><ExchangePage sportFilter="cricket" /></Layout>} />
            <Route path="/football" element={<Layout><ExchangePage sportFilter="football" /></Layout>} />
            <Route path="/tennis" element={<Layout><ExchangePage sportFilter="tennis" /></Layout>} />
            <Route path="/casino" element={<Layout><CasinoPage /></Layout>} />
            <Route path="/casino/aviator" element={<Layout><AviatorPage /></Layout>} />
            <Route path="/casino/plinko" element={<Layout><PlinkoPage /></Layout>} />
            <Route path="/casino/crash" element={<Layout><CrashPage /></Layout>} />
            <Route path="/casino/dice" element={<Layout><DicePage /></Layout>} />
            <Route path="/casino/mines" element={<Layout><MinesPage /></Layout>} />
            <Route path="/wallet" element={<Layout><WalletPage /></Layout>} />
            <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
            <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
