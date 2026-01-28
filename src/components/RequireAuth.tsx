import { useIdentity } from "src/context";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useIdentity();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true, state: { from: location } });
    }
  }, [user, isLoading, navigate, location]);

  // Show nothing while checking auth state
  if (isLoading) {
    return null;
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
