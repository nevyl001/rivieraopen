"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Trophy,
  Image,
  Activity,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/players", label: "Players", icon: Users },
    { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/admin/gallery", label: "Gallery", icon: Image },
    { href: "/admin/audit-log", label: "Audit Log", icon: Activity },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-2"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>

            <Link
              href="/admin/dashboard"
              className="flex items-center px-2 text-lg sm:text-xl font-bold text-blue-600"
              aria-label="Riviera Open Admin Dashboard"
            >
              <span className="hidden sm:inline">Riviera Open Admin</span>
              <span className="sm:hidden">RO Admin</span>
            </Link>

            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2 lg:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4 mr-1 lg:mr-2" aria-hidden="true" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop logout button */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
              aria-label={loggingOut ? "Logging out" : "Logout from admin"}
            >
              <LogOut className="w-4 h-4 mr-1 lg:mr-2" aria-hidden="true" />
              <span className="hidden lg:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden border-t border-gray-200 bg-white"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors disabled:opacity-50"
              aria-label={loggingOut ? "Logging out" : "Logout from admin"}
            >
              <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
