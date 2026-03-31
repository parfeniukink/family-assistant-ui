import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "react-hot-toast";
import { TOKENS } from "./styles/tokens.ts";

export function App() {
  const position = "top-center";

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="sketchy" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.03"
              numOctaves={4}
              seed={2}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={2.5}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <React.Suspense fallback={<div className="page-loading">Loading…</div>}>
        <RouterProvider router={router} />
      </React.Suspense>

      <Toaster
        toastOptions={{
          duration: 5000,
          position: position,
          removeDelay: 1000,
          style: {
            background: "rgba(139, 119, 80, 0.15)",
            border: `1.5px solid ${TOKENS.INK_FADED}`,
            color: TOKENS.INK,
            borderRadius: TOKENS.RADIUS,
            fontFamily: "inherit",
            zIndex: 10000,
          },

          success: {
            duration: 5000,
            position: position,
            removeDelay: 1000,
            style: {
              background: "rgba(74, 122, 74, 0.2)",
              border: `1.5px solid ${TOKENS.ACCENT_GREEN}`,
              color: TOKENS.ACCENT_GREEN,
            },
          },
          error: {
            duration: 5000,
            position: position,
            removeDelay: 1000,
            style: {
              background: "rgba(138, 74, 74, 0.2)",
              border: `1.5px solid ${TOKENS.ACCENT_RED}`,
              color: TOKENS.ACCENT_RED,
            },
          },
        }}
      />
    </>
  );
}
