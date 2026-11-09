"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function InsertRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/sign-in");
    } else if (session.user?.role?.toUpperCase() === "ADMIN") {
      router.replace("/admin/dashboard/data/insert");
    } else {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-black text-white">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
      <p className="text-zinc-400 text-sm">Redirecting to appropriate panel...</p>
    </div>
  );
}
