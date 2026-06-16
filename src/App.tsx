import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Policy from "./pages/Policy";
import Contact from "./pages/Contact";
import ManageLogin from "./pages/manage/ManageLogin";
import ManageDashboard from "./pages/manage/ManageDashboard";
import CreateContent from "./pages/manage/CreateContent";
import ManageContent from "./pages/manage/ManageContent";
import ManageSettings from "./pages/manage/ManageSettings";
import InquiriesList from "./pages/manage/InquiriesList";
import InquiryNew from "./pages/manage/InquiryNew";
import InquiryDetail from "./pages/manage/InquiryDetail";
import ParticipationHistory from "./pages/manage/ParticipationHistory";
import ProtectedRoute from "./components/manage/ProtectedRoute";

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
          <Route path="/policy" element={<Policy />} />
          <Route path="/contact" element={<Contact />} />

          {/* Manage routes */}
          <Route path="/manage/login" element={<ManageLogin />} />
          <Route path="/manage" element={<ProtectedRoute><ManageDashboard /></ProtectedRoute>} />
          <Route path="/manage/create" element={<ProtectedRoute><CreateContent /></ProtectedRoute>} />
          <Route path="/manage/settings" element={<ProtectedRoute><ManageSettings /></ProtectedRoute>} />
          <Route path="/manage/inquiries" element={<ProtectedRoute><InquiriesList /></ProtectedRoute>} />
          <Route path="/manage/inquiries/new" element={<ProtectedRoute><InquiryNew /></ProtectedRoute>} />
          <Route path="/manage/inquiries/:id" element={<ProtectedRoute><InquiryDetail /></ProtectedRoute>} />
          <Route path="/manage/history" element={<ProtectedRoute><ParticipationHistory /></ProtectedRoute>} />
          <Route path="/manage/:contentCode" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
