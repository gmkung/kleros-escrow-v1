import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import TransactionView from "./pages/TransactionView";
import NotFound from "./pages/NotFound";
import { WagmiProvider } from 'wagmi'
import { config } from './lib/wagmi'
import Header from "./components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-tron-dark text-white">
            <Header />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/transaction/:id" element={<TransactionView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
