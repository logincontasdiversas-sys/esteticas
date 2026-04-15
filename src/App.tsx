import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { GlobalRefreshProvider } from "./hooks/useGlobalRefresh";
import { GlobalDataProvider } from "./hooks/useGlobalData";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import SetPassword from "./pages/SetPassword";
import { SuperAdminDashboard } from "./components/admin/SuperAdminDashboard";
import NotFound from "./pages/NotFound";

const App = () => {
  console.log("[APP] Sistema original restaurado com todas as funcionalidades");
  
  return (
    <GlobalRefreshProvider>
      <AuthProvider>
        <GlobalDataProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/set-password" element={<SetPassword />} />
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/god-mode" element={<SuperAdminDashboard />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              <Toaster />
              <SonnerToaster position="top-right" richColors />
            </div>
          </Router>
        </GlobalDataProvider>
      </AuthProvider>
    </GlobalRefreshProvider>
  );
};

export default App;