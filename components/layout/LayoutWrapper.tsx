"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentTitle } from "@/components/layout/DocumentTitle";
import { LocaleProvider } from "@/lib/contexts/LocaleContext";
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  // Apply light theme class to body for admin routes
  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.add("admin-light-theme");
      document.body.style.backgroundColor = "#f9fafb";
    } else {
      document.body.classList.remove("admin-light-theme");
      document.body.style.backgroundColor = "";
    }

    return () => {
      document.body.classList.remove("admin-light-theme");
      document.body.style.backgroundColor = "";
    };
  }, [isAdminRoute]);

  // For admin routes, render children without the public layout
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For public routes, render with the full layout
  return (
    <LocaleProvider>
      <DocumentTitle />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
