"use client";

import { useAuth } from "@/components/useAuth";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

type UserDetails = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
};

export default function UserDetailPage() {
    useAuth(["admin"]);
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery<UserDetails>({
        queryKey: ["user-details", userId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/admin/users/${userId}`);
                return response.data;
            } catch (err: any) {
                if (err.response?.status === 404) {
                    toast.error("User not found");
                    router.push("/admin/dashboard/users/manage");
                } else if (err.response?.status === 401) {
                    toast.error("Unauthorized access");
                    router.push("/admin/dashboard");
                } else {
                    toast.error("Failed to load user details");
                }
                throw err;
            }
        },
        enabled: !!session && !!userId,
        retry: false,
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
            await axios.put("/api/users/toggle-user-status/", {
                status: newStatus,
                userId: user.id,
            });
            return newStatus;
        },
        onSuccess: (newStatus) => {
            queryClient.setQueryData<UserDetails>(["user-details", userId], (prev) =>
                prev ? { ...prev, status: newStatus || "ACTIVE" } : prev
            );
            toast.success(`User status updated to ${newStatus}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Failed to update user status");
        },
    });

    if (status === "loading" || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
                <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-green-500">Loading user details...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
                <div className="p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">
                        Error Loading User
                    </h2>
                    <p className="text-zinc-400">
                        Could not fetch user details. Please try again.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4 border-zinc-700 text-zinc-300"
                        onClick={() => router.push("/admin/dashboard/users/manage")}
                    >
                        Return to Users List
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-zinc-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">
                                {user.name || "User Account"}
                            </h1>
                            <p className="text-zinc-400 text-sm">Account details and access status</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => toggleStatusMutation.mutate()}
                        disabled={toggleStatusMutation.isPending}
                        className={`cursor-pointer border-zinc-700 ${
                            user.status === "ACTIVE"
                                ? "text-red-400 hover:bg-red-950/40 hover:text-red-300"
                                : "text-green-400 hover:bg-green-950/40 hover:text-green-300"
                        }`}
                    >
                        {toggleStatusMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : user.status === "ACTIVE" ? (
                            <XCircle className="w-4 h-4 mr-2" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        {user.status === "ACTIVE" ? "Block User" : "Activate User"}
                    </Button>
                </div>

                {/* User Info Card */}
                <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-zinc-100">
                            Profile Information
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Registered credentials and access role in Folklore Diaries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3 p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
                                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Full Name</p>
                                    <p className="text-sm font-medium text-zinc-100">{user.name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
                                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-zinc-400">Email Address</p>
                                    <p className="text-sm font-medium text-zinc-100 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
                                <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Assigned Role</p>
                                    <p className="text-sm font-medium text-zinc-100">{user.role || "USER"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
                                <div className="p-2.5 rounded-lg bg-zinc-700/30 text-zinc-300">
                                    {user.status === "ACTIVE" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Account Status</p>
                                    <Badge
                                        variant="outline"
                                        className={`mt-0.5 ${
                                            user.status === "ACTIVE"
                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                : "bg-red-500/20 text-red-400 border-red-500/30"
                                        }`}
                                    >
                                        {user.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                            <span>User ID: <code className="text-zinc-400">{user.id}</code></span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/admin/dashboard/users/manage")}
                                className="text-zinc-400 hover:text-white"
                            >
                                Back to All Users
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
