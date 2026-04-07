import { useIdentity } from "src/context";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { TOKENS } from "src/styles/tokens";

const SKELETON_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: `${TOKENS.SPACE_2} 5%`,
  gap: TOKENS.SPACE_3,
};

const SKELETON_BLOCK_STYLE: React.CSSProperties = {
  background: TOKENS.INK_FADED,
  borderRadius: TOKENS.RADIUS,
  opacity: 0.1,
};

function AuthSkeleton() {
  return (
    <div style={SKELETON_STYLE}>
      <div style={{ ...SKELETON_BLOCK_STYLE, height: 32, opacity: 0.15 }} />
      <div style={{ ...SKELETON_BLOCK_STYLE, height: 200 }} />
      <div style={{ ...SKELETON_BLOCK_STYLE, height: 120 }} />
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
