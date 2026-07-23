"use client";

import React, { useState, useEffect } from "react";
import "./globals.css";
import { 
  Building2, 
  LayoutDashboard, 
  Calendar, 
  Mic, 
  FileCheck, 
  MessageSquare, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Sun, 
  Moon,
  LogOut
} from "lucide-react";
import AuthView from "./components/AuthView";
import { authApi } from "./lib/api";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize and check auth
  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      authApi.getMe(savedToken)
        .then((profile) => {
          setUser(profile);
          localStorage.setItem("auth_user", JSON.stringify(profile));
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          setToken(null);
          setUser(null);
        });
    }

    // Check path to set active tab on initial load
    const path = window.location.pathname.split("/").pop();
    if (path) {
      setActiveTab(path);
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    setActiveTab("dashboard");
    window.history.pushState({}, "", "/");
  };

  const navigateTo = (tabName: string) => {
    setActiveTab(tabName);
    window.history.pushState({}, "", `/${tabName === "dashboard" ? "" : tabName}`);
    // Trigger custom popstate-like change for single-page routing mock
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
  };

  // RBAC definitions for front-end modules
  // Citizen: Dashboard, Meetings, RAG Assistant
  // Secretary: Dashboard, Meetings, Record, RAG Assistant
  // Gram Sabha Moderator (Sarpanch): Dashboard, Meetings, Review & Sign, RAG Assistant
  // District Officer: Dashboard, Meetings, Audit Ledger, RAG Assistant
  // Admin: All
  const getRoleAllowedTabs = (role: string): string[] => {
    switch (role) {
      case "Citizen":
        return ["dashboard", "meetings", "chat"];
      case "Secretary":
        return ["dashboard", "meetings", "record", "chat"];
      case "Gram Sabha Moderator":
        return ["dashboard", "meetings", "verify", "chat"];
      case "District Officer":
      case "State Officer":
        return ["dashboard", "meetings", "audit", "chat"];
      case "Admin":
      default:
        return ["dashboard", "meetings", "record", "verify", "chat", "citizen", "audit"];
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "meetings", label: "Meetings & Check-in", icon: Calendar },
    { id: "record", label: "Record / ASR Uploader", icon: Mic },
    { id: "verify", label: "Review & Sign", icon: FileCheck },
    { id: "chat", label: "RAG Assistant", icon: MessageSquare },
    { id: "citizen", label: "Citizen Portal", icon: Search },
    { id: "audit", label: "Audit Ledger", icon: ShieldCheck }
  ];

  // Route guarding check
  useEffect(() => {
    if (user) {
      const allowedTabs = getRoleAllowedTabs(user.role);
      if (activeTab !== "dashboard" && !allowedTabs.includes(activeTab)) {
        navigateTo("dashboard");
      }
    }
  }, [activeTab, user]);

  if (!mounted) return null;

  // Render Login overlay/page if not authenticated
  if (!token || !user) {
    return (
      <html lang="en" className={darkMode ? "dark" : ""}>
        <body className="bg-slate-900 min-h-screen">
          <AuthView onAuthSuccess={handleAuthSuccess} />
        </body>
      </html>
    );
  }

  const allowedTabs = getRoleAllowedTabs(user.role);
  const visibleNavItems = navItems.filter((item) => allowedTabs.includes(item.id));

  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200 min-h-screen flex flex-col">
        {/* Government Style Header Banner */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="bg-gradient-to-r from-amber-500 via-white to-emerald-600 h-1.5 w-full"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo("dashboard")}>
              <div className="bg-indigo-900 text-white p-2.5 rounded-lg flex items-center justify-center shadow-md">
                <Building2 className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">Digital India</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">e-Panchayat Initiative</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  Gram Sabha AI Minutes
                </h1>
              </div>
            </div>

            {/* User Profile Badge & Logout Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
                <UserCheck className="h-4 w-4 text-indigo-500 mr-2" />
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[120px] truncate">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
                title="Log Out / Switch User"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:opacity-85"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Modules
              </div>
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              National Informatics Centre (NIC) & Ministry of Panchayati Raj e-Governance Collaboration.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:underline">Terms of Use</a>
              <span>•</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:underline">RTI Portal</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
