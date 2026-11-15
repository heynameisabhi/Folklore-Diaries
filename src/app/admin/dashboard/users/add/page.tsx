"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { RegisterUserAccount } from "@/lib/validators/useraccount";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/components/useAuth";

export default function Page() {
  useAuth(["admin"]); // Only admins can access this page
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [user, setUser] = useState<RegisterUserAccount>({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const { mutate: addUser, isPending } = useMutation({
    mutationFn: async () => {
      const payload: RegisterUserAccount = user;
      const response = await axios.post("/api/users/add", payload);

      return response.data;
    },

    onError: (error: any) => {
      // Extract the actual server error message from axios response
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "There was an error adding the user.";
      toast.error(message);
    },

    onSuccess: () => {
      toast.success("User added successfully.");
      // Reset form so it's clear the action completed
      setUser({ name: "", email: "", password: "", role: "" });
    },
  });

  // Password validation rules
  const passwordRules = {
    length: user.password.length >= 8,
    uppercase: /[A-Z]/.test(user.password),
    lowercase: /[a-z]/.test(user.password),
    number: /[0-9]/.test(user.password),
    special: /[\W_]/.test(user.password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  return (
    <div
      style={{
        ["--aup-bg" as any]: "#F3EEE0",
        ["--aup-surface" as any]: "#FDFBF4",
        ["--aup-sunk" as any]: "#EAE2CC",
        ["--aup-line" as any]: "#D9CFB3",
        ["--aup-accent" as any]: "#8A5A00",
        ["--aup-accent-soft" as any]: "#F3E3B8",
        ["--aup-ink" as any]: "#1B2A1F",
        ["--aup-muted" as any]: "#56655A",
        color: "var(--aup-ink)",
      }}
      className="aup-scope flex flex-col gap-6 px-6 md:px-10 py-10 max-w-3xl mx-auto h-full overflow-y-auto"
    >
      <style>{`
        .aup-scope {
          color: var(--aup-ink) !important;
        }
        .aup-scope [data-slot="card"],
        .aup-scope .bg-card,
        .aup-scope [class*="bg-zinc-9"] {
          background-color: var(--aup-surface) !important;
          border-color: var(--aup-line) !important;
          color: var(--aup-ink) !important;
        }
        .aup-scope [class*="border-zinc-"] {
          border-color: var(--aup-line) !important;
        }
        .aup-scope .text-white,
        .aup-scope [class*="text-zinc-1"],
        .aup-scope [class*="text-zinc-2"],
        .aup-scope [class*="text-zinc-3"] {
          color: var(--aup-ink) !important;
        }
        .aup-scope [class*="text-zinc-4"],
        .aup-scope [class*="text-zinc-5"] {
          color: var(--aup-muted) !important;
        }
        .aup-scope input,
        .aup-scope select {
          background-color: #FFFFFF !important;
          border-color: var(--aup-line) !important;
          color: var(--aup-ink) !important;
        }
        .aup-scope button.bg-emerald-600 {
          background-color: var(--aup-accent) !important;
          color: #ffffff !important;
        }
      `}</style>
      <h1
        style={{ fontFamily: '"Fraunces", Georgia, serif', color: "var(--aup-ink)" }}
        className="text-3xl font-semibold tracking-tight"
      >
        Add New User / Admin
      </h1>

      <Card className="bg-[#FDFBF4] border border-[#D9CFB3] text-[#1B2A1F] shadow-xs rounded-2xl">
        <CardHeader className="border-b border-[#D9CFB3] pb-4">
          <CardTitle className="font-serif font-bold text-xl text-[#1B2A1F]">User Information</CardTitle>
          <CardDescription className="text-[#56655A]">
            Enter the details for the new user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase text-[#1B2A1F] font-semibold">Name</Label>
              <Input
                id="name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Enter name"
                className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase text-[#1B2A1F] font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="user@example.com"
                className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-xs uppercase text-[#1B2A1F] font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#56655A]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  className="pl-10 bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-[#56655A] hover:text-[#1B2A1F] hover:bg-[#EAE2CC] cursor-pointer rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              
              {user.password.length > 0 && (
                <div className="text-xs mt-2 space-y-1 bg-[#EAE2CC]/40 p-3 rounded-xl border border-[#D9CFB3]">
                  <p className={passwordRules.length ? "text-[#3F7A4B] font-medium" : "text-[#56655A]"}>
                    {passwordRules.length ? "✓" : "○"} At least 8 characters
                  </p>
                  <p className={passwordRules.uppercase ? "text-[#3F7A4B] font-medium" : "text-[#56655A]"}>
                    {passwordRules.uppercase ? "✓" : "○"} Uppercase letter
                  </p>
                  <p className={passwordRules.lowercase ? "text-[#3F7A4B] font-medium" : "text-[#56655A]"}>
                    {passwordRules.lowercase ? "✓" : "○"} Lowercase letter
                  </p>
                  <p className={passwordRules.number ? "text-[#3F7A4B] font-medium" : "text-[#56655A]"}>
                    {passwordRules.number ? "✓" : "○"} Number
                  </p>
                  <p className={passwordRules.special ? "text-[#3F7A4B] font-medium" : "text-[#56655A]"}>
                    {passwordRules.special ? "✓" : "○"} Special character
                  </p>
                </div>
              )}
              {user.password.length === 0 && (
                <p className="text-xs text-[#56655A] mt-1">
                  Min 8 chars · uppercase · lowercase · number · special
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs uppercase text-[#1B2A1F] font-semibold">Role</Label>
              <Select
                value={user.role}
                onValueChange={(value) => setUser({ ...user, role: value })}
              >
                <SelectTrigger className="bg-white border-[#D9CFB3] text-[#1B2A1F] rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[#FDFBF4] border border-[#D9CFB3] text-[#1B2A1F]">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-[#D9CFB3] pt-4">
          <Button
            onClick={() => addUser()}
            disabled={
              isPending ||
              !user.name ||
              !user.email ||
              !isPasswordValid ||
              !user.role
            }
            className="px-6 py-2 bg-[#8A5A00] hover:bg-[#704800] text-white font-semibold rounded-xl cursor-pointer shadow-xs transition-all"
          >
            {
              isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding User...
                </>
              ) : (
                "Add User"
              )
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
