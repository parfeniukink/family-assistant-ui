import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "react-hot-toast";
import { TOKENS } from "./styles/tokens.ts";

const TOAST_BASE_STYLE: React.CSSProperties = {
  background: "rgba(139, 119, 80, 0.15)",
  border: `1.5px solid ${TOKENS.INK_FADED}`,
  color: TOKENS.INK,
  borderRadius: TOKENS.RADIUS,
  fontFamily: "inherit",
  zIndex: 10000,
};

const TOAST_SUCCESS_STYLE: React.CSSProperties = {
  background: "rgba(74, 122, 74, 0.2)",
  border: `1.5px solid ${TOKENS.ACCENT_GREEN}`,
  color: TOKENS.ACCENT_GREEN,
};

const TOAST_ERROR_STYLE: React.CSSProperties = {
  background: "rgba(138, 74, 74, 0.2)",
  border: `1.5px solid ${TOKENS.ACCENT_RED}`,
  color: TOKENS.ACCENT_RED,
};

export function App() {
  const isMobile = window.innerWidth < 600;
  const position = isMobile ? "top-center" : "bottom-right";

  return (
    <>
      <React.Suspense fallback={<div className="page-loading">Loading…</div>}>
        <RouterProvider router={router} />
      </React.Suspense>

      <Toaster
        toastOptions={{
          duration: 5000,
          position: position,
          removeDelay: 1000,
          style: TOAST_BASE_STYLE,
          success: {
            duration: 5000,
            position: position,
            removeDelay: 1000,
            style: TOAST_SUCCESS_STYLE,
          },
          error: {
            duration: 5000,
            position: position,
            removeDelay: 1000,
            style: TOAST_ERROR_STYLE,
          },
        }}
      />
    </>
  );
}
