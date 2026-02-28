import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Layout from "@/components/Layout";
import ExchangePage from "@/pages/ExchangePage";
import WalletPage from "@/pages/WalletPage";
import AdminPage from "@/pages/AdminPage";
import CasinoPage from "@/pages/CasinoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<ExchangePage />} />
              <Route path="/cricket" element={<ExchangePage sportFilter="cricket" />} />
              <Route path="/football" element={<ExchangePage sportFilter="football" />} />
              <Route path="/casino" element={<CasinoPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
