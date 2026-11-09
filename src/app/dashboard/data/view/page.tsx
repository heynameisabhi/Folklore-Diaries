"use client";

import { useAuth } from "@/components/useAuth";
import ViewDataPage from "@/components/ViewDataPage";

export default function UserViewDataAliasPage() {
  useAuth(["user", "admin"]);

  return <ViewDataPage role="user" />;
}

