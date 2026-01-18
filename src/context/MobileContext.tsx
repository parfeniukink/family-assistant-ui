import React, { createContext, useContext, useEffect, useState } from "react";

type MobileContextType = {
  isMobile: boolean;
};

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const MobileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 400);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 400);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <MobileContext.Provider value={{ isMobile }}>
      {children}
    </MobileContext.Provider>
  );
};

export function useMobile() {
  const ctx = useContext(MobileContext);
  if (!ctx) throw new Error("useMobile must be used within MobileProvider");
  return ctx;
}
