import { useIdentity } from "src/context/IdentityContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function AuthSkeleton() {
  return (
    <div className="auth-skeleton">
      <div className="auth-skeleton-block" style={{ height: 32, opacity: 0.15 }} />
      <div className="auth-skeleton-block" style={{ height: 200 }} />
      <div className="auth-skeleton-block" style={{ height: 120 }} />
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useIdentity();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true, state: { from: location } });
    }
  }, [user, isLoading, navigate, location]);

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
