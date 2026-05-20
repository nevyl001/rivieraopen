"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface CsrfContextType {
  csrfToken: string | null;
  refreshCsrfToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

export function CsrfProvider({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch("/api/admin/csrf");
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  };

  useEffect(() => {
    fetchCsrfToken();

    // Refresh token every 30 minutes
    const interval = setInterval(fetchCsrfToken, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CsrfContext.Provider
      value={{ csrfToken, refreshCsrfToken: fetchCsrfToken }}
    >
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrf() {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error("useCsrf must be used within a CsrfProvider");
  }
  return context;
}
