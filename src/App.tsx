import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AppContext } from "src/context";
import { Toaster } from "react-hot-toast";
import { TOKENS } from "./styles/tokens.ts";

export function App() {
  const isMobile = window.innerWidth < 400;
  const position = isMobile ? "top-center" : "bottom-right";

  return (
    <>
      <AppContext>
        <React.Suspense fallback={<div className="page-loading">Loading…</div>}>
          <RouterProvider router={router} />
        </React.Suspense>
      </AppContext>

      <Toaster
        toastOptions={{
          duration: 5000,
          position: position,
          removeDelay: 1000,

          style: {
            background: TOKENS.BG_YELLOW,
            color: TOKENS.WHITE,
            zIndex: 10000,
          },
          success: {
            style: {
              background: TOKENS.BG_GREEN,
            },
          },
          error: {
            style: {
              background: TOKENS.BG_RED,
            },
          },
        }}
      />
    </>
  );
}
