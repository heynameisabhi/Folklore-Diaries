"use client";

import { useAuth } from "@/components/useAuth";
import ManualSearchView from "@/components/ManualSearchView";

export default function AdminManualSearchPage() {
  useAuth(["admin"]);

  return <ManualSearchView role="admin" />;
}

