"use client";

import type React from "react";
import { useState } from "react";
import {
  Users,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Home,
  BookOpen,
  PlusCircle,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/* ── Lotus icon symbol matching the HTML wireframe ── */
function LotusIcon({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flex: "none" }}
      aria-hidden="true"
    >
      <path d="M12 20C8 17 7 12 12 5c5 7 4 12 0 15z" />
      <path d="M12 20C6 20 3 16 3 11c4 0 7 2 9 9z" />
      <path d="M12 20c6 0 9-4 9-9-4 0-7 2-9 9z" />
    </svg>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(
    pathname.startsWith("/admin/dashboard/users")
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <div
      style={{
        ["--accent" as any]: "#8A5A00",
        ["--accent-soft" as any]: "#F3E3B8",
        ["--bg" as any]: "#F3EEE0",
        ["--sunk" as any]: "#EAE2CC",
        ["--line" as any]: "#D9CFB3",
        ["--surface" as any]: "#FDFBF4",
        ["--ink" as any]: "#1B2A1F",
        ["--muted" as any]: "#56655A",
        ["--serif" as any]: '"Fraunces", Georgia, serif',
        ["--sans" as any]: '"Hind", system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      className="flex h-[calc(100vh-64px)] mt-[64px] relative bg-[var(--bg)] text-[var(--ink)] font-sans"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hind:wght@400;500;600&display=swap');
        .curator-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: background .15s, color .15s;
        }
        .curator-nav-link:hover {
          background: var(--surface);
          color: var(--ink);
        }
        .curator-nav-link.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: inset 3px 0 0 var(--accent);
          font-weight: 600;
        }
        .curator-sub-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: background .15s, color .15s;
        }
        .curator-sub-link:hover {
          background: var(--surface);
          color: var(--ink);
        }
        .curator-sub-link.active {
          background: var(--surface);
          color: var(--accent);
          font-weight: 600;
        }
      `}</style>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 top-[64px] bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar matching aside.side in the curator wireframe */}
      <aside
        style={{
          background: "var(--sunk)",
          borderColor: "var(--line)",
        }}
        className={`h-[calc(100vh-64px)] top-[64px] flex flex-col border-r transition-all duration-300 fixed z-50 p-4 ${
          mobileOpen ? "left-0 w-[260px]" : "-left-full md:left-0"
        } ${collapsed ? "md:w-[80px]" : "md:w-[250px]"}`}
      >
        {/* Brand identity area */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5 px-1 min-w-0">
            <div className="text-[var(--accent)] flex items-center justify-center shrink-0">
              <LotusIcon size={32} />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <b
                  style={{ fontFamily: "var(--serif)" }}
                  className="font-semibold text-[17px] leading-tight block text-[var(--ink)] truncate"
                >
                  Folklore Diaries
                </b>
                <small className="block text-[var(--muted)] text-[12.5px] -mt-0.5">
                  Curator panel
                </small>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {/* Dashboard / Home */}
          <Link
            href="/admin/dashboard"
            onClick={handleLinkClick}
            className={`curator-nav-link ${
              pathname === "/admin/dashboard" ? "active" : ""
            }`}
            title={collapsed ? "Home" : undefined}
          >
            <Home
              className="w-5 h-5 shrink-0"
              style={{
                color:
                  pathname === "/admin/dashboard"
                    ? "var(--accent)"
                    : "currentColor",
              }}
            />
            {(!collapsed || mobileOpen) && <span>Home</span>}
          </Link>

          {/* Formulations Catalog */}
          <Link
            href="/admin/dashboard/data"
            onClick={handleLinkClick}
            className={`curator-nav-link ${
              pathname === "/admin/dashboard/data" ||
              pathname === "/admin/dashboard/data/view"
                ? "active"
                : ""
            }`}
            title={collapsed ? "Formulations" : undefined}
          >
            <BookOpen
              className="w-5 h-5 shrink-0"
              style={{
                color:
                  pathname === "/admin/dashboard/data" ||
                  pathname === "/admin/dashboard/data/view"
                    ? "var(--accent)"
                    : "currentColor",
              }}
            />
            {(!collapsed || mobileOpen) && <span>Formulations</span>}
          </Link>

          {/* Ingest / Add Formulation */}
          <Link
            href="/admin/dashboard/data/insert"
            onClick={handleLinkClick}
            className={`curator-nav-link ${
              pathname.startsWith("/admin/dashboard/data/insert")
                ? "active"
                : ""
            }`}
            title={collapsed ? "Add formulation" : undefined}
          >
            <PlusCircle
              className="w-5 h-5 shrink-0"
              style={{
                color: pathname.startsWith("/admin/dashboard/data/insert")
                  ? "var(--accent)"
                  : "currentColor",
              }}
            />
            {(!collapsed || mobileOpen) && <span>Add formulation</span>}
          </Link>

          {/* User Governance Accordion */}
          <div>
            <button
              onClick={() => setUserManagementOpen(!userManagementOpen)}
              className={`curator-nav-link w-full text-left justify-between cursor-pointer ${
                pathname.startsWith("/admin/dashboard/users") ? "active" : ""
              }`}
              title={collapsed ? "Users" : undefined}
            >
              <div className="flex items-center gap-2.5">
                <Users
                  className="w-5 h-5 shrink-0"
                  style={{
                    color: pathname.startsWith("/admin/dashboard/users")
                      ? "var(--accent)"
                      : "currentColor",
                  }}
                />
                {(!collapsed || mobileOpen) && <span>Users</span>}
              </div>
              {(!collapsed || mobileOpen) && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    userManagementOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {userManagementOpen && (!collapsed || mobileOpen) && (
              <div className="ml-7 mt-1 space-y-1 pl-2 border-l border-[var(--line)]">
                <Link
                  href="/admin/dashboard/users/manage"
                  onClick={handleLinkClick}
                  className={`curator-sub-link ${
                    pathname === "/admin/dashboard/users/manage" ? "active" : ""
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Users</span>
                </Link>
                <Link
                  href="/admin/dashboard/users/add"
                  onClick={handleLinkClick}
                  className={`curator-sub-link ${
                    pathname === "/admin/dashboard/users/add" ? "active" : ""
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Users</span>
                </Link>
              </div>
            )}
          </div>

          {/* Reports */}
          <Link
            href="/admin/dashboard/generate-report"
            onClick={handleLinkClick}
            className={`curator-nav-link ${
              pathname === "/admin/dashboard/generate-report" ? "active" : ""
            }`}
            title={collapsed ? "Reports" : undefined}
          >
            <FileText
              className="w-5 h-5 shrink-0"
              style={{
                color:
                  pathname === "/admin/dashboard/generate-report"
                    ? "var(--accent)"
                    : "currentColor",
              }}
            />
            {(!collapsed || mobileOpen) && <span>Reports</span>}
          </Link>

          {/* Manual Search */}
          <Link
            href="/admin/dashboard/manual-search"
            onClick={handleLinkClick}
            className={`curator-nav-link ${
              pathname === "/admin/dashboard/manual-search" ? "active" : ""
            }`}
            title={collapsed ? "Manual Search" : undefined}
          >
            <Search
              className="w-5 h-5 shrink-0"
              style={{
                color:
                  pathname === "/admin/dashboard/manual-search"
                    ? "var(--accent)"
                    : "currentColor",
              }}
            />
            {(!collapsed || mobileOpen) && <span>Manual search</span>}
          </Link>

          {/* AI Search */}
          <Link
            href="/admin/dashboard/ai-search"
            onClick={handleLinkClick}
            className={`curator-nav-link ${
              pathname === "/admin/dashboard/ai-search" ? "active" : ""
            }`}
            title={collapsed ? "Ask AI" : undefined}
          >
            <Sparkles
              className="w-5 h-5 shrink-0"
              style={{
                color:
                  pathname === "/admin/dashboard/ai-search"
                    ? "var(--accent)"
                    : "currentColor",
              }}
            />
            {(!collapsed || mobileOpen) && <span>Ask AI</span>}
          </Link>
        </nav>

        {/* Collapse button (Desktop only) */}
        <div className="pt-3 border-t border-[var(--line)] hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 text-xs font-medium text-[var(--muted)] rounded-lg hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Collapse sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <main
        className={`flex-1 min-w-0 overflow-auto transition-[margin-left] duration-300 h-full flex flex-col ${
          collapsed ? "md:ml-[80px]" : "md:ml-[250px]"
        } ml-0`}
      >
        {/* Mobile Subheader Bar */}
        <div
          style={{
            background: "var(--sunk)",
            borderColor: "var(--line)",
          }}
          className="md:hidden flex items-center justify-between px-4 py-2.5 border-b sticky top-0 z-30 shrink-0"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: "var(--surface)",
              borderColor: "var(--line)",
              color: "var(--ink)",
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer shadow-sm"
          >
            <Menu className="w-4 h-4 text-[var(--accent)]" />
            <span>Curator Menu</span>
          </button>
          <span className="text-xs font-medium text-[var(--muted)]">
            Curator Console
          </span>
        </div>

        <div className="h-full w-full flex-1">{children}</div>
      </main>
    </div>
  );
}
