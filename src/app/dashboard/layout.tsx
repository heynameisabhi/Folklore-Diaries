"use client";

import type React from "react";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Database,
  DatabaseZap,
  FileSpreadsheet,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  FileSearch,
  BrainCircuit,
  Search,
  Brain,
  BrainCog,
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

  // currently not required
  // const [userManagementOpen, setUserManagementOpen] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black/50 mt-[64px]">
      {/* Sidebar */}
      <div
        className={cn(
          "h-[calc(100vh-64px)] bg-black flex flex-col border-r border-zinc-800 transition-[width] duration-300 fixed",
          collapsed ? "w-[80px]" : "w-[300px]"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center p-4 border-b border-zinc-800">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-md">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h2 className="text-white font-semibold">User Panel</h2>
              <p className="text-xs text-zinc-400">Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-2">
          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-emerald-900/50 to-green-900/30 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-500 mr-3" />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {/* Insert Drug Data Link */}
          <Link
            href="/dashboard/data/insert"
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              pathname === "/dashboard/data/insert"
                ? "bg-gradient-to-r from-emerald-900/50 to-green-900/30 text-white font-medium"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Database className="w-5 h-5 text-emerald-500 mr-3" />
            {!collapsed && <span>Insert Drug Data</span>}
          </Link>
        </nav>

        {/* Collapse button */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 text-sm text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
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
          "flex-1 min-w-0 overflow-auto transition-[margin-left] duration-300 h-full",
          collapsed ? "ml-[80px]" : "ml-[300px]"
        )}
      >
        <div className="h-full w-full">{children}</div>
      </main>
    </div>
  );
}
