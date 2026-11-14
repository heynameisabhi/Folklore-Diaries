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
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import {
  Database,
  FileText,
  Users,
  UserCheck,
  UserX,
  PlusCircle,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Activity,
  HeartPulse,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserActivity = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type DashboardData = {
  users: UserActivity[];
  userActivityChart: {
    name: string;
    active: number;
    blocked: number;
  }[];
  totalDrugs?: number;
  totalDiseases?: number;
  totalContributors?: number;
  recentDrugs?: {
    id: string;
    primary_name: string | null;
    source_type: string | null;
    created_at: string | null;
  }[];
};

export default function AdminDashboard() {
  useAuth(["admin"]);
  const router = useRouter();
  const { data: session, status } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/dashboard");
      return response.data;
    },
    enabled: !!session,
    refetchOnWindowFocus: false,
  });

  const dashboardData: DashboardData = data || {
    users: [],
    userActivityChart: [],
  };

  const totalUsers = dashboardData.users.length;
  const activeUsers = dashboardData.users.filter(
    (user) => user.status === "ACTIVE"
  ).length;
  const blockedUsers = dashboardData.users.filter(
    (user) => user.status === "BLOCKED"
  ).length;

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-zinc-400">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono tracking-wider uppercase text-zinc-500">
          Loading Admin Curator Console...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] p-4">
        <div className="p-8 text-center bg-zinc-950 rounded-xl border border-red-900/50 max-w-md">
          <h2 className="text-lg font-semibold text-red-400 mb-2">
            Failed to Load Metrics
          </h2>
          <p className="text-zinc-400 text-xs">
            Could not fetch curator data. Please verify your connection or refresh.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] p-4">
        <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800 max-w-md">
          <h2 className="text-lg font-semibold text-zinc-200 mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-xs">Administrator privileges required.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Editorial Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-zinc-900">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] font-mono tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CURATOR ARCHIVE CONSOLE • ELEVATED PRIVILEGES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Archive Curator Dashboard
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
              System governance, drug ingestion pipelines, oral tradition lineages, and user access oversight.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/dashboard/data/insert"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ingest Formulations</span>
            </Link>
            <Link
              href="/admin/dashboard/data"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manage Repository</span>
            </Link>
            <Link
              href="/admin/dashboard/generate-report"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Report</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            onClick={() => router.push("/admin/dashboard/data")}
            className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Total Formulations
                </CardDescription>
                <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {dashboardData.totalDrugs ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                <span>Single & Bulk Ingestion</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => router.push("/admin/dashboard/data")}
            className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Diseases Mapped
                </CardDescription>
                <HeartPulse className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {dashboardData.totalDiseases ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                <span>Indications & Usage Links</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => router.push("/admin/dashboard/data")}
            className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Lineage Healers
                </CardDescription>
                <UserCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {dashboardData.totalContributors ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                <span>Guru & Oral Lineages</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => router.push("/admin/dashboard/users/manage")}
            className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  System Accounts
                </CardDescription>
                <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {totalUsers}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                <span>{activeUsers} Active · {blockedUsers} Blocked</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart & Curator Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Status Bar Chart */}
          <Card className="bg-zinc-950/60 border-zinc-800/80 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    Access & User Governance
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Active vs. Blocked system accounts over time
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[10px] font-mono">
                  ACCOUNT HEALTH
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.userActivityChart}>
                    <XAxis
                      dataKey="name"
                      stroke="#52525b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#e4e4e7" }}
                    />
                    <Bar
                      dataKey="active"
                      name="Active"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="blocked"
                      name="Blocked"
                      fill="#e11d48"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Curator Quick Operations */}
          <Card className="bg-zinc-950/60 border-zinc-800/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  Curator Tools
                </span>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <Link
                  href="/admin/dashboard/data/insert"
                  className="p-3 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 transition-all flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Single & CSV Ingestion</div>
                      <div className="text-[11px] text-zinc-400">Catalog folk drugs with merge logic</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400" />
                </Link>

                <Link
                  href="/admin/dashboard/ai-search"
                  className="p-3 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 transition-all flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Admin AI Query</div>
                      <div className="text-[11px] text-zinc-400">Search with lineage details</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400" />
                </Link>

                <Link
                  href="/admin/dashboard/users/manage"
                  className="p-3 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 transition-all flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">User Access Control</div>
                      <div className="text-[11px] text-zinc-400">Activate or restrict accounts</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 mt-4 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
              <span>Security: TLS & Row-Level</span>
              <span className="text-emerald-400">Encrypted</span>
            </div>
          </Card>
        </div>

        {/* Recent Registered Users Feed */}
        <Card className="bg-zinc-950/60 border-zinc-800/80 overflow-hidden">
          <CardHeader className="border-b border-zinc-900 pb-4 pt-5 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white">
                  Registered User Accounts
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Platform researchers and administrators
                </CardDescription>
              </div>
              <Link
                href="/admin/dashboard/users/manage"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Manage All ({totalUsers})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-zinc-900">
              {dashboardData.users.length > 0 ? (
                dashboardData.users.slice(0, 6).map((user) => (
                  <div
                    key={user.id}
                    onClick={() => router.push(`/admin/dashboard/users/manage`)}
                    className="p-4 sm:px-6 hover:bg-zinc-900/40 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                          {user.name || "Anonymous User"}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                          <span>{user.email}</span>
                          <span>•</span>
                          <span className="text-zinc-400 uppercase">{user.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/60"
                            : "bg-red-950/50 text-red-400 border-red-900/60"
                        }`}
                      >
                        {user.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No registered users cataloged.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
