"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import {
  Database,
  Search,
  Filter,
  Eye,
  X,
  PlusCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Leaf,
  PawPrint,
  Gem,
  ExternalLink,
  BookOpen,
  Activity,
  User,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

interface DrugRecord {
  id: string;
  primary_name: string | null;
  botanical_description: string | null;
  source_type: "PLANT" | "ANIMAL" | "MINERAL" | null;
  created_at: string | null;
  drug_names: { id: string; name: string | null; type: string | null }[];
  diseases: string[];
  usage_methods: { id: string; method_description: string | null; disease?: { name: string } }[];
  research: { id: string; title: string | null; type: string | null; link: string | null }[];
  photos: { id: string; image_url: string | null }[];
  contributors?: {
    id: string;
    name: string | null;
    age: number | null;
    address: string | null;
    guru_name: string | null;
    practice_duration: string | null;
  }[];
}

interface ViewDataPageProps {
  role: "admin" | "user";
}

export default function ViewDataPage({ role }: ViewDataPageProps) {
  const isAdmin = role === "admin";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sourceType, setSourceType] = useState<string>("");
  const [diseaseFilter, setDiseaseFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<"created_at" | "primary_name">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<DrugRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<DrugRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [recordToEdit, setRecordToEdit] = useState<DrugRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    primary_name: "",
    source_type: "",
    botanical_description: "",
    botanical_names: "",
    sanskrit_names: "",
    vernacular_names: "",
    diseases: "",
    usage_methods: "",
    research_articles: "",
    research_thesis: "",
    contributor_name: "",
    contributor_age: "",
    contributor_address: "",
    contributor_guru: "",
    contributor_practice: "",
  });

  // Search input change handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
    setPage(1);
  };

  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setSourceType("");
    setDiseaseFilter("");
    setPage(1);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["drugs-view", debouncedQuery, sourceType, diseaseFilter, page, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append("query", debouncedQuery);
      if (sourceType) params.append("sourceType", sourceType);
      if (diseaseFilter) params.append("disease", diseaseFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await axios.get(`/api/drugs?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const records: DrugRecord[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const stats = data?.stats || { totalAll: 0, plants: 0, animals: 0, minerals: 0 };

  // Handle Edit Initializer
  const handleStartEdit = (drug: DrugRecord) => {
    const botanicalNames = drug.drug_names
      .filter((n) => n.type === "BOTANICAL")
      .map((n) => n.name)
      .filter(Boolean)
      .join("; ");
    const sanskritNames = drug.drug_names
      .filter((n) => n.type === "SANSKRIT")
      .map((n) => n.name)
      .filter(Boolean)
      .join("; ");
    const vernacularNames = drug.drug_names
      .filter((n) => n.type === "VERNACULAR" || !n.type)
      .map((n) => n.name)
      .filter(Boolean)
      .join("; ");

    const diseases = drug.diseases.join("; ");
    const usageMethods = drug.usage_methods
      .map((u) => u.method_description)
      .filter(Boolean)
      .join("; ");

    const articles = drug.research
      .filter((r) => r.type === "ARTICLE")
      .map((r) => (r.link ? `${r.title} | ${r.link}` : r.title))
      .filter(Boolean)
      .join("; ");

    const theses = drug.research
      .filter((r) => r.type === "THESIS")
      .map((r) => (r.link ? `${r.title} | ${r.link}` : r.title))
      .filter(Boolean)
      .join("; ");

    const firstContrib = drug.contributors?.[0];

    setEditFormData({
      primary_name: drug.primary_name || "",
      source_type: drug.source_type || "PLANT",
      botanical_description: drug.botanical_description || "",
      botanical_names: botanicalNames,
      sanskrit_names: sanskritNames,
      vernacular_names: vernacularNames,
      diseases: diseases,
      usage_methods: usageMethods,
      research_articles: articles,
      research_thesis: theses,
      contributor_name: firstContrib?.name || "",
      contributor_age: firstContrib?.age?.toString() || "",
      contributor_address: firstContrib?.address || "",
      contributor_guru: firstContrib?.guru_name || "",
      contributor_practice: firstContrib?.practice_duration || "",
    });

    setRecordToEdit(drug);
  };

  // Handle Edit Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToEdit) return;

    if (!editFormData.primary_name.trim()) {
      toast.error("Primary name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const splitMulti = (str: string) =>
        str
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

      const rawBotanical = splitMulti(editFormData.botanical_names).map((name) => ({
        name,
        type: "BOTANICAL",
      }));
      const rawSanskrit = splitMulti(editFormData.sanskrit_names).map((name) => ({
        name,
        type: "SANSKRIT",
      }));
      const rawVernacular = splitMulti(editFormData.vernacular_names).map((name) => ({
        name,
        type: "VERNACULAR",
      }));

      const allDrugNames = [...rawBotanical, ...rawSanskrit, ...rawVernacular];
      const allDiseases = splitMulti(editFormData.diseases);
      const allUsageMethods = splitMulti(editFormData.usage_methods).map((m) => ({
        method_description: m,
      }));

      const allResearch: { title: string; type: string; link: string | null }[] = [];
      splitMulti(editFormData.research_articles).forEach((item) => {
        const parts = item.split("|").map((p) => p.trim());
        allResearch.push({
          title: parts[0],
          type: "ARTICLE",
          link: parts[1] || null,
        });
      });
      splitMulti(editFormData.research_thesis).forEach((item) => {
        const parts = item.split("|").map((p) => p.trim());
        allResearch.push({
          title: parts[0],
          type: "THESIS",
          link: parts[1] || null,
        });
      });

      const payload = {
        primary_name: editFormData.primary_name,
        source_type: editFormData.source_type,
        botanical_description: editFormData.botanical_description,
        drug_names: allDrugNames,
        diseases: allDiseases,
        usage_methods: allUsageMethods,
        research: allResearch,
        contributor: editFormData.contributor_name.trim()
          ? {
              name: editFormData.contributor_name,
              age: editFormData.contributor_age,
              address: editFormData.contributor_address,
              guru_name: editFormData.contributor_guru,
              practice_duration: editFormData.contributor_practice,
            }
          : undefined,
      };

      const res = await axios.put(`/api/drugs/${recordToEdit.id}`, payload);
      toast.success(res.data.message || "Formulation updated successfully!");
      setRecordToEdit(null);
      if (selectedRecord?.id === recordToEdit.id) {
        setSelectedRecord(null);
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update record.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Record
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      const res = await axios.delete(`/api/drugs/${recordToDelete.id}`);
      toast.success(res.data.message || "Record deleted successfully.");
      if (selectedRecord?.id === recordToDelete.id) {
        setSelectedRecord(null);
      }
      setRecordToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getSourceBadge = (type: string | null) => {
    switch (type) {
      case "PLANT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <Leaf className="w-3 h-3 text-emerald-400" />
            Plant
          </span>
        );
      case "ANIMAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <PawPrint className="w-3 h-3 text-amber-400" />
            Animal
          </span>
        );
      case "MINERAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
            <Gem className="w-3 h-3 text-cyan-400" />
            Mineral
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-zinc-400 bg-zinc-800 border border-zinc-700">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-8 text-zinc-300 px-6 pb-20 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {isAdmin ? "Folklore Drug Repository" : "View Drug Repository"}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {isAdmin
                  ? "Browse, filter, edit, or delete verified traditional medicinal formulations & contributors."
                  : "Explore traditional plant, animal, and mineral medicine formulations and treatments."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard/data/insert"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Insert New Record
              </Link>
              <Link
                href="/admin/dashboard/generate-report"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                Generate Report
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/ai-search"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                AI Search
              </Link>
              <Link
                href="/dashboard/manual-search"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-zinc-400" />
                Manual Search
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Total Formulations</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalAll}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400">
              <Database className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setSourceType(sourceType === "PLANT" ? "" : "PLANT");
            setPage(1);
          }}
          className={`bg-zinc-900/60 border-zinc-800 text-white cursor-pointer transition-all hover:border-emerald-700 ${
            sourceType === "PLANT" ? "border-emerald-500 ring-1 ring-emerald-500" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-500/80 font-medium">Plant Remedies</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.plants}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-900 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setSourceType(sourceType === "ANIMAL" ? "" : "ANIMAL");
            setPage(1);
          }}
          className={`bg-zinc-900/60 border-zinc-800 text-white cursor-pointer transition-all hover:border-amber-700 ${
            sourceType === "ANIMAL" ? "border-amber-500 ring-1 ring-amber-500" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-500/80 font-medium">Animal Sources</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.animals}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-900 text-amber-400">
              <PawPrint className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setSourceType(sourceType === "MINERAL" ? "" : "MINERAL");
            setPage(1);
          }}
          className={`bg-zinc-900/60 border-zinc-800 text-white cursor-pointer transition-all hover:border-cyan-700 ${
            sourceType === "MINERAL" ? "border-cyan-500 ring-1 ring-cyan-500" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-cyan-500/80 font-medium">Mineral Sources</p>
              <h3 className="text-2xl font-bold text-cyan-400 mt-1">{stats.minerals}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-900 text-cyan-400">
              <Gem className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <Card className="bg-zinc-900/70 border-zinc-800 text-white">
        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by drug name, botanical description, disease, or preparation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-zinc-950 border-zinc-800 pl-10 pr-10 text-sm focus-visible:ring-emerald-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setDebouncedQuery("");
                    setPage(1);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 cursor-pointer">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            {(debouncedQuery || sourceType || diseaseFilter) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearSearch}
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-500 font-medium">Filter by Source:</span>
              <button
                type="button"
                onClick={() => {
                  setSourceType("");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  sourceType === ""
                    ? "bg-zinc-800 text-white border-zinc-600"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                }`}
              >
                All Sources ({stats.totalAll})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType("PLANT");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  sourceType === "PLANT"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-emerald-400"
                }`}
              >
                Plants ({stats.plants})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType("ANIMAL");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  sourceType === "ANIMAL"
                    ? "bg-amber-950 text-amber-300 border-amber-600"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-amber-400"
                }`}
              >
                Animals ({stats.animals})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType("MINERAL");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  sourceType === "MINERAL"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-600"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-cyan-400"
                }`}
              >
                Minerals ({stats.minerals})
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">Sort:</span>
              <button
                type="button"
                onClick={() => {
                  setSortBy(sortBy === "primary_name" ? "created_at" : "primary_name");
                  setPage(1);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                {sortBy === "primary_name" ? "Alphabetical" : "Date Added"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  setPage(1);
                }}
                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer uppercase text-[10px]"
              >
                {sortOrder}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Records Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Showing <b className="text-white">{records.length}</b> of{" "}
            <b className="text-white">{pagination.total}</b> formulation records
          </span>
          {isFetching && (
            <span className="inline-flex items-center gap-1 text-emerald-400 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Updating records...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm">Loading repository records...</p>
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-900/20 border border-red-900 rounded-lg text-red-400 text-center">
            Failed to load data: {(error as any)?.response?.data?.error || (error as any)?.message}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            <Database className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-zinc-300">No records found</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto">
              No drug formulation matched your current filters. Try searching for a different term or reset filters.
            </p>
            <Button
              onClick={handleClearSearch}
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {records.map((drug) => (
              <Card
                key={drug.id}
                className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-900/80 group"
              >
                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {drug.primary_name || "Unnamed Formulation"}
                      </h3>
                      {getSourceBadge(drug.source_type)}
                      {drug.created_at && (
                        <span className="text-zinc-500 text-xs">
                          Added: {new Date(drug.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Vernacular Names */}
                    {drug.drug_names.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-400">
                        <span className="text-zinc-500 font-medium">Names:</span>
                        {drug.drug_names.slice(0, 4).map((n, i) => (
                          <span key={i} className="px-2 py-0.5 bg-zinc-800/80 rounded border border-zinc-700/60">
                            {n.name}
                            {n.type && <span className="text-zinc-500 text-[10px] ml-1">({n.type})</span>}
                          </span>
                        ))}
                        {drug.drug_names.length > 4 && (
                          <span className="text-zinc-500 text-xs">+{drug.drug_names.length - 4} more</span>
                        )}
                      </div>
                    )}

                    {/* Diseases Treated */}
                    {drug.diseases.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="text-zinc-500 font-medium">Treats:</span>
                        {drug.diseases.slice(0, 5).map((d, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-medium"
                          >
                            {d}
                          </span>
                        ))}
                        {drug.diseases.length > 5 && (
                          <span className="text-zinc-500 text-xs">+{drug.diseases.length - 5} more</span>
                        )}
                      </div>
                    )}

                    {/* Description preview */}
                    {drug.botanical_description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {drug.botanical_description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                    <Button
                      onClick={() => setSelectedRecord(drug)}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1 text-emerald-400" />
                      View
                    </Button>

                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => handleStartEdit(drug)}
                          variant="outline"
                          size="sm"
                          className="border-blue-900/60 bg-blue-950/30 hover:bg-blue-900/60 text-blue-300 hover:text-white cursor-pointer"
                          title="Edit Formulation"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1 text-blue-400" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setRecordToDelete(drug)}
                          variant="outline"
                          size="sm"
                          className="border-red-900/60 bg-red-950/30 hover:bg-red-900/60 text-red-300 hover:text-white cursor-pointer"
                          title="Delete Formulation"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 text-red-400" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
            <div>
              Page <b className="text-white">{pagination.page}</b> of{" "}
              <b className="text-white">{pagination.totalPages}</b> (Total {pagination.total} records)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                {pagination.page} / {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal View */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedRecord.primary_name || "Record Details"}
                </h2>
                {getSourceBadge(selectedRecord.source_type)}
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Botanical Description */}
              {selectedRecord.botanical_description && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-1.5">
                    Botanical Description
                  </h4>
                  <p className="text-zinc-200 text-sm leading-relaxed bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800">
                    {selectedRecord.botanical_description}
                  </p>
                </div>
              )}

              {/* Vernacular & Other Names */}
              {selectedRecord.drug_names.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">
                    Other & Vernacular Names
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.drug_names.map((n, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 text-xs"
                      >
                        {n.name}{" "}
                        {n.type && <span className="text-emerald-400/80 text-[11px]">({n.type})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diseases Treated */}
              {selectedRecord.diseases.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">
                    Diseases Treated
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.diseases.map((d, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-800/60 text-xs font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage & Preparation Methods */}
              {selectedRecord.usage_methods.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">
                    Usage & Preparation Methods
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.usage_methods.map((um, i) => (
                      <div
                        key={i}
                        className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 text-zinc-300 leading-relaxed text-xs"
                      >
                        {um.disease?.name && (
                          <span className="text-emerald-400 font-medium block mb-1">
                            For: {um.disease.name}
                          </span>
                        )}
                        {um.method_description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research & Publications */}
              {selectedRecord.research.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">
                    Scientific Research & References
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.research.map((r, i) => (
                      <div
                        key={i}
                        className="bg-zinc-950/60 border border-zinc-800 p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="text-zinc-200 font-medium">{r.title}</div>
                          {r.type && <span className="text-zinc-500 uppercase text-[10px]">{r.type}</span>}
                        </div>
                        {r.link && (
                          <a
                            href={r.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 shrink-0 font-medium"
                          >
                            Read Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributor Information (Admin Only) */}
              {isAdmin && selectedRecord.contributors && selectedRecord.contributors.length > 0 && (
                <div className="p-4 bg-zinc-950/80 rounded-lg border border-emerald-950 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs uppercase text-emerald-400 font-bold tracking-wider">
                      Contributor Profile (Admin Confidential)
                    </h4>
                  </div>
                  {selectedRecord.contributors.map((c, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                      <div>
                        <span className="text-zinc-500 block">Name:</span>
                        <b className="text-white">{c.name || "N/A"}</b>
                      </div>
                      {c.age && (
                        <div>
                          <span className="text-zinc-500 block">Age:</span>
                          <span>{c.age} years</span>
                        </div>
                      )}
                      {c.address && (
                        <div>
                          <span className="text-zinc-500 block">Address:</span>
                          <span>{c.address}</span>
                        </div>
                      )}
                      {c.guru_name && (
                        <div>
                          <span className="text-zinc-500 block">Guru / Mentor:</span>
                          <span>{c.guru_name}</span>
                        </div>
                      )}
                      {c.practice_duration && (
                        <div>
                          <span className="text-zinc-500 block">Practice Duration:</span>
                          <span>{c.practice_duration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/90">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <Button
                      onClick={() => {
                        const rec = selectedRecord;
                        setSelectedRecord(null);
                        handleStartEdit(rec);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-900 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit Record
                    </Button>
                    <Button
                      onClick={() => {
                        const rec = selectedRecord;
                        setRecordToDelete(rec);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-900 bg-red-950/40 text-red-300 hover:bg-red-900/60 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete Record
                    </Button>
                  </>
                )}
              </div>
              <Button onClick={() => setSelectedRecord(null)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-red-900/60 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-950 text-red-400 border border-red-800/80">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Formulation</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <b className="text-red-400 font-semibold">{recordToDelete.primary_name || "this formulation"}</b>?
              All linked names, disease associations, research citations, and methods will be removed.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRecordToDelete(null)}
                disabled={isDeleting}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Formulation Modal */}
      {recordToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Edit Formulation Record</h2>
                  <p className="text-xs text-zinc-400">Modify formulation attributes, names, diseases, and research.</p>
                </div>
              </div>
              <button
                onClick={() => setRecordToEdit(null)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-zinc-400 font-semibold block mb-1.5">
                    Primary Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={editFormData.primary_name}
                    onChange={(e) => setEditFormData({ ...editFormData, primary_name: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                    placeholder="e.g. Tulsi, Guduchi, Ashwagandha"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-zinc-400 font-semibold block mb-1.5">
                    Source Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editFormData.source_type}
                    onChange={(e) => setEditFormData({ ...editFormData, source_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PLANT">PLANT</option>
                    <option value="ANIMAL">ANIMAL</option>
                    <option value="MINERAL">MINERAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase text-zinc-400 font-semibold block mb-1.5">
                  Botanical Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.botanical_description}
                  onChange={(e) => setEditFormData({ ...editFormData, botanical_description: e.target.value })}
                  className="w-full p-3 rounded-md bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Physical description, morphological details, habitat, or characteristics..."
                />
              </div>

              {/* Names Section */}
              <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-3">
                <h4 className="text-xs uppercase text-emerald-400 font-bold tracking-wider">
                  Alternative & Vernacular Names (Semicolon &quot;;&quot; separated)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Botanical / Latin Names</label>
                    <Input
                      value={editFormData.botanical_names}
                      onChange={(e) => setEditFormData({ ...editFormData, botanical_names: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="Ocimum sanctum; Ocimum tenuiflorum"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Sanskrit Names</label>
                    <Input
                      value={editFormData.sanskrit_names}
                      onChange={(e) => setEditFormData({ ...editFormData, sanskrit_names: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="Surasa; Vaishnavi; Tulasi"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Vernacular / Regional Names</label>
                    <Input
                      value={editFormData.vernacular_names}
                      onChange={(e) => setEditFormData({ ...editFormData, vernacular_names: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="Holy Basil; Thulasi; Tulsi"
                    />
                  </div>
                </div>
              </div>

              {/* Diseases and Usage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-zinc-400 font-semibold block mb-1.5">
                    Diseases Treated (Semicolon &quot;;&quot; separated)
                  </label>
                  <Input
                    value={editFormData.diseases}
                    onChange={(e) => setEditFormData({ ...editFormData, diseases: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-sm"
                    placeholder="Fever; Cough; Respiratory Disorders; Skin Allergy"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-zinc-400 font-semibold block mb-1.5">
                    Usage & Preparation Methods (Semicolon &quot;;&quot; separated)
                  </label>
                  <Input
                    value={editFormData.usage_methods}
                    onChange={(e) => setEditFormData({ ...editFormData, usage_methods: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-sm"
                    placeholder="Boil leaves in water twice daily; Apply fresh paste topically"
                  />
                </div>
              </div>

              {/* Research Section */}
              <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-3">
                <h4 className="text-xs uppercase text-blue-400 font-bold tracking-wider">
                  Research & Studies (Title | Link, Semicolon separated)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Research Articles</label>
                    <Input
                      value={editFormData.research_articles}
                      onChange={(e) => setEditFormData({ ...editFormData, research_articles: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="Phytochemical analysis | https://pubmed.ncbi.nlm.nih.gov/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Academic Theses</label>
                    <Input
                      value={editFormData.research_thesis}
                      onChange={(e) => setEditFormData({ ...editFormData, research_thesis: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="Clinical efficacy thesis | https://shodhganga.inflibnet.ac.in/..."
                    />
                  </div>
                </div>
              </div>

              {/* Contributor Section */}
              <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-3">
                <h4 className="text-xs uppercase text-emerald-400 font-bold tracking-wider">
                  Contributor Profile Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Contributor Name</label>
                    <Input
                      value={editFormData.contributor_name}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_name: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="e.g. Vaidya Ramesh"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Age</label>
                    <Input
                      type="number"
                      value={editFormData.contributor_age}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_age: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="e.g. 58"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Practice Duration</label>
                    <Input
                      value={editFormData.contributor_practice}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_practice: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="e.g. 25 years"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-400 block mb-1">Address / Region</label>
                    <Input
                      value={editFormData.contributor_address}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_address: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="e.g. Udupi, Karnataka"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Guru / Mentor</label>
                    <Input
                      value={editFormData.contributor_guru}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_guru: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      placeholder="e.g. Acharya Shrinath"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecordToEdit(null)}
                  disabled={isSaving}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer px-6"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
