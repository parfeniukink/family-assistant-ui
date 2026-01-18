import { useIdentity } from "src/context";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, token } = useIdentity();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/auth", { replace: true, state: { from: location } });
    }
  });

  return <>{children}</>;
}
