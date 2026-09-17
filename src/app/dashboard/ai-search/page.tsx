"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, Loader2, Eye, X, BrainCircuit, Sparkles } from "lucide-react";
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

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  // Debounce the query by 600ms so we don't spam the Gemini API on every single keystroke
  const debouncedQuery = useDebounce(query, 600);

  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["ai-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { data: [], aiFilters: null };
      const res = await axios.get(`/api/ai-search?query=${encodeURIComponent(debouncedQuery)}`);
      return res.data;
    },
    enabled: debouncedQuery.length > 2, // Only trigger if they typed at least 3 chars
    staleTime: 1000 * 60 * 5, // Cache results for 5 mins
  });

  const results: SearchResult[] = data?.data || [];
  const aiFilters = data?.aiFilters;

  return (
    <div className="flex flex-col gap-6 pt-10 text-zinc-400 px-6 pb-20 max-w-6xl mx-auto h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-emerald-400" />
          AI Search
        </h1>
        <p className="text-zinc-500 mt-2">
          Type naturally. The AI will understand your sentence and extract the filters automatically.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-white relative overflow-hidden">
        {/* Decorative AI background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <CardContent className="pt-6 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
            <Input
              placeholder="e.g. 'Show me plants that treat fever' or 'mineral remedies for skin disease'"
              className="bg-zinc-950 border-zinc-800 pl-12 pr-12 h-14 text-lg focus-visible:ring-emerald-500/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isFetching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 animate-spin" />
            )}
          </div>

          {/* Show how AI understood the query */}
          {aiFilters && Object.values(aiFilters).some((val) => val) && !isFetching && (
            <div className="mt-4 flex items-center gap-2 flex-wrap text-sm">
              <span className="flex items-center gap-1 text-zinc-500 mr-2">
                <Sparkles className="h-4 w-4 text-cyan-500" /> AI extracted:
              </span>
              {aiFilters.keyword && (
                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
                  Keyword: <b className="text-white">{aiFilters.keyword}</b>
                </span>
              )}
              {aiFilters.diseaseName && (
                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
                  Disease: <b className="text-white">{aiFilters.diseaseName}</b>
                </span>
              )}
              {aiFilters.sourceType && (
                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
                  Source: <b className="text-white">{aiFilters.sourceType}</b>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="flex flex-col gap-4">
        {debouncedQuery.length > 2 && (
          <h2 className="text-xl font-semibold text-zinc-300">
            Search Results{" "}
            {results.length > 0 && <span className="text-zinc-500 text-sm font-normal">({results.length} found)</span>}
          </h2>
        )}

        {isFetching && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <BrainCircuit className="h-10 w-10 animate-pulse text-emerald-500/50 mb-4" />
            <p>AI is analyzing your query...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">
            Failed to load search results: {(error as any)?.message}
          </div>
        ) : debouncedQuery.length > 2 && results.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            No records found matching what the AI understood. Try rephrasing!
          </div>
        ) : debouncedQuery.length <= 2 ? (
          <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-lg">
            Start typing a natural sentence above to search. (e.g., "Herbs for cold")
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((item) => (
              <Card key={item.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-emerald-400">
                      {item.primary_name || "Unnamed Record"}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      {item.abstract}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedItem(item)}
                    variant="outline"
                    className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white shrink-0 cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-xl font-bold text-white">
                {selectedItem.primary_name || "Record Details"}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold mb-1">Source Type</h4>
                  <p className="text-zinc-200">{selectedItem.source_type || "N/A"}</p>
                </div>
                {selectedItem.botanical_description && (
                  <div className="md:col-span-2">
                    <h4 className="text-xs uppercase text-zinc-500 font-semibold mb-1">Botanical Description</h4>
                    <p className="text-zinc-200 text-sm leading-relaxed">{selectedItem.botanical_description}</p>
                  </div>
                )}
              </div>

              {/* Other Names */}
              {selectedItem.drug_names.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold mb-2">Other Names</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.drug_names.map((n, i) => (
                      <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-sm">
                        {n.name} <span className="text-zinc-500 text-xs ml-1">({n.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diseases & Usage */}
              {selectedItem.diseases.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold mb-2">Treats Diseases</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedItem.diseases.map((d, i) => (
                      <span key={i} className="px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded text-sm border border-emerald-900/50">
                        {d}
                      </span>
                    ))}
                  </div>
                  
                  {selectedItem.usage_methods.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs uppercase text-zinc-500 font-semibold">Usage Methods</h4>
                      {selectedItem.usage_methods.map((um, i) => (
                        <div key={i} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-800 text-sm text-zinc-300">
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
                  <h4 className="text-xs uppercase text-zinc-500 font-semibold mb-2">Research</h4>
                  <div className="space-y-2">
                    {selectedItem.research.map((r, i) => (
                      <div key={i} className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg">
                        <div className="text-blue-400 font-medium">{r.title}</div>
                        <div className="text-zinc-500 text-xs mt-1 uppercase">{r.type}</div>
                        {r.link && (
                          <a href={r.link} target="_blank" rel="noreferrer" className="text-blue-500 text-sm mt-2 inline-block hover:underline">
                            View Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-800 flex justify-end">
              <Button onClick={() => setSelectedItem(null)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
