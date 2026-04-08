import { Link, useLocation } from "react-router-dom";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";
import { useScrollDirection } from "src/hooks/useScrollDirection";

export function Navbar() {
  const { isMobile } = useMobile();
  const location = useLocation();
  const scrollDirection = useScrollDirection();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const linkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? TOKENS.INK : TOKENS.INK_FADED,
    fontWeight: isActive(path) ? 800 : 600,
    fontSize: "1.3rem",
    padding: "0.5rem 1rem",
    textDecoration: isActive(path) ? "underline" : "none",
    textUnderlineOffset: "6px",
    transition: "all 0.15s",
  });

  const hidden = isMobile && scrollDirection === "down";

  const navClass = isMobile
    ? `navbar-mobile${hidden ? " navbar-mobile--hidden" : ""}`
    : undefined;

  return (
    <nav className={navClass}>
      <Link to="/finances" style={isMobile ? {} : linkStyle("/finances")}>
        {!isMobile ? "RESOURCES" : "\u2609"}
      </Link>
      <Link to="/news" style={isMobile ? {} : linkStyle("/news")}>
        {!isMobile ? "NEWS" : "\u263F"}
      </Link>
      <Link to="/analytics" style={isMobile ? {} : linkStyle("/analytics")}>
        {!isMobile ? "ANALYTICS" : "\u2643"}
      </Link>
      <Link to="/settings" style={isMobile ? {} : linkStyle("/settings")}>
        {!isMobile ? "SETTINGS" : "\u2644"}
      </Link>
    </nav>
  );
}
