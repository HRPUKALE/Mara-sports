import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AdminSession {
  email: string;
  role: string;
}

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const adminSession = localStorage.getItem('adminSession');
        if (!adminSession) {
          setIsAuthorized(false);
          return;
        }

        const session: AdminSession = JSON.parse(adminSession);
        if (session.email === 'harshadpukale131@gmail.com' && session.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Verifying access...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" replace />;
};