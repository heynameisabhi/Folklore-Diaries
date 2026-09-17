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
    <div className="flex flex-col gap-4 pt-20 text-zinc-400 px-4">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription className="text-zinc-400">
            Manage existing users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by name or ID..."
                className="bg-zinc-800 border-zinc-700 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Sync button — only rendered after mount to avoid hydration mismatch */}
            {mounted && (
              <Button
                onClick={() => syncUsers()}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer"
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
              <TableHeader className="bg-zinc-800">
                <TableRow className="border-zinc-700 hover:bg-zinc-800">
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Email</TableHead>
                  <TableHead className="text-zinc-400">Role</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-900/30 text-emerald-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          className={cn(
                            "cursor-pointer",
                            user.status === "ACTIVE"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-emerald-900/30 text-emerald-400"
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
                          className="bg-red-950 text-red-500 hover:bg-red-900 hover:text-red-400 cursor-pointer p-2"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50">
          <div className="bg-zinc-900 p-10 rounded-lg text-white w-100">
            <h2 className="text-xl font-bold mb-4">
              {popupType === "STATUS" ? "Confirm Status Change" : "Confirm Delete User"}
            </h2>
            <p>
              Are you sure you want to {popupType === "STATUS" ? "change status of" : "permanently delete"}{" "}
              <b>{selectedUser.name}</b>?
            </p>
            {popupType === "DELETE" && (
              <p className="text-sm text-red-400 mt-2">
                This will completely remove them from the database and they will no longer be able to log in.
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                className="bg-red-900/30 text-red-400 hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  setIsPopupOpen(false);
                  setPopupType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-900/30 text-emerald-400 hover:bg-emerald-700 cursor-pointer"
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
