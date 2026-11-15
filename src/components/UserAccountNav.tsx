"use client";

import type { User } from "next-auth";
import { type FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";

interface UserAccountNavProps {
  user: Pick<User, "name" | "image" | "email" | "role">;
  themeMode?: "admin" | "user" | "default";
}

const UserAccountNav: FC<UserAccountNavProps> = ({ user, themeMode = "default" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    return user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?";
  };

  const isAdmin = themeMode === "admin";
  const isUser = themeMode === "user";

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus:outline-none rounded-full flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-95"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div
          className={`h-9 w-9 rounded-full border flex items-center justify-center font-bold text-sm transition-all duration-200 ${
            isAdmin
              ? "bg-[#F3E3B8] border-[#D9CFB3] text-[#8A5A00] hover:border-[#8A5A00] font-serif shadow-sm"
              : isUser
              ? "bg-[#D5E6D3] border-[#CFD7C3] text-[#1F5A3D] hover:border-[#1F5A3D] font-serif shadow-sm"
              : "bg-zinc-800 border-zinc-700 text-white hover:border-emerald-500"
          }`}
        >
          {user.image ? (
            <img
              src={user.image || "/placeholder.svg"}
              alt="User Avatar"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-12 w-[280px] shadow-2xl rounded-xl border z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-3 ${
            isAdmin
              ? "bg-[#FDFBF4] border-[#D9CFB3] text-[#1B2A1F]"
              : isUser
              ? "bg-[#FBFCF7] border-[#CFD7C3] text-[#1B2A1F]"
              : "bg-zinc-900 border-zinc-800 text-white"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 p-4 border-b ${
              isAdmin
                ? "bg-[#EAE2CC] border-[#D9CFB3]"
                : isUser
                ? "bg-[#E3E8D8] border-[#CFD7C3]"
                : "bg-gradient-to-r from-zinc-900 to-zinc-800 border-zinc-800"
            }`}
          >
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm ${
                isAdmin
                  ? "bg-[#F3E3B8] text-[#8A5A00] border border-[#D9CFB3] font-serif"
                  : isUser
                  ? "bg-[#D5E6D3] text-[#1F5A3D] border border-[#CFD7C3] font-serif"
                  : "bg-emerald-800 text-white"
              }`}
            >
              {user.image ? (
                <img
                  src={user.image || "/placeholder.svg"}
                  alt="User Avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
            <div className="flex flex-col space-y-0.5 leading-tight min-w-0">
              {user.name && (
                <p
                  className={`font-semibold text-sm truncate ${
                    isAdmin || isUser ? "text-[#1B2A1F]" : "text-white"
                  }`}
                >
                  {user.name}
                </p>
              )}
              {user.email && (
                <p
                  className={`text-xs truncate ${
                    isAdmin || isUser ? "text-[#56655A]" : "text-zinc-400"
                  }`}
                >
                  {user.email}
                </p>
              )}
              {user.role && (
                <span
                  className={`inline-block text-[11px] font-medium uppercase tracking-wider mt-0.5 ${
                    isAdmin ? "text-[#8A5A00]" : isUser ? "text-[#1F5A3D]" : "text-emerald-400"
                  }`}
                >
                  {user.role}
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          <ul className="py-2 text-sm font-medium">
            <li>
              <Link
                href={user.role?.toLowerCase() === "admin" ? "/admin/dashboard" : "/dashboard"}
                className={`flex items-center gap-2.5 px-4 py-2 transition-colors ${
                  isAdmin
                    ? "hover:bg-[#F3EEE0] text-[#1B2A1F] hover:text-[#8A5A00]"
                    : isUser
                    ? "hover:bg-[#EEF1E6] text-[#1B2A1F] hover:text-[#1F5A3D]"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard
                  className={`h-4 w-4 ${
                    isAdmin ? "text-[#8A5A00]" : isUser ? "text-[#1F5A3D]" : "text-emerald-500"
                  }`}
                />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className={`flex items-center gap-2.5 px-4 py-2 transition-colors ${
                  isAdmin
                    ? "hover:bg-[#F3EEE0] text-[#1B2A1F] hover:text-[#8A5A00]"
                    : isUser
                    ? "hover:bg-[#EEF1E6] text-[#1B2A1F] hover:text-[#1F5A3D]"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Settings
                  className={`h-4 w-4 ${
                    isAdmin ? "text-[#8A5A00]" : isUser ? "text-[#1F5A3D]" : "text-emerald-500"
                  }`}
                />
                Settings
              </Link>
            </li>
            <div
              className={`my-1.5 border-t ${
                isAdmin ? "border-[#D9CFB3]" : isUser ? "border-[#CFD7C3]" : "border-zinc-800"
              }`}
            />
            <li>
              <button
                onClick={() => signOut({ callbackUrl: `${window.location.origin}/sign-in` })}
                className={`flex items-center gap-2.5 w-full text-left px-4 py-2 cursor-pointer transition-colors ${
                  isAdmin || isUser
                    ? "text-[#B4531A] hover:bg-[#F6E2CF]"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-red-400"
                }`}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserAccountNav;
