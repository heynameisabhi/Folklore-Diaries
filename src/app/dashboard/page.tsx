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
  Clock,
  Database,
  FileText,
  TrendingUp,
  Search,
  BrainCircuit,
  ArrowRight,
  Leaf,
  Layers,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { drug } from "@prisma/client";
import Link from "next/link";
import { getWeeklyChartData } from "@/helpers/getWeeklyChartData";

type ChartDataPoint = {
  name: string;
  records: number;
};

let chartData: ChartDataPoint[] = [];
let TotalRecordsThisWeek: number = 0;
let mostActiveDayOfTheWeek: string = "";
let mostActivePercentage: number = 0;

export default function Dashboard() {
  useAuth(["user"]);

  const { data: session, status } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["drugRecords"],
    queryFn: async () => {
      const response = await axios.get("/api/users/records/get");

      chartData = getWeeklyChartData(response.data.recentDrugRecords);

      TotalRecordsThisWeek = chartData.reduce(
        (sum, day) => sum + day.records,
        0
      );

      const mostActiveDayOfTheWeekData = chartData.reduce((max, current) =>
        current.records > max.records ? current : max
      );

      mostActiveDayOfTheWeek = mostActiveDayOfTheWeekData.name;
      mostActivePercentage =
        TotalRecordsThisWeek > 0
          ? (mostActiveDayOfTheWeekData.records / TotalRecordsThisWeek) * 100
          : 0;

      return response.data;
    },
    enabled: !!session,
    refetchOnWindowFocus: false,
  });

  const records = data?.recentDrugRecords || [];
  const recordCount = data?.recordCount || 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-zinc-400">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono tracking-wider uppercase text-zinc-500">
          Loading Herbarium Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] p-4">
        <div className="p-8 text-center bg-zinc-950 rounded-xl border border-red-900/50 max-w-md">
          <h2 className="text-lg font-semibold text-red-400 mb-2">
            Failed to Load Repository
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Could not fetch repository records. Please verify your connection or refresh.
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
          <p className="text-zinc-400 text-xs">Please sign in to access the archive.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const username =
    session.user?.name || session.user?.email?.split("@")[0] || "Researcher";

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Editorial Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-zinc-900">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] font-mono tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FOLKLORE ARCHIVE • RESEARCH PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Welcome back, {username}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
              Explore documented folk materia medica, search verified medicinal formulations, and review scientific publications.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/dashboard/data"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>View Repository</span>
            </Link>
            <Link
              href="/dashboard/ai-search"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 transition-all"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Search</span>
            </Link>
            <Link
              href="/dashboard/manual-search"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Manual Filters</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Total Cataloged
                </CardDescription>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {recordCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                <span className="text-emerald-400">Verified</span> formulations in repository
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Weekly Additions
                </CardDescription>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {TotalRecordsThisWeek || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                <span className="text-teal-400">Active</span> documentation pace
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Recent Entries
                </CardDescription>
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                {records.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                Viewing newest archive additions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-all">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between text-zinc-400">
                <CardDescription className="text-xs uppercase tracking-wider font-mono">
                  Source Origins
                </CardDescription>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mt-1">
                4 Taxa
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-[11px] text-zinc-400 font-mono">
                Plant · Organic · Mineral · Oral
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart & Repository Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Bar Chart */}
          <Card className="bg-zinc-950/60 border-zinc-800/80 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    Documentation Timeline
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Records indexed across the past seven days
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[10px] font-mono">
                  WEEKLY CADENCE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
                      itemStyle={{ color: "#34d399" }}
                    />
                    <Bar
                      dataKey="records"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics & Discovery Pill */}
          <div className="space-y-4 flex flex-col justify-between">
            <Card className="bg-zinc-950/60 border-zinc-800/80 p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-zinc-400">
                    Repository Insight
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">
                  Peak Contribution Day
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  {mostActiveDayOfTheWeek
                    ? `${mostActiveDayOfTheWeek} saw the highest documentation activity.`
                    : "Consistent documentation across all active periods."}
                </p>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, mostActivePercentage))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>Frequency ratio</span>
                  <span className="text-emerald-400">{Math.round(mostActivePercentage)}%</span>
                </div>
              </div>

              {/* Direct Portal Link */}
              <div className="pt-4 border-t border-zinc-900 mt-4">
                <Link
                  href="/dashboard/ai-search"
                  className="flex items-center justify-between text-xs text-zinc-300 hover:text-emerald-400 transition-colors group"
                >
                  <span className="flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                    Query repository with AI
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Formulations List */}
        <Card className="bg-zinc-950/60 border-zinc-800/80 overflow-hidden">
          <CardHeader className="border-b border-zinc-900 pb-4 pt-5 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white">
                  Recently Cataloged Formulations
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Latest entries indexed into the folk medicine archive
                </CardDescription>
              </div>
              <Link
                href="/dashboard/data"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>View Full Index</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-zinc-900">
              {records.length > 0 ? (
                records.map((record: drug) => (
                  <Link
                    key={record.id}
                    href="/dashboard/data"
                    className="p-4 sm:px-6 hover:bg-zinc-900/40 transition-colors flex items-center justify-between group block"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-900/50 flex items-center justify-center text-emerald-400 shrink-0">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                          {record.primary_name || "Untitled Botanical Record"}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                          <span>Cataloged: {formatDate(record.created_at)}</span>
                          {record.source_type && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-400 uppercase">
                                {record.source_type}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300 hidden sm:inline">
                        View Folio
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center text-zinc-500 space-y-3">
                  <p className="text-sm">No formulations cataloged yet.</p>
                  <Link
                    href="/dashboard/manual-search"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Explore Repository Search
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
