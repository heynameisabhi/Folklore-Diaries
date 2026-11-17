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
  Image as ImageIcon,
} from "lucide-react";
import { formatUrl, parseResearchItem, renderClickableText } from "@/helpers/linkUtils";
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3F7A4B]/12 text-[#3F7A4B] border border-[#3F7A4B]/25">
            <Leaf className="w-3 h-3 text-[#3F7A4B]" />
            Plant
          </span>
        );
      case "ANIMAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B0603A]/12 text-[#B0603A] border border-[#B0603A]/25">
            <PawPrint className="w-3 h-3 text-[#B0603A]" />
            Animal
          </span>
        );
      case "MINERAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5A6E8C]/12 text-[#5A6E8C] border border-[#5A6E8C]/25">
            <Gem className="w-3 h-3 text-[#5A6E8C]" />
            Mineral
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-[var(--vdp-muted)] bg-[var(--vdp-sunk)] border border-[var(--vdp-line)]">
            Unknown
          </span>
        );
    }
  };

  return (
    <div
      style={{
        ["--vdp-bg" as any]: isAdmin ? "#F3EEE0" : "#EEF1E6",
        ["--vdp-surface" as any]: isAdmin ? "#FDFBF4" : "#FBFCF7",
        ["--vdp-sunk" as any]: isAdmin ? "#EAE2CC" : "#E3E8D8",
        ["--vdp-line" as any]: isAdmin ? "#D9CFB3" : "#CFD7C3",
        ["--vdp-accent" as any]: isAdmin ? "#8A5A00" : "#1F5A3D",
        ["--vdp-accent-soft" as any]: isAdmin ? "#F3E3B8" : "#D5E6D3",
        ["--vdp-ink" as any]: "#1B2A1F",
        ["--vdp-muted" as any]: "#56655A",
        ["--vdp-plant" as any]: "#3F7A4B",
        ["--vdp-animal" as any]: "#B0603A",
        ["--vdp-mineral" as any]: "#5A6E8C",
        ["--vdp-warn" as any]: "#B4531A",
        ["--vdp-warn-soft" as any]: "#F6E2CF",
        color: "var(--vdp-ink)",
      }}
      className="vdp-scope flex flex-col gap-5 sm:gap-6 pt-4 sm:pt-8 px-3 sm:px-6 pb-20 max-w-7xl mx-auto h-full overflow-y-auto font-sans text-[var(--vdp-ink)]"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--vdp-line)] pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--vdp-accent-soft)] border border-[var(--vdp-line)] text-[var(--vdp-accent)] shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[var(--vdp-ink)] tracking-tight">
                {isAdmin ? "Folklore Drug Repository" : "View Drug Repository"}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--vdp-muted)] mt-0.5 font-medium">
                {isAdmin
                  ? "Browse, filter, edit, or delete verified traditional medicinal formulations & contributors."
                  : "Explore traditional plant, animal, and mineral medicine formulations and treatments."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard/data/insert"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--vdp-accent)] hover:opacity-90 text-white shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Insert Record</span>
              </Link>
              <Link
                href="/admin/dashboard/generate-report"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-[var(--vdp-surface)] hover:bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] border border-[var(--vdp-line)] transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-[var(--vdp-accent)]" />
                <span>Report</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/ai-search"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--vdp-accent)] hover:opacity-90 text-white shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Search</span>
              </Link>
              <Link
                href="/dashboard/manual-search"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-[var(--vdp-surface)] hover:bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] border border-[var(--vdp-line)] transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4 text-[var(--vdp-muted)]" />
                <span>Manual Search</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Records */}
        <div className="bg-[var(--vdp-surface)] border border-[var(--vdp-line)] rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all hover:border-[var(--vdp-accent)]">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[var(--vdp-muted)] font-semibold">Total Records</p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--vdp-ink)] mt-0.5 sm:mt-1">{stats.totalAll}</h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--vdp-sunk)] border border-[var(--vdp-line)] text-[var(--vdp-muted)] shrink-0">
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Plants */}
        <div
          onClick={() => {
            setSourceType(sourceType === "PLANT" ? "" : "PLANT");
            setPage(1);
          }}
          className={`bg-[var(--vdp-surface)] border rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-[#3F7A4B] ${
            sourceType === "PLANT" ? "border-[#3F7A4B] ring-2 ring-[#3F7A4B]/30 bg-[#3F7A4B]/5" : "border-[var(--vdp-line)]"
          }`}
        >
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#3F7A4B] font-semibold">Plants</p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3F7A4B] mt-0.5 sm:mt-1">{stats.plants}</h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#3F7A4B]/12 border border-[#3F7A4B]/25 text-[#3F7A4B] shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Animals */}
        <div
          onClick={() => {
            setSourceType(sourceType === "ANIMAL" ? "" : "ANIMAL");
            setPage(1);
          }}
          className={`bg-[var(--vdp-surface)] border rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-[#B0603A] ${
            sourceType === "ANIMAL" ? "border-[#B0603A] ring-2 ring-[#B0603A]/30 bg-[#B0603A]/5" : "border-[var(--vdp-line)]"
          }`}
        >
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#B0603A] font-semibold">Animals</p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#B0603A] mt-0.5 sm:mt-1">{stats.animals}</h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#B0603A]/12 border border-[#B0603A]/25 text-[#B0603A] shrink-0">
            <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Minerals */}
        <div
          onClick={() => {
            setSourceType(sourceType === "MINERAL" ? "" : "MINERAL");
            setPage(1);
          }}
          className={`bg-[var(--vdp-surface)] border rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-[#5A6E8C] ${
            sourceType === "MINERAL" ? "border-[#5A6E8C] ring-2 ring-[#5A6E8C]/30 bg-[#5A6E8C]/5" : "border-[var(--vdp-line)]"
          }`}
        >
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#5A6E8C] font-semibold">Minerals</p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#5A6E8C] mt-0.5 sm:mt-1">{stats.minerals}</h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#5A6E8C]/12 border border-[#5A6E8C]/25 text-[#5A6E8C] shrink-0">
            <Gem className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[var(--vdp-surface)] border border-[var(--vdp-line)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vdp-muted)]" />
            <input
              placeholder="Search by drug name, botanical description, disease, or preparation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-sm placeholder:text-[var(--vdp-muted)] focus:outline-none focus:border-[var(--vdp-accent)] focus:ring-1 focus:ring-[var(--vdp-accent)] transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  setPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--vdp-muted)] hover:text-[var(--vdp-ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--vdp-accent)] hover:opacity-90 text-white font-medium text-sm transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          {(debouncedQuery || sourceType || diseaseFilter) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="inline-flex items-center justify-center h-11 px-4 rounded-xl border border-[var(--vdp-line)] bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] hover:text-[var(--vdp-ink)] hover:bg-white text-sm transition-all cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--vdp-line)] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[var(--vdp-muted)] font-semibold">Filter by Source:</span>
            <button
              type="button"
              onClick={() => {
                setSourceType("");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                sourceType === ""
                  ? "bg-[var(--vdp-accent)] text-white border-[var(--vdp-accent)] shadow-xs"
                  : "bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] border-[var(--vdp-line)] hover:text-[var(--vdp-ink)] hover:bg-white"
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
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                sourceType === "PLANT"
                  ? "bg-[#3F7A4B] text-white border-[#3F7A4B] shadow-xs"
                  : "bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] border-[var(--vdp-line)] hover:text-[#3F7A4B] hover:bg-white"
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
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                sourceType === "ANIMAL"
                  ? "bg-[#B0603A] text-white border-[#B0603A] shadow-xs"
                  : "bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] border-[var(--vdp-line)] hover:text-[#B0603A] hover:bg-white"
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
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                sourceType === "MINERAL"
                  ? "bg-[#5A6E8C] text-white border-[#5A6E8C] shadow-xs"
                  : "bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] border-[var(--vdp-line)] hover:text-[#5A6E8C] hover:bg-white"
              }`}
            >
              Minerals ({stats.minerals})
            </button>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--vdp-muted)] font-semibold">Sort:</span>
            <button
              type="button"
              onClick={() => {
                setSortBy(sortBy === "primary_name" ? "created_at" : "primary_name");
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--vdp-sunk)] border border-[var(--vdp-line)] text-[var(--vdp-ink)] hover:bg-white transition-all cursor-pointer text-xs font-medium"
            >
              <ArrowUpDown className="w-3 h-3 text-[var(--vdp-muted)]" />
              {sortBy === "primary_name" ? "Alphabetical" : "Date Added"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setPage(1);
              }}
              className="px-2.5 py-1 rounded-lg bg-[var(--vdp-sunk)] border border-[var(--vdp-line)] text-[var(--vdp-ink)] hover:bg-white transition-all cursor-pointer uppercase text-[10px] font-bold"
            >
              {sortOrder}
            </button>
          </div>
        </div>
      </div>

      {/* Active Records List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--vdp-muted)]">
          <span>
            Showing <b className="text-[var(--vdp-ink)] font-semibold">{records.length}</b> of{" "}
            <b className="text-[var(--vdp-ink)] font-semibold">{pagination.total}</b> formulation records
          </span>
          {isFetching && (
            <span className="inline-flex items-center gap-1 text-[var(--vdp-accent)] animate-pulse font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Updating records...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--vdp-muted)]">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--vdp-accent)] mb-3" />
            <p className="text-sm">Loading repository records...</p>
          </div>
        ) : isError ? (
          <div className="p-6 bg-[#F6E2CF] border border-[#B4531A] rounded-2xl text-[#B4531A] text-center font-medium">
            Failed to load data: {(error as any)?.response?.data?.error || (error as any)?.message}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--vdp-line)] rounded-2xl bg-[var(--vdp-surface)]">
            <Database className="w-10 h-10 text-[var(--vdp-muted)] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-serif font-semibold text-[var(--vdp-ink)]">No records found</h3>
            <p className="text-[var(--vdp-muted)] text-sm mt-1 max-w-md mx-auto">
              No drug formulation matched your current filters. Try searching for a different term or reset filters.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 rounded-xl border border-[var(--vdp-line)] bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] hover:bg-white text-sm font-medium cursor-pointer transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {records.map((drug) => (
              <div
                key={drug.id}
                className="bg-[var(--vdp-surface)] border border-[var(--vdp-line)] hover:border-[var(--vdp-accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
              >
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-serif font-semibold text-[var(--vdp-ink)] group-hover:text-[var(--vdp-accent)] transition-colors">
                      {drug.primary_name || "Unnamed Formulation"}
                    </h3>
                    {getSourceBadge(drug.source_type)}
                    {drug.created_at && (
                      <span className="text-[var(--vdp-muted)] text-xs">
                        Added: {new Date(drug.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Vernacular Names */}
                  {drug.drug_names.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-[var(--vdp-muted)]">
                      <span className="font-semibold text-[var(--vdp-ink)]">Names:</span>
                      {drug.drug_names.slice(0, 4).map((n, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] rounded-md border border-[var(--vdp-line)]">
                          {n.name}
                          {n.type && <span className="text-[var(--vdp-muted)] text-[10px] ml-1">({n.type})</span>}
                        </span>
                      ))}
                      {drug.drug_names.length > 4 && (
                        <span className="text-[var(--vdp-muted)] text-xs">+{drug.drug_names.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Diseases Treated */}
                  {drug.diseases.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-semibold text-[var(--vdp-ink)]">Treats:</span>
                      {drug.diseases.slice(0, 5).map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#3F7A4B]/10 text-[#3F7A4B] border border-[#3F7A4B]/20 font-medium"
                        >
                          {d}
                        </span>
                      ))}
                      {drug.diseases.length > 5 && (
                        <span className="text-[var(--vdp-muted)] text-xs">+{drug.diseases.length - 5} more</span>
                      )}
                    </div>
                  )}

                  {/* Research Links Preview */}
                  {drug.research && drug.research.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-semibold text-[var(--vdp-ink)]">Research:</span>
                      {drug.research.slice(0, 3).map((r, i) => {
                        const parsed = parseResearchItem(r);
                        return parsed.link ? (
                          <a
                            key={i}
                            href={parsed.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[var(--vdp-accent-soft)]/60 hover:bg-[var(--vdp-accent)] text-[var(--vdp-accent)] hover:text-white border border-[var(--vdp-accent)]/30 font-medium transition-all text-xs"
                            title={parsed.title}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span className="max-w-[170px] truncate">{parsed.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] border border-[var(--vdp-line)] text-xs">
                            {parsed.title}
                          </span>
                        );
                      })}
                      {drug.research.length > 3 && (
                        <span className="text-[var(--vdp-muted)] text-xs">+{drug.research.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Photos Media Preview */}
                  {drug.photos && drug.photos.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-semibold text-[var(--vdp-ink)]">Photos:</span>
                      {drug.photos.slice(0, 3).map((p, i) =>
                        p.image_url ? (
                          <a
                            key={i}
                            href={formatUrl(p.image_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--vdp-sunk)] hover:bg-white text-[var(--vdp-ink)] hover:text-[var(--vdp-accent)] border border-[var(--vdp-line)] font-medium text-xs transition-all"
                          >
                            <ImageIcon className="w-3 h-3 text-[var(--vdp-accent)]" />
                            Photo {i + 1}
                            <ExternalLink className="w-2.5 h-2.5 text-[var(--vdp-muted)]" />
                          </a>
                        ) : null
                      )}
                      {drug.photos.length > 3 && (
                        <span className="text-[var(--vdp-muted)] text-xs">+{drug.photos.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Description preview */}
                  {drug.botanical_description && (
                    <p className="text-xs text-[var(--vdp-muted)] line-clamp-2 leading-relaxed">
                      {renderClickableText(drug.botanical_description)}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-end md:self-center justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-0 border-[var(--vdp-line)]">
                  <button
                    onClick={() => setSelectedRecord(drug)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--vdp-line)] bg-[var(--vdp-sunk)] hover:bg-white text-[var(--vdp-ink)] font-medium text-xs transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[var(--vdp-accent)]" />
                    View
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleStartEdit(drug)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--vdp-accent-soft)] bg-[var(--vdp-accent-soft)] text-[var(--vdp-accent)] hover:bg-[var(--vdp-accent)] hover:text-white font-medium text-xs transition-all cursor-pointer"
                        title="Edit Formulation"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setRecordToDelete(drug)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#F6E2CF] bg-[#F6E2CF] text-[#B4531A] hover:bg-[#B4531A] hover:text-white font-medium text-xs transition-all cursor-pointer"
                        title="Delete Formulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--vdp-line)] text-xs text-[var(--vdp-muted)]">
            <div>
              Page <b className="text-[var(--vdp-ink)] font-semibold">{pagination.page}</b> of{" "}
              <b className="text-[var(--vdp-ink)] font-semibold">{pagination.totalPages}</b> (Total {pagination.total} records)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[var(--vdp-line)] bg-[var(--vdp-sunk)] hover:bg-white text-[var(--vdp-ink)] disabled:opacity-40 cursor-pointer font-medium text-xs transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--vdp-surface)] border border-[var(--vdp-line)] text-[var(--vdp-ink)] font-medium">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[var(--vdp-line)] bg-[var(--vdp-sunk)] hover:bg-white text-[var(--vdp-ink)] disabled:opacity-40 cursor-pointer font-medium text-xs transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal View */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,42,31,0.5)] backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--vdp-surface)] border border-[var(--vdp-line)] rounded-2xl max-w-3xl w-full max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--vdp-line)] flex justify-between items-center bg-[var(--vdp-sunk)]/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[var(--vdp-ink)] tracking-tight">
                  {selectedRecord.primary_name || "Record Details"}
                </h2>
                {getSourceBadge(selectedRecord.source_type)}
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] hover:text-[var(--vdp-ink)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-xs sm:text-sm">
              {/* Botanical Description */}
              {selectedRecord.botanical_description && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--vdp-muted)] font-semibold tracking-wider mb-1.5">
                    Botanical Description
                  </h4>
                  <p className="text-[var(--vdp-ink)] text-sm leading-relaxed bg-[var(--vdp-sunk)]/40 p-3.5 rounded-xl border border-[var(--vdp-line)]">
                    {renderClickableText(selectedRecord.botanical_description)}
                  </p>
                </div>
              )}

              {/* Vernacular & Other Names */}
              {selectedRecord.drug_names.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--vdp-muted)] font-semibold tracking-wider mb-2">
                    Other & Vernacular Names
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.drug_names.map((n, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] rounded-md border border-[var(--vdp-line)] text-xs"
                      >
                        {n.name}{" "}
                        {n.type && <span className="text-[var(--vdp-muted)] text-[11px]">({n.type})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diseases Treated */}
              {selectedRecord.diseases.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--vdp-muted)] font-semibold tracking-wider mb-2">
                    Diseases Treated
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.diseases.map((d, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#3F7A4B]/10 text-[#3F7A4B] rounded-md border border-[#3F7A4B]/20 text-xs font-medium"
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
                  <h4 className="text-xs uppercase text-[var(--vdp-muted)] font-semibold tracking-wider mb-2">
                    Usage & Preparation Methods
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.usage_methods.map((um, i) => (
                      <div
                        key={i}
                        className="bg-[var(--vdp-sunk)]/40 p-3 rounded-xl border border-[var(--vdp-line)] text-[var(--vdp-ink)] leading-relaxed text-xs"
                      >
                        {um.disease?.name && (
                          <span className="text-[#3F7A4B] font-semibold block mb-1">
                            For: {um.disease.name}
                          </span>
                        )}
                        {renderClickableText(um.method_description)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research & Publications */}
              {selectedRecord.research.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--vdp-muted)] font-semibold tracking-wider mb-2">
                    Scientific Research & References
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.research.map((r, i) => {
                      const parsed = parseResearchItem(r);
                      return (
                        <div
                          key={i}
                          className="bg-[var(--vdp-sunk)]/40 border border-[var(--vdp-line)] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="text-[var(--vdp-ink)] font-semibold text-sm">
                              {parsed.link ? (
                                <a
                                  href={parsed.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--vdp-ink)] hover:text-[var(--vdp-accent)] hover:underline inline-flex items-center gap-1.5"
                                >
                                  {parsed.title}
                                  <ExternalLink className="w-3.5 h-3.5 text-[var(--vdp-accent)] shrink-0" />
                                </a>
                              ) : (
                                parsed.title
                              )}
                            </div>
                            {parsed.type && (
                              <span className="inline-block px-2 py-0.5 rounded bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] uppercase text-[10px] font-bold border border-[var(--vdp-line)]">
                                {parsed.type}
                              </span>
                            )}
                          </div>
                          {parsed.link && (
                            <a
                              href={parsed.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--vdp-accent)] text-white hover:opacity-90 transition-all font-medium text-xs shrink-0 shadow-xs"
                            >
                              Open Publication <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Photographs & Media Links */}
              {selectedRecord.photos && selectedRecord.photos.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--vdp-muted)] font-semibold tracking-wider mb-2">
                    Photographs & Documentation Media
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedRecord.photos.map((p, i) => {
                      if (!p.image_url) return null;
                      const href = formatUrl(p.image_url);
                      return (
                        <a
                          key={i}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-[var(--vdp-sunk)]/50 hover:bg-white border border-[var(--vdp-line)] hover:border-[var(--vdp-accent)] rounded-xl transition-all block group"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-[var(--vdp-ink)] group-hover:text-[var(--vdp-accent)]">
                            <span className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[var(--vdp-accent)]" />
                              Photo Documentation #{i + 1}
                            </span>
                            <ExternalLink className="w-3 h-3 text-[var(--vdp-muted)] group-hover:text-[var(--vdp-accent)]" />
                          </div>
                          <span className="text-[11px] text-[var(--vdp-muted)] break-all line-clamp-1 mt-1 block group-hover:underline">
                            {p.image_url}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contributor Information (Admin Only) */}
              {isAdmin && selectedRecord.contributors && selectedRecord.contributors.length > 0 && (
                <div className="p-4 bg-[var(--vdp-sunk)]/50 rounded-xl border border-[var(--vdp-line)] space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--vdp-accent)]" />
                    <h4 className="text-xs uppercase text-[var(--vdp-accent)] font-bold tracking-wider">
                      Contributor Profile (Curator Confidential)
                    </h4>
                  </div>
                  {selectedRecord.contributors.map((c, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--vdp-ink)] pt-2 border-t border-[var(--vdp-line)]">
                      <div>
                        <span className="text-[var(--vdp-muted)] block">Name:</span>
                        <b className="text-[var(--vdp-ink)]">{c.name || "N/A"}</b>
                      </div>
                      {c.age && (
                        <div>
                          <span className="text-[var(--vdp-muted)] block">Age:</span>
                          <span>{c.age} years</span>
                        </div>
                      )}
                      {c.address && (
                        <div>
                          <span className="text-[var(--vdp-muted)] block">Address:</span>
                          <span>{renderClickableText(c.address)}</span>
                        </div>
                      )}
                      {c.guru_name && (
                        <div>
                          <span className="text-[var(--vdp-muted)] block">Guru / Mentor:</span>
                          <span>{c.guru_name}</span>
                        </div>
                      )}
                      {c.practice_duration && (
                        <div>
                          <span className="text-[var(--vdp-muted)] block">Practice Duration:</span>
                          <span>{c.practice_duration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-[var(--vdp-line)] flex flex-wrap items-center justify-between gap-2 bg-[var(--vdp-sunk)]/50 shrink-0">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        const rec = selectedRecord;
                        setSelectedRecord(null);
                        handleStartEdit(rec);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--vdp-accent-soft)] bg-[var(--vdp-accent-soft)] text-[var(--vdp-accent)] hover:bg-[var(--vdp-accent)] hover:text-white font-medium text-xs transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit Record
                    </button>
                    <button
                      onClick={() => {
                        const rec = selectedRecord;
                        setRecordToDelete(rec);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#F6E2CF] bg-[#F6E2CF] text-[#B4531A] hover:bg-[#B4531A] hover:text-white font-medium text-xs transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete Record
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg border border-[var(--vdp-line)] bg-white hover:bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] text-xs font-medium cursor-pointer transition-all shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,42,31,0.5)] backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--vdp-surface)] border border-[var(--vdp-line)] rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#F6E2CF] text-[#B4531A] border border-[#F6E2CF] shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--vdp-ink)]">Delete Formulation</h3>
                <p className="text-xs text-[var(--vdp-muted)]">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F6E2CF]/50 border border-[#F6E2CF] text-xs sm:text-sm text-[var(--vdp-ink)] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <b className="text-[#B4531A] font-semibold">{recordToDelete.primary_name || "this formulation"}</b>?
              All linked names, disease associations, research citations, and methods will be removed.
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-[var(--vdp-line)] bg-white hover:bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] font-medium cursor-pointer text-xs transition-all shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B4531A] hover:opacity-90 text-white font-medium cursor-pointer text-xs transition-all shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Formulation Modal */}
      {recordToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,42,31,0.5)] backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--vdp-surface)] border border-[var(--vdp-line)] rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-[var(--vdp-line)] flex justify-between items-center bg-[var(--vdp-sunk)]/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[var(--vdp-accent-soft)] border border-[var(--vdp-line)] text-[var(--vdp-accent)] shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-serif font-bold text-[var(--vdp-ink)] tracking-tight">Edit Formulation Record</h2>
                  <p className="text-[11px] sm:text-xs text-[var(--vdp-muted)]">Modify formulation attributes, names, diseases, and research.</p>
                </div>
              </div>
              <button
                onClick={() => setRecordToEdit(null)}
                className="p-1 rounded-lg hover:bg-[var(--vdp-sunk)] text-[var(--vdp-muted)] hover:text-[var(--vdp-ink)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs sm:text-sm flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-[var(--vdp-muted)] font-semibold block mb-1.5">
                    Primary Name <span className="text-[#B4531A]">*</span>
                  </label>
                  <input
                    value={editFormData.primary_name}
                    onChange={(e) => setEditFormData({ ...editFormData, primary_name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-sm focus:outline-none focus:border-[var(--vdp-accent)]"
                    placeholder="e.g. Tulsi, Guduchi, Ashwagandha"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-[var(--vdp-muted)] font-semibold block mb-1.5">
                    Source Type <span className="text-[#B4531A]">*</span>
                  </label>
                  <select
                    value={editFormData.source_type}
                    onChange={(e) => setEditFormData({ ...editFormData, source_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-sm focus:outline-none focus:border-[var(--vdp-accent)]"
                  >
                    <option value="PLANT">PLANT</option>
                    <option value="ANIMAL">ANIMAL</option>
                    <option value="MINERAL">MINERAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase text-[var(--vdp-muted)] font-semibold block mb-1.5">
                  Botanical Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.botanical_description}
                  onChange={(e) => setEditFormData({ ...editFormData, botanical_description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-sm focus:outline-none focus:border-[var(--vdp-accent)] leading-relaxed"
                  placeholder="Physical description, morphological details, habitat, or characteristics..."
                />
              </div>

              {/* Names Section */}
              <div className="p-4 bg-[var(--vdp-sunk)]/40 rounded-xl border border-[var(--vdp-line)] space-y-3">
                <h4 className="text-xs uppercase text-[var(--vdp-accent)] font-bold tracking-wider">
                  Alternative & Vernacular Names (Semicolon &quot;;&quot; separated)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Botanical / Latin Names</label>
                    <input
                      value={editFormData.botanical_names}
                      onChange={(e) => setEditFormData({ ...editFormData, botanical_names: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="Ocimum sanctum; Ocimum tenuiflorum"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Sanskrit Names</label>
                    <input
                      value={editFormData.sanskrit_names}
                      onChange={(e) => setEditFormData({ ...editFormData, sanskrit_names: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="Surasa; Vaishnavi; Tulasi"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Vernacular / Regional Names</label>
                    <input
                      value={editFormData.vernacular_names}
                      onChange={(e) => setEditFormData({ ...editFormData, vernacular_names: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="Holy Basil; Thulasi; Tulsi"
                    />
                  </div>
                </div>
              </div>

              {/* Diseases and Usage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-[var(--vdp-muted)] font-semibold block mb-1.5">
                    Diseases Treated (Semicolon &quot;;&quot; separated)
                  </label>
                  <input
                    value={editFormData.diseases}
                    onChange={(e) => setEditFormData({ ...editFormData, diseases: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-sm focus:outline-none focus:border-[var(--vdp-accent)]"
                    placeholder="Fever; Cough; Respiratory Disorders; Skin Allergy"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-[var(--vdp-muted)] font-semibold block mb-1.5">
                    Usage & Preparation Methods (Semicolon &quot;;&quot; separated)
                  </label>
                  <input
                    value={editFormData.usage_methods}
                    onChange={(e) => setEditFormData({ ...editFormData, usage_methods: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-sm focus:outline-none focus:border-[var(--vdp-accent)]"
                    placeholder="Boil leaves in water twice daily; Apply fresh paste topically"
                  />
                </div>
              </div>

              {/* Research Section */}
              <div className="p-4 bg-[var(--vdp-sunk)]/40 rounded-xl border border-[var(--vdp-line)] space-y-3">
                <h4 className="text-xs uppercase text-[var(--vdp-accent)] font-bold tracking-wider">
                  Research & Studies (Title | Link, Semicolon separated)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Research Articles</label>
                    <input
                      value={editFormData.research_articles}
                      onChange={(e) => setEditFormData({ ...editFormData, research_articles: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="Phytochemical analysis | https://pubmed.ncbi.nlm.nih.gov/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Academic Theses</label>
                    <input
                      value={editFormData.research_thesis}
                      onChange={(e) => setEditFormData({ ...editFormData, research_thesis: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="Clinical efficacy thesis | https://shodhganga.inflibnet.ac.in/..."
                    />
                  </div>
                </div>
              </div>

              {/* Contributor Section */}
              <div className="p-4 bg-[var(--vdp-sunk)]/40 rounded-xl border border-[var(--vdp-line)] space-y-3">
                <h4 className="text-xs uppercase text-[var(--vdp-accent)] font-bold tracking-wider">
                  Contributor Profile Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Contributor Name</label>
                    <input
                      value={editFormData.contributor_name}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_name: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="e.g. Vaidya Ramesh"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Age</label>
                    <input
                      type="number"
                      value={editFormData.contributor_age}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_age: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="e.g. 58"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Practice Duration</label>
                    <input
                      value={editFormData.contributor_practice}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_practice: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="e.g. 25 years"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Address / Region</label>
                    <input
                      value={editFormData.contributor_address}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_address: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="e.g. Udupi, Karnataka"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--vdp-muted)] font-medium block mb-1">Guru / Mentor</label>
                    <input
                      value={editFormData.contributor_guru}
                      onChange={(e) => setEditFormData({ ...editFormData, contributor_guru: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[var(--vdp-line)] text-[var(--vdp-ink)] text-xs focus:outline-none focus:border-[var(--vdp-accent)]"
                      placeholder="e.g. Acharya Shrinath"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[var(--vdp-line)] shrink-0">
                <button
                  type="button"
                  onClick={() => setRecordToEdit(null)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-[var(--vdp-line)] bg-white hover:bg-[var(--vdp-sunk)] text-[var(--vdp-ink)] text-xs font-medium cursor-pointer transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--vdp-accent)] hover:opacity-90 text-white text-xs font-semibold cursor-pointer shadow-xs transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
