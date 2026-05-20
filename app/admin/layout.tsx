import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminNav from "@/components/admin/AdminNav";
import { adminAuthProvider } from "@/lib/admin/auth/AdminAuthProvider";
import { ToastProvider } from "@/lib/admin/context/ToastContext";
import { CsrfProvider } from "@/lib/admin/context/CsrfContext";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";

export const metadata = {
  title: "Admin - Riviera Open",
  description: "Admin interface for managing Riviera Open content",
};

async function checkAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");

  if (!sessionCookie) {
    return false;
  }

  // Validate session server-side
  const isValid = await adminAuthProvider.validateSession(sessionCookie.value);
  return isValid;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuth();

  // Allow access to login page without authentication
  if (!isAuthenticated) {
    return <div className="admin-light-theme">{children}</div>;
  }

  return (
    <div className="admin-light-theme min-h-screen bg-gray-50">
      <ToastProvider>
        <CsrfProvider>
          <ErrorBoundary>
            <AdminNav />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
              {children}
            </main>
          </ErrorBoundary>
        </CsrfProvider>
      </ToastProvider>
    </div>
  );
}
