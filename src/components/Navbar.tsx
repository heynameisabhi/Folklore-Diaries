"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import UserAccountNav from "./UserAccountNav";

/* ── Lotus icon symbol matching the wireframe ── */
function LotusIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const isDashboard = pathname.startsWith("/dashboard");

  const themeMode = isAdmin ? "admin" : isDashboard ? "user" : "default";

  return (
    <header
      style={{
        ...(isAdmin
          ? {
              backgroundColor: "#F3EEE0",
              borderBottomColor: "#D9CFB3",
              color: "#1B2A1F",
            }
          : isDashboard
          ? {
              backgroundColor: "#EEF1E6",
              borderBottomColor: "#CFD7C3",
              color: "#1B2A1F",
            }
          : {}),
      }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-200 h-16 border-b",
        !isAdmin && !isDashboard
          ? "bg-black/95 backdrop-blur-md shadow-md border-zinc-900 text-white"
          : "backdrop-blur-md shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link
            href={isAdmin ? "/admin/dashboard" : isDashboard ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 group"
          >
            {isAdmin ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#F3E3B8] border border-[#D9CFB3] flex items-center justify-center text-[#8A5A00] shadow-sm">
                  <LotusIcon size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                    className="text-lg font-bold text-[#1B2A1F] tracking-normal"
                  >
                    Folklore Diaries
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3E3B8] text-[#8A5A00] border border-[#D9CFB3]">
                    Curator
                  </span>
                </div>
              </>
            ) : isDashboard ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#D5E6D3] border border-[#CFD7C3] flex items-center justify-center text-[#1F5A3D] shadow-sm">
                  <LotusIcon size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                    className="text-lg font-bold text-[#1B2A1F] tracking-normal"
                  >
                    Folklore Diaries
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#D5E6D3] text-[#1F5A3D] border border-[#CFD7C3]">
                    Researcher
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-yellow-200 shadow-md">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-green-600 to-white opacity-50 blur-sm" />
                  <LotusIcon size={18} className="text-zinc-950 relative z-10" />
                </div>
                <span className="text-xl text-transparent bg-clip-text bg-gradient-to-tr from-gray-400 to-white font-bold tracking-widest font-sans">
                  Folklore Diaries
                </span>
              </>
            )}
          </Link>

          {/* Right Navigation & Account Dropdown */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <p
                className={`text-xs ${
                  isAdmin || isDashboard ? "text-[#56655A]" : "text-zinc-400"
                }`}
              >
                Loading...
              </p>
            ) : session?.user ? (
              <UserAccountNav
                themeMode={themeMode}
                user={{
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                  role: session.user.role,
                }}
              />
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white shadow-md text-xs sm:text-sm font-medium"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
