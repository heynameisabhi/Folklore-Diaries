"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, Loader2, Filter, Eye, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SearchResult {
  id: string;
  primary_name: string | null;
  botanical_description: string | null;
  source_type: string | null;
  abstract: string;
  drug_names: any[];
  diseases: string[];
  usage_methods: any[];
  research: any[];
  photos: any[];
}

export default function ManualSearchView({ role = "user" }: { role?: "admin" | "user" }) {
  const [query, setQuery] = useState("");
  const [diseaseName, setDiseaseName] = useState("");
  const [researchTitle, setResearchTitle] = useState("");
  const [sourceType, setSourceType] = useState("");

  const [searchParams, setSearchParams] = useState({
    query: "",
    diseaseName: "",
    researchTitle: "",
    sourceType: "",
  });

  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const { data: results = [], isLoading, isError, error, refetch } = useQuery<SearchResult[]>({
    queryKey: ["manual-search", searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append("query", searchParams.query);
      if (searchParams.diseaseName) params.append("diseaseName", searchParams.diseaseName);
      if (searchParams.researchTitle) params.append("researchTitle", searchParams.researchTitle);
      if (searchParams.sourceType) params.append("sourceType", searchParams.sourceType);

      const res = await axios.get(`/api/search?${params.toString()}`);
      return res.data.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      query,
      diseaseName,
      researchTitle,
      sourceType,
    });
  };

  const handleClear = () => {
    setQuery("");
    setDiseaseName("");
    setResearchTitle("");
    setSourceType("");
    setSearchParams({
      query: "",
      diseaseName: "",
      researchTitle: "",
      sourceType: "",
    });
  };

  const isAdmin = role === "admin";

  return (
    <div
      style={{
        ["--msv-bg" as any]: isAdmin ? "#F3EEE0" : "#EEF1E6",
        ["--msv-surface" as any]: isAdmin ? "#FDFBF4" : "#FBFCF7",
        ["--msv-sunk" as any]: isAdmin ? "#EAE2CC" : "#E3E8D8",
        ["--msv-line" as any]: isAdmin ? "#D9CFB3" : "#CFD7C3",
        ["--msv-accent" as any]: isAdmin ? "#8A5A00" : "#1F5A3D",
        ["--msv-accent-soft" as any]: isAdmin ? "#F3E3B8" : "#D5E6D3",
        ["--msv-ink" as any]: "#1B2A1F",
        ["--msv-muted" as any]: "#56655A",
        color: "var(--msv-ink)",
      }}
      className="msv-scope flex flex-col gap-6 pt-6 sm:pt-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto h-full overflow-y-auto"
    >
      <style>{`
        .msv-scope {
          color: var(--msv-ink) !important;
        }
        .msv-scope [data-slot="card"],
        .msv-scope .bg-card,
        .msv-scope [class*="bg-zinc-9"],
        .msv-scope [class*="bg-black/8"],
        .msv-scope [class*="bg-black/9"] {
          background-color: var(--msv-surface) !important;
          border-color: var(--msv-line) !important;
          color: var(--msv-ink) !important;
        }
        .msv-scope [class*="bg-zinc-8"],
        .msv-scope [class*="bg-zinc-7"] {
          background-color: var(--msv-sunk) !important;
          border-color: var(--msv-line) !important;
          color: var(--msv-ink) !important;
        }
        .msv-scope [class*="border-zinc-"] {
          border-color: var(--msv-line) !important;
        }
        .msv-scope .text-white,
        .msv-scope [class*="text-zinc-1"],
        .msv-scope [class*="text-zinc-2"],
        .msv-scope [class*="text-zinc-3"] {
          color: var(--msv-ink) !important;
        }
        .msv-scope [class*="text-zinc-4"],
        .msv-scope [class*="text-zinc-5"] {
          color: var(--msv-muted) !important;
        }
        .msv-scope input,
        .msv-scope select {
          background-color: #FFFFFF !important;
          border-color: var(--msv-line) !important;
          color: var(--msv-ink) !important;
        }
        .msv-scope button.bg-emerald-600 {
          background: var(--msv-accent) !important;
          color: #ffffff !important;
        }
        .msv-scope .fixed.inset-0.z-50 {
          background-color: rgba(27, 42, 31, 0.45) !important;
        }
      `}</style>
      <div>
        <h1
          style={{ fontFamily: 'var(--serif)', color: "var(--msv-ink)" }}
          className="text-2xl sm:text-3xl font-semibold flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              background: "var(--msv-accent-soft)",
              color: "var(--msv-accent)",
              border: "1px solid var(--msv-line)",
            }}
          >
            <Search className="h-5 w-5" />
          </div>
          <span>Manual Search {isAdmin ? "• Curator Console" : "• Researcher Portal"}</span>
        </h1>
        <p style={{ color: "var(--msv-muted)" }} className="mt-2 text-xs sm:text-sm">
          Advanced search for uploaded drugs, diseases, and research data.
        </p>
      </div>

      <Card className="bg-[var(--msv-surface)] border border-[var(--msv-line)] text-[var(--msv-ink)] rounded-2xl shadow-xs">
        <CardHeader className="border-b border-[var(--msv-line)] pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-serif font-bold text-[var(--msv-ink)]">
            <Filter className="h-5 w-5 text-[var(--msv-accent)]" />
            Search Filters
          </CardTitle>
          <CardDescription className="text-[var(--msv-muted)] text-xs sm:text-sm">
            Fill in any of the fields below to narrow down your search.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-1.5 block">
                  Search Query (Name, Description, Usage)
                </label>
                <Input
                  placeholder="e.g. Tulsi, Ocimum, Cough"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-white border-[var(--msv-line)] text-[var(--msv-ink)] placeholder:text-[var(--msv-muted)] text-sm rounded-xl focus-visible:ring-[var(--msv-accent)]"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-1.5 block">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[var(--msv-line)] text-sm text-[var(--msv-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--msv-accent)]"
                >
                  <option value="">All Source Types</option>
                  <option value="PLANT">PLANT</option>
                  <option value="ANIMAL">ANIMAL</option>
                  <option value="MINERAL">MINERAL</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-1.5 block">
                  Disease Name
                </label>
                <Input
                  placeholder="e.g. Fever, Diabetes, Skin Disease"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  className="bg-white border-[var(--msv-line)] text-[var(--msv-ink)] placeholder:text-[var(--msv-muted)] text-sm rounded-xl focus-visible:ring-[var(--msv-accent)]"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-1.5 block">
                  Research Title
                </label>
                <Input
                  placeholder="e.g. Phytochemical, Antimicrobial"
                  value={researchTitle}
                  onChange={(e) => setResearchTitle(e.target.value)}
                  className="bg-white border-[var(--msv-line)] text-[var(--msv-ink)] placeholder:text-[var(--msv-muted)] text-sm rounded-xl focus-visible:ring-[var(--msv-accent)]"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="border-[var(--msv-line)] bg-white hover:bg-[var(--msv-sunk)] text-[var(--msv-ink)] cursor-pointer text-xs sm:text-sm rounded-xl shadow-xs"
              >
                Clear Filters
              </Button>
              <Button type="submit" className="bg-[var(--msv-accent)] hover:opacity-90 text-white cursor-pointer text-xs sm:text-sm rounded-xl shadow-xs font-semibold">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-serif font-bold text-[var(--msv-ink)]">
          Search Results{" "}
          <span className="text-[var(--msv-muted)] text-sm font-normal">({results.length} found)</span>
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--msv-accent)]" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-[#F6E2CF] border border-[#B4531A] rounded-2xl text-[#B4531A]">
            Failed to load search results: {(error as any)?.message}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-[var(--msv-muted)] border border-dashed border-[var(--msv-line)] rounded-2xl bg-[var(--msv-surface)]">
            No records found matching the specified filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((item) => (
              <Card key={item.id} className="bg-[var(--msv-surface)] border border-[var(--msv-line)] hover:border-[var(--msv-accent)] transition-all rounded-2xl shadow-xs">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold text-[var(--msv-ink)]">
                      {item.primary_name || "Unnamed Record"}
                    </h3>
                    <p className="text-[var(--msv-muted)] text-sm mt-1 leading-relaxed">
                      {item.abstract}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedItem(item)}
                    variant="outline"
                    className="bg-white border border-[var(--msv-line)] text-[var(--msv-ink)] hover:bg-[var(--msv-sunk)] shrink-0 cursor-pointer rounded-xl font-medium shadow-xs"
                  >
                    <Eye className="h-4 w-4 mr-2 text-[var(--msv-accent)]" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,42,31,0.5)] backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--msv-surface)] border border-[var(--msv-line)] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl text-[var(--msv-ink)]">
            <div className="p-4 border-b border-[var(--msv-line)] flex justify-between items-center bg-[var(--msv-sunk)]/50 shrink-0">
              <h2 className="text-xl font-serif font-bold text-[var(--msv-ink)]">
                {selectedItem.primary_name || "Record Details"}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-[var(--msv-sunk)] text-[var(--msv-muted)] hover:text-[var(--msv-ink)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-1">Source Type</h4>
                  <p className="text-[var(--msv-ink)] font-medium">{selectedItem.source_type || "N/A"}</p>
                </div>
                {selectedItem.botanical_description && (
                  <div className="md:col-span-2">
                    <h4 className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-1">Botanical Description</h4>
                    <p className="text-[var(--msv-ink)] text-sm leading-relaxed bg-[var(--msv-sunk)]/40 p-3.5 rounded-xl border border-[var(--msv-line)]">{selectedItem.botanical_description}</p>
                  </div>
                )}
              </div>

              {/* Other Names */}
              {selectedItem.drug_names.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-2">Other Names</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.drug_names.map((n, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[var(--msv-sunk)] text-[var(--msv-ink)] rounded-md border border-[var(--msv-line)] text-sm">
                        {n.name} <span className="text-[var(--msv-muted)] text-xs ml-1">({n.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diseases & Usage */}
              {selectedItem.diseases.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-2">Treats Diseases</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedItem.diseases.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#3F7A4B]/10 text-[#3F7A4B] rounded-md text-sm border border-[#3F7A4B]/20 font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                  
                  {selectedItem.usage_methods.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs uppercase text-[var(--msv-muted)] font-semibold">Usage Methods</h4>
                      {selectedItem.usage_methods.map((um, i) => (
                        <div key={i} className="bg-[var(--msv-sunk)]/40 p-3 rounded-xl border border-[var(--msv-line)] text-sm text-[var(--msv-ink)]">
                          {um.method_description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Research */}
              {selectedItem.research.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--msv-muted)] font-semibold mb-2">Research</h4>
                  <div className="space-y-2">
                    {selectedItem.research.map((r, i) => (
                      <div key={i} className="bg-[var(--msv-sunk)]/40 border border-[var(--msv-line)] p-3 rounded-xl">
                        <div className="text-[var(--msv-accent)] font-medium">{r.title}</div>
                        <div className="text-[var(--msv-muted)] text-xs mt-1 uppercase">{r.type}</div>
                        {r.link && (
                          <a href={r.link} target="_blank" rel="noreferrer" className="text-[var(--msv-accent)] text-sm mt-2 inline-block hover:underline">
                            View Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[var(--msv-line)] bg-[var(--msv-sunk)]/50 flex justify-end shrink-0">
              <Button onClick={() => setSelectedItem(null)} className="cursor-pointer bg-[var(--msv-accent)] text-white hover:opacity-90 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

