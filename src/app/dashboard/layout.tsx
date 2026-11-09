"use client";

import type React from "react";
import { useState } from "react";
import {
  Database,
  ChevronRight,
  LayoutDashboard,
  BrainCircuit,
  Search,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black/50 mt-[64px] relative">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 top-[64px] bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-[calc(100vh-64px)] top-[64px] bg-black flex flex-col border-r border-zinc-800 transition-all duration-300 fixed z-50",
          // Mobile state
          mobileOpen ? "left-0 w-[280px]" : "-left-full md:left-0",
          // Desktop state
          collapsed ? "md:w-[80px]" : "md:w-[300px]"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-md shrink-0">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="ml-3">
                <h2 className="text-white font-semibold text-sm sm:text-base">User Panel</h2>
                <p className="text-xs text-zinc-400">Dashboard</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-emerald-900/50 to-green-900/30 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Dashboard</span>}
          </Link>

          {/* View Drug Data */}
          <Link
            href="/dashboard/data"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              pathname === "/dashboard/data" || pathname === "/dashboard/data/view"
                ? "bg-gradient-to-r from-emerald-900/50 to-green-900/30 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Database className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            {(!collapsed || mobileOpen) && <span>View Drug Data</span>}
          </Link>

          {/* Manual Search Link */}
          <Link
            href="/dashboard/manual-search"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              pathname === "/dashboard/manual-search"
                ? "bg-gradient-to-r from-emerald-900/50 to-green-900/30 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Search className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Manual Search</span>}
          </Link>

          {/* AI Search Link */}
          <Link
            href="/dashboard/ai-search"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              pathname === "/dashboard/ai-search"
                ? "bg-gradient-to-r from-emerald-900/50 to-green-900/30 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <BrainCircuit className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            {(!collapsed || mobileOpen) && <span>AI Search</span>}
          </Link>
        </nav>

        {/* Collapse button (Desktop only) */}
        <div className="p-4 border-t border-zinc-800 hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 rotate-180 mr-2" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 min-w-0 overflow-auto transition-[margin-left] duration-300 h-full flex flex-col",
          collapsed ? "md:ml-[80px]" : "md:ml-[300px]",
          "ml-0"
        )}
      >
        {/* Mobile Subheader Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs cursor-pointer"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span>Navigation Menu</span>
          </button>
          <span className="text-xs text-zinc-400 font-medium">
            Folklore Repository
          </span>
        </div>

        <div className="h-full w-full flex-1">{children}</div>
      </main>
    </div>
  );
}
