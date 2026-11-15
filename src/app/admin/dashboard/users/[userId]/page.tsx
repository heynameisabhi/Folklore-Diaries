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
            <div className="flex flex-col items-center justify-center w-full min-h-[60vh] bg-[#F3EEE0]">
                <div className="w-12 h-12 border-t-4 border-[#8A5A00] border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-[#8A5A00] font-medium text-sm">Loading user details...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[60vh] bg-[#F3EEE0] p-6">
                <div className="p-8 text-center bg-[#FDFBF4] rounded-2xl border border-[#D9CFB3] shadow-sm max-w-md w-full">
                    <h2 className="text-xl font-serif font-bold text-[#B4531A] mb-2">
                        Error Loading User
                    </h2>
                    <p className="text-[#56655A] text-sm">
                        Could not fetch user details. Please try again.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-5 border-[#D9CFB3] bg-white text-[#1B2A1F] hover:bg-[#EAE2CC] cursor-pointer"
                        onClick={() => router.push("/admin/dashboard/users/manage")}
                    >
                        Return to Users List
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F3EEE0] text-[#1B2A1F] p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#D9CFB3]">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-[#56655A] hover:text-[#1B2A1F] hover:bg-[#EAE2CC] border border-[#D9CFB3] bg-[#FDFBF4] cursor-pointer rounded-xl"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-[#1B2A1F]">
                                {user.name || "User Account"}
                            </h1>
                            <p className="text-[#56655A] text-sm">Account details and access status</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => toggleStatusMutation.mutate()}
                        disabled={toggleStatusMutation.isPending}
                        className={`cursor-pointer rounded-xl font-medium transition-all ${
                            user.status === "ACTIVE"
                                ? "bg-[#F6E2CF] border-[#B4531A] text-[#B4531A] hover:bg-[#B4531A] hover:text-white"
                                : "bg-[#D5E6D3] border-[#3F7A4B] text-[#3F7A4B] hover:bg-[#3F7A4B] hover:text-white"
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
                <Card className="bg-[#FDFBF4] border-[#D9CFB3] text-[#1B2A1F] rounded-2xl shadow-xs">
                    <CardHeader className="border-b border-[#D9CFB3] pb-4">
                        <CardTitle className="text-lg font-serif font-bold text-[#1B2A1F]">
                            Profile Information
                        </CardTitle>
                        <CardDescription className="text-[#56655A]">
                            Registered credentials and access role in Folklore Diaries
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3.5 bg-[#EAE2CC]/40 rounded-xl border border-[#D9CFB3]">
                                <div className="p-2.5 rounded-xl bg-[#F3E3B8] text-[#8A5A00]">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#56655A] font-semibold">Full Name</p>
                                    <p className="text-sm font-semibold text-[#1B2A1F]">{user.name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3.5 bg-[#EAE2CC]/40 rounded-lg border border-[#D9CFB3]">
                                <div className="p-2.5 rounded-xl bg-[#D5E6D3] text-[#1F5A3D]">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-[#56655A] font-semibold">Email Address</p>
                                    <p className="text-sm font-semibold text-[#1B2A1F] truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3.5 bg-[#EAE2CC]/40 rounded-lg border border-[#D9CFB3]">
                                <div className="p-2.5 rounded-xl bg-[#F3E3B8] text-[#8A5A00]">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#56655A] font-semibold">Assigned Role</p>
                                    <p className="text-sm font-semibold text-[#1B2A1F]">{user.role || "USER"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3.5 bg-[#EAE2CC]/40 rounded-lg border border-[#D9CFB3]">
                                <div className="p-2.5 rounded-xl bg-[#EAE2CC] text-[#1B2A1F]">
                                    {user.status === "ACTIVE" ? (
                                        <CheckCircle2 className="w-5 h-5 text-[#3F7A4B]" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-[#B4531A]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-[#56655A] font-semibold">Account Status</p>
                                    <Badge
                                        variant="outline"
                                        className={`mt-0.5 ${
                                            user.status === "ACTIVE"
                                                ? "bg-[#D5E6D3] text-[#3F7A4B] border-[#3F7A4B]/40"
                                                : "bg-[#F6E2CF] text-[#B4531A] border-[#B4531A]/40"
                                        }`}
                                    >
                                        {user.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#D9CFB3] flex justify-between items-center text-xs text-[#56655A]">
                            <span>User ID: <code className="text-[#1B2A1F] font-mono">{user.id}</code></span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/admin/dashboard/users/manage")}
                                className="text-[#56655A] hover:text-[#1B2A1F] hover:bg-[#EAE2CC] cursor-pointer"
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
