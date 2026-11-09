"use client";

import { useAuth } from "@/components/useAuth";
import ViewDataPage from "@/components/ViewDataPage";

export default function AdminViewDataPage() {
  useAuth(["admin"]);

  return <ViewDataPage role="admin" />;
}

