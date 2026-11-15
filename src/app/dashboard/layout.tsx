"use client";

import type React from "react";
import { useState } from "react";
import {
  ChevronRight,
  Menu,
  X,
  Home,
  BookOpen,
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

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      exact: true,
    },
    {
      label: "Formulations",
      href: "/dashboard/data",
      icon: BookOpen,
      exact: false,
    },
    {
      label: "Manual search",
      href: "/dashboard/manual-search",
      icon: Search,
      exact: false,
    },
    {
      label: "Ask AI",
      href: "/dashboard/ai-search",
      icon: Sparkles,
      exact: false,
    },
  ];

  return (
    <div
      data-panel="researcher"
      style={{
        ["--bg" as any]: "#EEF1E6",
        ["--surface" as any]: "#FBFCF7",
        ["--sunk" as any]: "#E3E8D8",
        ["--ink" as any]: "#1B2A1F",
        ["--muted" as any]: "#56655A",
        ["--line" as any]: "#CFD7C3",
        ["--accent" as any]: "#1F5A3D",
        ["--accent-ink" as any]: "#fff",
        ["--accent-soft" as any]: "#D5E6D3",
        ["--plant" as any]: "#3F7A4B",
        ["--warn" as any]: "#B4531A",
        ["--warn-soft" as any]: "#F6E2CF",
        ["--serif" as any]: '"Fraunces", Georgia, serif',
        ["--sans" as any]: '"Hind", system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      className="flex h-[calc(100vh-64px)] mt-[64px] relative bg-[var(--bg)] text-[var(--ink)] font-sans researcher-scope"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hind:wght@400;500;600&display=swap');
        
        .researcher-nav-link {
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
        .researcher-nav-link:hover {
          background: var(--surface);
          color: var(--ink);
        }
        .researcher-nav-link.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: inset 3px 0 0 var(--accent);
          font-weight: 600;
        }

        /* ── Unified Researcher Theme Cascading to All User Sub-pages ── */
        [data-panel="researcher"] {
          background-color: var(--bg);
          color: var(--ink);
        }

        /* Convert dark background containers to herbarium surface */
        [data-panel="researcher"] .bg-black,
        [data-panel="researcher"] .bg-zinc-950,
        [data-panel="researcher"] .bg-zinc-950\/70,
        [data-panel="researcher"] .bg-zinc-950\/80,
        [data-panel="researcher"] .bg-zinc-950\/90,
        [data-panel="researcher"] .bg-zinc-900,
        [data-panel="researcher"] .bg-zinc-900\/40,
        [data-panel="researcher"] .bg-zinc-900\/50,
        [data-panel="researcher"] .bg-zinc-900\/60,
        [data-panel="researcher"] .bg-zinc-900\/70,
        [data-panel="researcher"] .bg-zinc-900\/80 {
          background-color: var(--surface) !important;
          color: var(--ink) !important;
        }

        /* Secondary sunks (input backgrounds, secondary pills) */
        [data-panel="researcher"] .bg-zinc-800,
        [data-panel="researcher"] .bg-zinc-800\/50,
        [data-panel="researcher"] .bg-zinc-850 {
          background-color: var(--sunk) !important;
        }

        /* Gradients on sub-pages */
        [data-panel="researcher"] .bg-gradient-to-b.from-black.to-zinc-900,
        [data-panel="researcher"] .bg-gradient-to-r.from-zinc-900.to-zinc-800 {
          background: var(--bg) !important;
        }

        /* Borders across tables, cards, dialogs */
        [data-panel="researcher"] .border-zinc-800,
        [data-panel="researcher"] .border-zinc-700,
        [data-panel="researcher"] .border-zinc-850,
        [data-panel="researcher"] .border-zinc-900,
        [data-panel="researcher"] .border-zinc-800\/80,
        [data-panel="researcher"] .border-zinc-800\/50 {
          border-color: var(--line) !important;
        }

        /* Typography overrides */
        [data-panel="researcher"] .text-white,
        [data-panel="researcher"] .text-zinc-100,
        [data-panel="researcher"] .text-zinc-200,
        [data-panel="researcher"] .text-gray-200 {
          color: var(--ink) !important;
        }

        [data-panel="researcher"] .text-zinc-400,
        [data-panel="researcher"] .text-zinc-500,
        [data-panel="researcher"] .text-zinc-600 {
          color: var(--muted) !important;
        }

        /* Inputs, selects, and textareas */
        [data-panel="researcher"] input:not([type="checkbox"]):not([type="radio"]),
        [data-panel="researcher"] select,
        [data-panel="researcher"] textarea {
          background-color: var(--surface) !important;
          border-color: var(--line) !important;
          color: var(--ink) !important;
        }

        [data-panel="researcher"] input::placeholder,
        [data-panel="researcher"] textarea::placeholder {
          color: var(--muted) !important;
        }

        /* Table header & row styling */
        [data-panel="researcher"] table,
        [data-panel="researcher"] th,
        [data-panel="researcher"] td {
          border-color: var(--line) !important;
          color: var(--ink);
        }
        [data-panel="researcher"] tr:hover {
          background-color: var(--sunk) !important;
        }

        /* Action buttons & badges */
        [data-panel="researcher"] .bg-emerald-600,
        [data-panel="researcher"] .bg-emerald-700 {
          background-color: var(--accent) !important;
          color: var(--accent-ink) !important;
        }

        [data-panel="researcher"] .text-emerald-400,
        [data-panel="researcher"] .text-emerald-500 {
          color: var(--accent) !important;
        }

        [data-panel="researcher"] .bg-emerald-950\/40,
        [data-panel="researcher"] .bg-emerald-950\/50,
        [data-panel="researcher"] .bg-emerald-950\/60,
        [data-panel="researcher"] .bg-emerald-950\/80,
        [data-panel="researcher"] .bg-emerald-500\/10 {
          background-color: var(--accent-soft) !important;
          color: var(--accent) !important;
          border-color: var(--line) !important;
        }
      `}</style>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 top-[64px] bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar matching aside.side in the wireframe */}
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
                  Researcher panel
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
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`researcher-nav-link ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <ItemIcon
                  className="w-5 h-5 shrink-0"
                  style={{ color: isActive ? "var(--accent)" : "currentColor" }}
                />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
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
            <span>Navigation Menu</span>
          </button>
          <span className="text-xs font-medium text-[var(--muted)]">
            Researcher Panel
          </span>
        </div>

        <div className="h-full w-full flex-1">{children}</div>
      </main>
    </div>
  );
}
