import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useAuth = (allowedRoles: string[]) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait until session is no longer loading
    if (status === "loading") return;

    console.log("Current user role:", session?.user?.role);
    console.log("Allowed roles:", allowedRoles);
    
    // If no session at all, redirect to sign-in
    if (!session) {
      router.push("/sign-in");
      return;
    }

    // Check if user is authorized
    const userRole = session?.user?.role?.toLowerCase();

    // Guard: if role is missing from session, don't redirect yet
    if (!userRole) {
      console.warn("Role not found in session — check NextAuth JWT callback");
      return;
    }

    const authorized = allowedRoles.map(r => r.toLowerCase()).includes(userRole);
    setIsAuthorized(authorized);
    
    // If not authorized, redirect
    if (!authorized) {
      router.push("/unauthorized");
    }
  }, [session, status, router, allowedRoles]);

  return { session, status, isAuthorized };
};