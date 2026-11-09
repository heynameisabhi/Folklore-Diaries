"use client";

import { useAuth } from "@/components/useAuth";
import AISearchView from "@/components/AISearchView";

export default function AdminAISearchPage() {
  useAuth(["admin"]);

  return <AISearchView role="admin" />;
}

