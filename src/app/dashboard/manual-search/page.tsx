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

export default function ManualSearchPage() {
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
    <div className="flex flex-col gap-6 pt-10 text-zinc-400 px-6 pb-20 max-w-6xl mx-auto h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold text-zinc-200">Manual Search</h1>
        <p className="text-zinc-500 mt-2">
          Advanced search for uploaded drugs, diseases, and research data.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-500" />
            Search Filters
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Fill in any of the fields below to narrow down your search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">General Keyword</label>
                <Input
                  placeholder="Search names, descriptions..."
                  className="bg-zinc-800 border-zinc-700"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Disease Name</label>
                <Input
                  placeholder="e.g., Fever, Cough..."
                  className="bg-zinc-800 border-zinc-700"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Research Title</label>
                <Input
                  placeholder="Title of article or thesis..."
                  className="bg-zinc-800 border-zinc-700"
                  value={researchTitle}
                  onChange={(e) => setResearchTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                >
                  <option value="">Any Source Type</option>
                  <option value="PLANT">Plant</option>
                  <option value="ANIMAL">Animal</option>
                  <option value="MINERAL">Mineral</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                Clear Filters
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
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
          {results.length > 0 && <span className="text-zinc-500 text-sm font-normal">({results.length} found)</span>}
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Searching database...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">
            Failed to load search results: {(error as any)?.message}
          </div>
        ) : results.length === 0 && Object.values(searchParams).some((v) => v !== "") ? (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            No records found matching your criteria.
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-lg">
            Enter search criteria above to see results.
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
