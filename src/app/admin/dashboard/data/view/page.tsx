"use client";

import { useAuth } from "@/components/useAuth";
import ViewDataPage from "@/components/ViewDataPage";

export default function AdminViewDataAliasPage() {
  useAuth(["admin"]);

  return <ViewDataPage role="admin" />;
}

