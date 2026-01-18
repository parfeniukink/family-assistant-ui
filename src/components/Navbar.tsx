import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useMobile } from "src/context";
import { TOKENS } from "src/styles/tokens";

export function Navbar() {
  const { isMobile } = useMobile();

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
              zIndex: 1000,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "x-large",
            }
          : {}
      }
    >
      <Link to="/finances">{!isMobile ? "FINANCES" : "💰"}</Link>
      <Link to="/insights">{!isMobile ? "INSIGHTS" : "💡"}</Link>
      <Link
        to="#"
        onClick={() => {
          toast("'News' page it not ready yet");
        }}
      >
        {!isMobile ? "NEWS" : "📰"}
      </Link>
      <Link to="/settings">{!isMobile ? "SETTINGS" : "🔧"}</Link>
    </nav>
  );
}
