"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, Loader2, Eye, X, BrainCircuit, Sparkles, Info, ExternalLink } from "lucide-react";
import { formatUrl, parseResearchItem, renderClickableText } from "@/helpers/linkUtils";
import {
  Card,
  CardContent,
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

// Custom hook for debouncing input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function AISearchView({ role = "user" }: { role?: "admin" | "user" }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 600);

  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["ai-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { data: [], aiFilters: null };
      const res = await axios.get(`/api/ai-search?query=${encodeURIComponent(debouncedQuery)}`);
      return res.data;
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60 * 5,
  });

  const results: SearchResult[] = data?.data || [];
  const aiFilters = data?.aiFilters;

  const isAdmin = role === "admin";

  return (
    <div
      style={{
        ["--ais-bg" as any]: isAdmin ? "#F3EEE0" : "#EEF1E6",
        ["--ais-surface" as any]: isAdmin ? "#FDFBF4" : "#FBFCF7",
        ["--ais-sunk" as any]: isAdmin ? "#EAE2CC" : "#E3E8D8",
        ["--ais-line" as any]: isAdmin ? "#D9CFB3" : "#CFD7C3",
        ["--ais-accent" as any]: isAdmin ? "#8A5A00" : "#1F5A3D",
        ["--ais-accent-soft" as any]: isAdmin ? "#F3E3B8" : "#D5E6D3",
        ["--ais-ink" as any]: "#1B2A1F",
        ["--ais-muted" as any]: "#56655A",
        color: "var(--ais-ink)",
      }}
      className="ais-scope flex flex-col gap-6 pt-6 sm:pt-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto h-full overflow-y-auto"
    >
      <style>{`
        .ais-scope {
          color: var(--ais-ink) !important;
        }
        .ais-scope [data-slot="card"],
        .ais-scope .bg-card,
        .ais-scope [class*="bg-zinc-9"],
        .ais-scope [class*="bg-black/8"],
        .ais-scope [class*="bg-black/9"] {
          background-color: var(--ais-surface) !important;
          border-color: var(--ais-line) !important;
          color: var(--ais-ink) !important;
        }
        .ais-scope [class*="bg-zinc-8"],
        .ais-scope [class*="bg-zinc-7"] {
          background-color: var(--ais-sunk) !important;
          border-color: var(--ais-line) !important;
          color: var(--ais-ink) !important;
        }
        .ais-scope [class*="border-zinc-"] {
          border-color: var(--ais-line) !important;
        }
        .ais-scope .text-white,
        .ais-scope [class*="text-zinc-1"],
        .ais-scope [class*="text-zinc-2"],
        .ais-scope [class*="text-zinc-3"] {
          color: var(--ais-ink) !important;
        }
        .ais-scope [class*="text-zinc-4"],
        .ais-scope [class*="text-zinc-5"] {
          color: var(--ais-muted) !important;
        }
        .ais-scope input {
          background-color: #FFFFFF !important;
          border-color: var(--ais-line) !important;
          color: var(--ais-ink) !important;
        }
        .ais-scope input::placeholder {
          color: var(--ais-muted) !important;
        }
        .ais-scope .fixed.inset-0.z-50 {
          background-color: rgba(27, 42, 31, 0.45) !important;
        }
      `}</style>
      <div>
        <h1
          style={{ fontFamily: 'var(--serif)' }}
          className="text-2xl sm:text-3xl font-semibold flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              background: "var(--ais-accent-soft)",
              color: "var(--ais-accent)",
              border: "1px solid var(--ais-line)",
            }}
          >
            <BrainCircuit className="h-6 w-6" />
          </div>
          <span style={{ color: "var(--ais-ink)" }}>AI Search {isAdmin ? "• Curator Console" : "• Researcher Portal"}</span>
        </h1>
        <p style={{ color: "var(--ais-muted)" }} className="mt-2 text-xs sm:text-sm">
          Type naturally. The AI will understand your sentence and extract the filters automatically.
        </p>
      </div>

      <Card className="bg-[var(--ais-surface)] border border-[var(--ais-line)] text-[var(--ais-ink)] rounded-2xl shadow-xs relative overflow-hidden">
        {/* Decorative AI background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ais-accent)]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <CardContent className="pt-6 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ais-accent)]" />
            <Input
              placeholder="e.g. 'Show me plants that treat fever' or 'mineral remedies for skin disease'"
              className="bg-white border border-[var(--ais-line)] text-[var(--ais-ink)] placeholder:text-[var(--ais-muted)] pl-12 pr-12 h-14 text-sm sm:text-base rounded-xl focus-visible:ring-[var(--ais-accent)]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isFetching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ais-accent)] animate-spin" />
            )}
          </div>

          {/* Character threshold note */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-[var(--ais-muted)] flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[var(--ais-accent)] shrink-0" />
              <span>Enter at least <b>3 characters</b> to trigger AI search (avoids incomplete requests while typing).</span>
            </span>
            {query.length > 0 && query.length < 3 && (
              <span className="text-[#B4531A] font-semibold">
                {3 - query.length} more character{3 - query.length === 1 ? "" : "s"} needed
              </span>
            )}
          </div>

          {/* Show how AI understood the query */}
          {aiFilters && Object.values(aiFilters).some((val) => val) && !isFetching && (
            <div className="mt-4 flex items-center gap-2 flex-wrap text-sm">
              <span className="flex items-center gap-1 text-[var(--ais-muted)] mr-2 font-medium">
                <Sparkles className="h-4 w-4 text-[var(--ais-accent)]" /> {aiFilters.fallback ? "Search terms:" : "AI extracted:"}
              </span>
              {aiFilters.keyword && (
                <span className="bg-[var(--ais-sunk)] text-[var(--ais-ink)] px-2.5 py-1 rounded-lg border border-[var(--ais-line)] text-xs">
                  Keyword: <b className="text-[var(--ais-ink)]">{aiFilters.keyword}</b>
                </span>
              )}
              {aiFilters.diseaseName && (
                <span className="bg-[var(--ais-sunk)] text-[var(--ais-ink)] px-2.5 py-1 rounded-lg border border-[var(--ais-line)] text-xs">
                  Disease: <b className="text-[var(--ais-ink)]">{aiFilters.diseaseName}</b>
                </span>
              )}
              {aiFilters.sourceType && (
                <span className="bg-[var(--ais-sunk)] text-[var(--ais-ink)] px-2.5 py-1 rounded-lg border border-[var(--ais-line)] text-xs">
                  Source: <b className="text-[var(--ais-ink)]">{aiFilters.sourceType}</b>
                </span>
              )}
              {aiFilters.fallback && (
                <span className="bg-[#F6E2CF] text-[#B4531A] px-2.5 py-1 rounded-lg border border-[#F6E2CF] text-xs font-semibold">
                  Keyword Mode
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="flex flex-col gap-4">
        {debouncedQuery.length > 2 && (
          <h2 className="text-xl font-serif font-bold text-[var(--ais-ink)]">
            Search Results{" "}
            {results.length > 0 && <span className="text-[var(--ais-muted)] text-sm font-normal">({results.length} found)</span>}
          </h2>
        )}

        {isFetching && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--ais-muted)]">
            <BrainCircuit className="h-10 w-10 animate-pulse text-[var(--ais-accent)] mb-4" />
            <p>AI is analyzing your query...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-[#F6E2CF] border border-[#B4531A] rounded-2xl text-[#B4531A]">
            Failed to load search results: {(error as any)?.response?.data?.error || (error as any)?.message}
          </div>
        ) : debouncedQuery.length > 2 && results.length === 0 ? (
          <div className="text-center py-20 text-[var(--ais-muted)] border border-dashed border-[var(--ais-line)] rounded-2xl bg-[var(--ais-surface)]">
            No records found matching what the AI understood. Try rephrasing!
          </div>
        ) : debouncedQuery.length <= 2 ? (
          <div className="text-center py-20 text-[var(--ais-muted)] border border-dashed border-[var(--ais-line)] rounded-2xl bg-[var(--ais-surface)]">
            Start typing a natural sentence above to search (minimum 3 characters). (e.g., &quot;Herbs for cold&quot;)
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((item) => (
              <Card key={item.id} className="bg-[var(--ais-surface)] border border-[var(--ais-line)] hover:border-[var(--ais-accent)] transition-all rounded-2xl shadow-xs">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold text-[var(--ais-ink)]">
                      {item.primary_name || "Unnamed Record"}
                    </h3>
                    <p className="text-[var(--ais-muted)] text-sm mt-1 leading-relaxed">
                      {item.abstract}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedItem(item)}
                    variant="outline"
                    className="bg-white border border-[var(--ais-line)] text-[var(--ais-ink)] hover:bg-[var(--ais-sunk)] shrink-0 cursor-pointer rounded-xl font-medium shadow-xs"
                  >
                    <Eye className="h-4 w-4 mr-2 text-[var(--ais-accent)]" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal (Same as Manual Search) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,42,31,0.5)] backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--ais-surface)] border border-[var(--ais-line)] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl text-[var(--ais-ink)]">
            <div className="p-4 border-b border-[var(--ais-line)] flex justify-between items-center bg-[var(--ais-sunk)]/50 shrink-0">
              <h2 className="text-xl font-serif font-bold text-[var(--ais-ink)]">
                {selectedItem.primary_name || "Record Details"}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-[var(--ais-sunk)] text-[var(--ais-muted)] hover:text-[var(--ais-ink)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs uppercase text-[var(--ais-muted)] font-semibold mb-1">Source Type</h4>
                  <p className="text-[var(--ais-ink)] font-medium">{selectedItem.source_type || "N/A"}</p>
                </div>
                {selectedItem.botanical_description && (
                  <div className="md:col-span-2">
                    <h4 className="text-xs uppercase text-[var(--ais-muted)] font-semibold mb-1">Botanical Description</h4>
                    <p className="text-[var(--ais-ink)] text-sm leading-relaxed bg-[var(--ais-sunk)]/40 p-3.5 rounded-xl border border-[var(--ais-line)]">
                      {renderClickableText(selectedItem.botanical_description)}
                    </p>
                  </div>
                )}
              </div>

              {/* Other Names */}
              {selectedItem.drug_names.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--ais-muted)] font-semibold mb-2">Other Names</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.drug_names.map((n, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[var(--ais-sunk)] text-[var(--ais-ink)] rounded-md border border-[var(--ais-line)] text-sm">
                        {n.name} <span className="text-[var(--ais-muted)] text-xs ml-1">({n.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diseases & Usage */}
              {selectedItem.diseases.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--ais-muted)] font-semibold mb-2">Treats Diseases</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedItem.diseases.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#3F7A4B]/10 text-[#3F7A4B] rounded-md text-sm border border-[#3F7A4B]/20 font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                  
                  {selectedItem.usage_methods.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs uppercase text-[var(--ais-muted)] font-semibold">Usage Methods</h4>
                      {selectedItem.usage_methods.map((um, i) => (
                        <div key={i} className="bg-[var(--ais-sunk)]/40 p-3 rounded-xl border border-[var(--ais-line)] text-sm text-[var(--ais-ink)]">
                          {renderClickableText(um.method_description)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Research */}
              {selectedItem.research.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-[var(--ais-muted)] font-semibold mb-2">Research & Publications</h4>
                  <div className="space-y-2">
                    {selectedItem.research.map((r, i) => {
                      const parsed = parseResearchItem(r);
                      return (
                        <div key={i} className="bg-[var(--ais-sunk)]/40 border border-[var(--ais-line)] p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="text-[var(--ais-ink)] font-semibold text-sm">
                              {parsed.link ? (
                                <a
                                  href={parsed.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--ais-accent)] hover:underline inline-flex items-center gap-1.5"
                                >
                                  {parsed.title}
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                              ) : (
                                parsed.title
                              )}
                            </div>
                            {parsed.type && <div className="text-[var(--ais-muted)] text-[10px] mt-1 uppercase font-bold">{parsed.type}</div>}
                          </div>
                          {parsed.link && (
                            <a
                              href={parsed.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[var(--ais-accent)] text-white hover:opacity-90 transition-all font-medium text-xs shrink-0 inline-flex items-center gap-1.5"
                            >
                              Open Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[var(--ais-line)] bg-[var(--ais-sunk)]/50 flex justify-end shrink-0">
              <Button onClick={() => setSelectedItem(null)} className="cursor-pointer bg-[var(--ais-accent)] text-white hover:opacity-90 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

