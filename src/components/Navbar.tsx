import { Link, useLocation } from "react-router-dom";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";

export function Navbar() {
  const { isMobile } = useMobile();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const linkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? TOKENS.INK : TOKENS.INK_LIGHT,
    fontWeight: isActive(path) ? 700 : 500,
    borderBottom: isActive(path) ? `2px solid ${TOKENS.INK}` : "2px solid transparent",
    padding: "0.3rem 0.6rem",
    borderRadius: "3px",
    transition: "all 0.15s",
  });

  return (
    <nav
      style={
        isMobile
          ? {
              position: "fixed",
              margin: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: "75px",
              background: TOKENS.BG,
              backgroundImage: "url('/textures/parchment.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "bottom",
              zIndex: 1000,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "1.3rem",
              borderTop: TOKENS.BORDER_HEAVY,
              borderBottom: "none",
              borderLeft: "none",
              borderRight: "none",
              borderRadius: 0,
              boxShadow: "none",
              padding: "0.5rem",
            }
          : {}
      }
    >
      <Link to="/finances" style={isMobile ? {} : linkStyle("/finances")}>
        {!isMobile ? "RESOURCES" : "\uD83D\uDCB0"}
      </Link>
      <Link to="/news" style={isMobile ? {} : linkStyle("/news")}>
        {!isMobile ? "NEWS" : "\uD83D\uDCF0"}
      </Link>
      <Link to="/insights" style={isMobile ? {} : linkStyle("/insights")}>
        {!isMobile ? "ANALYTICS" : "\uD83D\uDCA1"}
      </Link>
      <Link to="/settings" style={isMobile ? {} : linkStyle("/settings")}>
        {!isMobile ? "SETTINGS" : "\uD83D\uDD27"}
      </Link>
    </nav>
  );
}
