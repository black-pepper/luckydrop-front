import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/manage/ProtectedRoute";

const queryClient = new QueryClient();

const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Policy = lazy(() => import("./pages/Policy"));
const Contact = lazy(() => import("./pages/Contact"));
const ManageLogin = lazy(() => import("./pages/manage/ManageLogin"));
const ManageDashboard = lazy(() => import("./pages/manage/ManageDashboard"));
const CreateContent = lazy(() => import("./pages/manage/CreateContent"));
const ManageContent = lazy(() => import("./pages/manage/ManageContent"));
const ManageSettings = lazy(() => import("./pages/manage/ManageSettings"));
const InquiriesList = lazy(() => import("./pages/manage/InquiriesList"));
const InquiryNew = lazy(() => import("./pages/manage/InquiryNew"));
const InquiryDetail = lazy(() => import("./pages/manage/InquiryDetail"));
const ParticipationHistory = lazy(() => import("./pages/manage/ParticipationHistory"));

const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <p className="text-sm font-medium text-muted-foreground">불러오는 중...</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
