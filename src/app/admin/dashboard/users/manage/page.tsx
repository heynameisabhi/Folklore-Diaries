"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, RefreshCw, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/useAuth";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function ManageUsersPage() {
  useAuth(["admin"]); // Only admins can access this page

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [popupType, setPopupType] = useState<"STATUS" | "DELETE" | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // Prevent hydration mismatch — only render dynamic UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use useQuery for proper data fetching (not useMutation)
  const { data: users = [], isLoading: isFetching } = useQuery<UserAccount[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/users/get");
      return response.data;
    },
    enabled: mounted, // only fetch after client mounts
  });

  // Filter: hide admins, apply search
  const filteredUsers = users.filter((user) => {
    if (user.role?.toUpperCase() === "ADMIN") return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.name || "").toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  const toggleUserStatus = useMutation({
    mutationFn: async (user: UserAccount) => {
      const updatedStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      await axios.put("/api/users/toggle-user-status/", {
        status: updatedStatus,
        userId: user.id,
      });
      return { ...user, status: updatedStatus };
    },
    onSuccess: (updatedUser) => {
      // Optimistically update the cache
      queryClient.setQueryData<UserAccount[]>(["users"], (prev = []) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      toast.success("User status updated successfully.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || error?.message || "Error updating user status.";
      toast.error(message);
    },
  });

  const { mutate: syncUsers, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/users/sync");
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Refresh the list
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || error?.message || "Sync failed.";
      toast.error(message);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      await axios.delete(`/api/users/delete?userId=${userId}`);
      return userId;
    },
    onSuccess: (deletedUserId) => {
      queryClient.setQueryData<UserAccount[]>(["users"], (prev = []) =>
        prev.filter((u) => u.id !== deletedUserId)
      );
      toast.success("User permanently deleted.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || error?.message || "Error deleting user.";
      toast.error(message);
    },
  });

  return (
    <div
      style={{
        ["--mup-bg" as any]: "#F3EEE0",
        ["--mup-surface" as any]: "#FDFBF4",
        ["--mup-sunk" as any]: "#EAE2CC",
        ["--mup-line" as any]: "#D9CFB3",
        ["--mup-accent" as any]: "#8A5A00",
        ["--mup-accent-soft" as any]: "#F3E3B8",
        ["--mup-ink" as any]: "#1B2A1F",
        ["--mup-muted" as any]: "#56655A",
        color: "var(--mup-ink)",
      }}
      className="mup-scope flex flex-col gap-5 pt-4 sm:pt-8 px-4 sm:px-6 pb-20 max-w-6xl mx-auto h-full overflow-y-auto"
    >
      <style>{`
        .mup-scope {
          color: var(--mup-ink) !important;
        }
        .mup-scope [data-slot="card"],
        .mup-scope .bg-card,
        .mup-scope [class*="bg-zinc-9"] {
          background-color: var(--mup-surface) !important;
          border-color: var(--mup-line) !important;
          color: var(--mup-ink) !important;
        }
        .mup-scope [class*="bg-zinc-8"],
        .mup-scope [class*="bg-zinc-7"] {
          background-color: var(--mup-sunk) !important;
          border-color: var(--mup-line) !important;
          color: var(--mup-ink) !important;
        }
        .mup-scope [class*="border-zinc-"] {
          border-color: var(--mup-line) !important;
        }
        .mup-scope .text-white,
        .mup-scope [class*="text-zinc-1"],
        .mup-scope [class*="text-zinc-2"],
        .mup-scope [class*="text-zinc-3"] {
          color: var(--mup-ink) !important;
        }
        .mup-scope [class*="text-zinc-4"],
        .mup-scope [class*="text-zinc-5"] {
          color: var(--mup-muted) !important;
        }
        .mup-scope input {
          background-color: #FFFFFF !important;
          border-color: var(--mup-line) !important;
          color: var(--mup-ink) !important;
        }
        .mup-scope table,
        .mup-scope th,
        .mup-scope td {
          border-color: var(--mup-line) !important;
          color: var(--mup-ink) !important;
        }
        .mup-scope thead,
        .mup-scope thead tr,
        .mup-scope .bg-zinc-800 {
          background-color: var(--mup-sunk) !important;
        }
        .mup-scope tr:hover {
          background-color: var(--mup-bg) !important;
        }
        .mup-scope .fixed.inset-0.z-50 {
          background-color: rgba(27, 42, 31, 0.45) !important;
        }
      `}</style>

      <div>
        <h1
          style={{ fontFamily: '"Fraunces", Georgia, serif', color: "var(--mup-ink)" }}
          className="text-2xl sm:text-3xl font-semibold tracking-tight"
        >
          User Access Governance
        </h1>
        <p style={{ color: "var(--mup-muted)" }} className="text-xs sm:text-sm mt-0.5">
          Review, activate, block, or delete system accounts in the Folklore Diaries repository.
        </p>
      </div>

      <Card className="bg-[#FDFBF4] border border-[#D9CFB3] text-[#1B2A1F] shadow-xs rounded-2xl">
        <CardHeader className="border-b border-[#D9CFB3] pb-4">
          <CardTitle className="font-serif font-bold text-xl text-[#1B2A1F]">Users List</CardTitle>
          <CardDescription className="text-[#56655A]">
            Manage existing users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#56655A]" />
              <Input
                placeholder="Search by name or ID..."
                className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] pl-9 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Sync button — only rendered after mount to avoid hydration mismatch */}
            {mounted && (
              <Button
                onClick={() => syncUsers()}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-white border border-[#D9CFB3] text-[#1B2A1F] hover:bg-[#EAE2CC] rounded-xl cursor-pointer shadow-xs"
                title="Sync users from Supabase Auth to DB"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isSyncing && "animate-spin")}
                />
                {isSyncing ? "Syncing..." : "Sync"}
              </Button>
            )}
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-10 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#EAE2CC]">
                <TableRow className="border-[#D9CFB3] hover:bg-[#EAE2CC]">
                  <TableHead className="text-[#1B2A1F] font-semibold">Name</TableHead>
                  <TableHead className="text-[#1B2A1F] font-semibold">Email</TableHead>
                  <TableHead className="text-[#1B2A1F] font-semibold">Role</TableHead>
                  <TableHead className="text-[#1B2A1F] font-semibold">Status</TableHead>
                  <TableHead className="text-[#1B2A1F] font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[#56655A]">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-[#D9CFB3] hover:bg-[#F3EEE0]/60"
                    >
                      <TableCell className="font-medium text-[#1B2A1F]">{user.name}</TableCell>
                      <TableCell className="text-[#56655A]">{user.email}</TableCell>
                      <TableCell className="text-[#1B2A1F] font-medium">{user.role}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.status === "ACTIVE"
                              ? "bg-[#D5E6D3] text-[#3F7A4B] border border-[#3F7A4B]/30"
                              : "bg-[#F6E2CF] text-[#B4531A] border border-[#B4531A]/30"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          className={cn(
                            "cursor-pointer rounded-lg text-xs font-semibold",
                            user.status === "ACTIVE"
                              ? "bg-[#F6E2CF] text-[#B4531A] hover:bg-[#B4531A] hover:text-white"
                              : "bg-[#D5E6D3] text-[#3F7A4B] hover:bg-[#3F7A4B] hover:text-white"
                          )}
                          onClick={() => {
                            setSelectedUser(user);
                            setPopupType("STATUS");
                            setIsPopupOpen(true);
                          }}
                        >
                          {user.status === "ACTIVE" ? "Block" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="bg-[#F6E2CF] text-[#B4531A] hover:bg-[#B4531A] hover:text-white cursor-pointer p-2 rounded-lg"
                          onClick={() => {
                            setSelectedUser(user);
                            setPopupType("DELETE");
                            setIsPopupOpen(true);
                          }}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isPopupOpen && selectedUser && popupType && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(27,42,31,0.5)] backdrop-blur-xs p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#FDFBF4] border border-[#D9CFB3] p-6 rounded-2xl text-[#1B2A1F] max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-serif font-bold mb-3 text-[#1B2A1F]">
              {popupType === "STATUS" ? "Confirm Status Change" : "Confirm Delete User"}
            </h2>
            <p className="text-sm text-[#56655A]">
              Are you sure you want to {popupType === "STATUS" ? "change status of" : "permanently delete"}{" "}
              <b className="text-[#1B2A1F]">{selectedUser.name}</b>?
            </p>
            {popupType === "DELETE" && (
              <p className="text-xs text-[#B4531A] bg-[#F6E2CF]/60 p-3 rounded-xl border border-[#F6E2CF] mt-3">
                This will completely remove them from the database and they will no longer be able to log in.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-[#D9CFB3] bg-white text-[#1B2A1F] hover:bg-[#EAE2CC] rounded-xl cursor-pointer"
                onClick={() => {
                  setIsPopupOpen(false);
                  setPopupType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#B4531A] text-white hover:opacity-90 rounded-xl cursor-pointer shadow-xs"
                onClick={() => {
                  if (popupType === "STATUS") {
                    toggleUserStatus.mutate(selectedUser);
                  } else if (popupType === "DELETE") {
                    deleteUser.mutate(selectedUser.id);
                  }
                  setIsPopupOpen(false);
                  setPopupType(null);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
