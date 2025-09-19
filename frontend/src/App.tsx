import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import { NewRegisterPage } from "./pages/NewRegisterPage";
import UnifiedLoginPage from "./pages/UnifiedLoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProfilePage from "./pages/dashboard/ProfilePage";
import SportsRegistrationPage from "./pages/dashboard/SportsRegistrationPage";
import GuardianInfoPage from "./pages/dashboard/GuardianInfoPage";
import MedicalInfoPage from "./pages/dashboard/MedicalInfoPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import ConsentPage from "./pages/dashboard/ConsentPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import NotFound from "./pages/NotFound";

// Institution Panel
import InstitutionLayout from "./layouts/InstitutionLayout";
import InstitutionRegisterPage from "./pages/institution/InstitutionRegisterPage";
import { NewInstitutionRegisterPage } from "./pages/NewInstitutionRegisterPage";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InstitutionStudentManagement from "./pages/institution/InstitutionStudentManagement";
import InstitutionPayments from "./pages/institution/InstitutionPayments";

// Admin Panel
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInstitutions from "./pages/admin/AdminInstitutions";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminSponsorships from "./pages/admin/AdminSponsorships";
import AdminSports from "./pages/admin/AdminSports";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }
  
  // Check if user is admin and redirect accordingly
  const adminSession = localStorage.getItem('adminSession');
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      if (session.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
    } catch (error) {
      console.error('Error parsing admin session:', error);
    }
  }
  
  // Default redirect for non-admin users
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={
              <PublicRoute>
                <NewRegisterPage />
              </PublicRoute>
            } />
            <Route path="/register-old" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <UnifiedLoginPage />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="sports-registration" element={<SportsRegistrationPage />} />
              <Route path="guardian-info" element={<GuardianInfoPage />} />
              <Route path="medical-info" element={<MedicalInfoPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="consent" element={<ConsentPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Institution Panel Routes */}
            <Route path="/institution/register" element={<NewInstitutionRegisterPage />} />
            <Route path="/institution/register-old" element={<InstitutionRegisterPage />} />
            <Route path="/institution" element={<InstitutionLayout />}>
              <Route index element={<InstitutionDashboard />} />
              <Route path="students" element={<InstitutionStudentManagement />} />
              <Route path="payments" element={<InstitutionPayments />} />
            </Route>

            {/* Admin Panel Routes - Protected */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="institutions" element={<AdminInstitutions />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="sponsorships" element={<AdminSponsorships />} />
              <Route path="sports" element={<AdminSports />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;