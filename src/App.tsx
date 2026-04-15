import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ManageLogin from "./pages/manage/ManageLogin";
import ManageDashboard from "./pages/manage/ManageDashboard";
import CreateContent from "./pages/manage/CreateContent";
import ManageContent from "./pages/manage/ManageContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/draw/:contentCode" element={<Index />} />

          {/* Manage routes */}
          <Route path="/manage/login" element={<ManageLogin />} />
          <Route path="/manage" element={<ManageDashboard />} />
          <Route path="/manage/create" element={<CreateContent />} />
          <Route path="/manage/:contentCode" element={<ManageContent />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
