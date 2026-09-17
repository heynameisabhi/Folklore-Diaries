"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Extract access token from the URL hash when the page loads
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // The hash looks like #access_token=TOKEN&expires_in=3600&token_type=bearer&type=recovery
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        setAccessToken(token);
      } else {
        toast.error("Invalid reset link. No access token found.");
      }
    } else {
      toast.error("No reset token provided. Please use the link sent to your email.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put("/api/resetPassword", {
        newPassword,
        accessToken,
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to reset password.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold text-emerald-400">Success!</CardTitle>
            <CardDescription className="text-zinc-400">
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-zinc-500 text-sm">
            You can now log in to your account using your new password.
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => router.push("/sign-in")}
            >
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription className="text-zinc-400">
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-zinc-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2 h-5 w-5 text-zinc-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-zinc-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2 h-5 w-5 text-zinc-500" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors mt-2"
              disabled={isLoading || !accessToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Password"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-800 pt-4">
          <Button
            variant="link"
            className="text-zinc-400 hover:text-emerald-400 font-normal p-0 h-auto flex items-center gap-2"
            onClick={() => router.push("/sign-in")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
