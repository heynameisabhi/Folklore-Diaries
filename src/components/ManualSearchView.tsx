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

  return (
    <div className="flex flex-col gap-6 pt-6 sm:pt-10 text-zinc-400 px-4 sm:px-6 pb-20 max-w-6xl mx-auto h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-200">
          Manual Search {role === "admin" ? "(Admin Panel)" : ""}
        </h1>
        <p className="text-zinc-500 mt-2 text-xs sm:text-sm">
          Advanced search for uploaded drugs, diseases, and research data.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-5 w-5 text-emerald-500" />
            Search Filters
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs sm:text-sm">
            Fill in any of the fields below to narrow down your search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-zinc-400 font-semibold mb-1 block">
                  Search Query (Name, Description, Usage)
                </label>
                <Input
                  placeholder="e.g. Tulsi, Ocimum, Cough"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-zinc-400 font-semibold mb-1 block">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Source Types</option>
                  <option value="PLANT">PLANT</option>
                  <option value="ANIMAL">ANIMAL</option>
                  <option value="MINERAL">MINERAL</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase text-zinc-400 font-semibold mb-1 block">
                  Disease Name
                </label>
                <Input
                  placeholder="e.g. Fever, Diabetes, Skin Disease"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-zinc-400 font-semibold mb-1 block">
                  Research Title
                </label>
                <Input
                  placeholder="e.g. Phytochemical, Antimicrobial"
                  value={researchTitle}
                  onChange={(e) => setResearchTitle(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 cursor-pointer text-xs sm:text-sm"
              >
                Clear Filters
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer text-xs sm:text-sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-300">
          Search Results{" "}
          <span className="text-zinc-500 text-sm font-normal">({results.length} found)</span>
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">
            Failed to load search results: {(error as any)?.message}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            No records found matching the specified filters.
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

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 shrink-0">
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
            
            <div className="p-4 border-t border-zinc-800 flex justify-end shrink-0">
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

