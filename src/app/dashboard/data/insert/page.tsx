"use client";

import type React from "react";
import { useState, useCallback } from "react";
import axios from "axios";
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import Link from "next/link";
import { useDropzone } from "react-dropzone";

// All columns from the CSV
const COLUMNS = [
  { key: "primary_name", label: "Primary Name *", required: true },
  { key: "source_type", label: "Source Type", type: "select" },
  { key: "botanical_description", label: "Botanical Description" },
  { key: "botanical_names", label: "Botanical Names", hint: "semicolon separated" },
  { key: "sanskrit_names", label: "Sanskrit Names", hint: "semicolon separated" },
  { key: "vernacular_names", label: "Vernacular Names", hint: "semicolon separated" },
  { key: "diseases", label: "Diseases", hint: "semicolon separated" },
  { key: "usage_methods", label: "Usage Methods", hint: "semicolon separated" },
  { key: "research_articles", label: "Research Articles", hint: "semicolon separated" },
  { key: "research_thesis", label: "Research Thesis", hint: "semicolon separated" },
  { key: "photo_urls", label: "Photo URLs", hint: "semicolon separated" },
  { key: "contributor_names", label: "Contributor Names", hint: "semicolon separated" },
  { key: "contributor_ages", label: "Contributor Ages", hint: "semicolon separated" },
  { key: "contributor_addresses", label: "Contributor Addresses", hint: "semicolon separated" },
  { key: "contributor_gurus", label: "Contributor Guru Names", hint: "semicolon separated" },
  { key: "contributor_practice_durations", label: "Contributor Practice Durations", hint: "semicolon separated" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

type DrugRow = Record<ColumnKey, string>;

const SOURCE_TYPES = ["PLANT", "ANIMAL", "MINERAL"];

function createEmptyRow(): DrugRow {
  return {
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
    photo_urls: "",
    contributor_names: "",
    contributor_ages: "",
    contributor_addresses: "",
    contributor_gurus: "",
    contributor_practice_durations: "",
  };
}

/**
 * Parse a CSV string into an array of DrugRow objects.
 */
function parseCSV(csvText: string): DrugRow[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );

  const rows: DrugRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = createEmptyRow();

    headers.forEach((header, index) => {
      const val = values[index]?.trim() || "";
      // Map CSV header to our column keys
      const mappedKey = mapHeader(header);
      if (mappedKey && mappedKey in row) {
        (row as any)[mappedKey] = val;
      }
    });

    rows.push(row);
  }
  return rows;
}

/**
 * Map flexible CSV header names to our column keys.
 */
function mapHeader(header: string): ColumnKey | null {
  const map: Record<string, ColumnKey> = {
    primary_name: "primary_name",
    name: "primary_name",
    drug_name: "primary_name",
    source_type: "source_type",
    type: "source_type",
    botanical_description: "botanical_description",
    description: "botanical_description",
    botanical_names: "botanical_names",
    botanical_name: "botanical_names",
    sanskrit_names: "sanskrit_names",
    sanskrit_name: "sanskrit_names",
    vernacular_names: "vernacular_names",
    vernacular_name: "vernacular_names",
    diseases: "diseases",
    disease: "diseases",
    usage_methods: "usage_methods",
    usage_method: "usage_methods",
    research_articles: "research_articles",
    research_article: "research_articles",
    articles: "research_articles",
    research_thesis: "research_thesis",
    thesis: "research_thesis",
    photo_urls: "photo_urls",
    photo_url: "photo_urls",
    photos: "photo_urls",
    contributors: "contributor_names",
    contributor: "contributor_names",
    contributor_names: "contributor_names",
    contributor_name: "contributor_names",
    contributor_ages: "contributor_ages",
    contributor_age: "contributor_ages",
    ages: "contributor_ages",
    age: "contributor_ages",
    contributor_addresses: "contributor_addresses",
    contributor_address: "contributor_addresses",
    addresses: "contributor_addresses",
    address: "contributor_addresses",
    contributor_gurus: "contributor_gurus",
    contributor_guru: "contributor_gurus",
    contributor_guru_name: "contributor_gurus",
    contributor_guru_names: "contributor_gurus",
    guru_name: "contributor_gurus",
    guru_names: "contributor_gurus",
    gurus: "contributor_gurus",
    contributor_practice_durations: "contributor_practice_durations",
    contributor_practice_duration: "contributor_practice_durations",
    practice_durations: "contributor_practice_durations",
    practice_duration: "contributor_practice_durations",
  };
  return map[header] || null;
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

const InsertDataPage: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<DrugRow[]>([]);
  const [isInserting, setIsInserting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<{ inserted: number; updated: number } | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Horizontal scroll tracking for visual indicators
  const [scrollContainerRef, setScrollContainerRef] =
    useState<HTMLDivElement | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setCsvFile(file);
        setError("");
        setSuccess(false);

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const parsed = parseCSV(text);

          if (parsed.length === 0) {
            setError(
              "CSV file is empty or has no data rows. Ensure it has a header row and at least one data row."
            );
            return;
          }

          setTableData(parsed);
          setShowTable(true);
        };
        reader.readAsText(file);
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const updateCell = (
    rowIndex: number,
    field: ColumnKey,
    value: string
  ) => {
    setTableData((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setTableData((prev) => [...prev, createEmptyRow()]);
  };

  const deleteRow = (index: number) => {
    setTableData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsert = async () => {
    setError("");
    setSuccess(false);

    const emptyNames = tableData.filter((row) => !row.primary_name.trim());
    if (emptyNames.length > 0) {
      setError(
        `${emptyNames.length} row(s) are missing a primary name. Please fill them in or delete those rows.`
      );
      return;
    }

    if (tableData.length === 0) {
      setError("No data to insert.");
      return;
    }

    setIsInserting(true);

    try {
      const response = await axios.post("/api/insert-drugs", {
        drugs: tableData,
      });

      const { insertedCount, updatedCount } = response.data;
      setStats({ inserted: insertedCount, updated: updatedCount });
      setSuccess(true);
      toast.success(
        `Processed ${response.data.count} record(s): ${insertedCount} created, ${updatedCount} merged/updated.`
      );
    } catch (err: any) {
      console.error("Insert error:", err);
      const errorMsg =
        err.response?.data?.error || "Failed to insert data. Please try again.";
      const details = err.response?.data?.details;
      setError(details ? `${errorMsg}\n${details.join("\n")}` : errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsInserting(false);
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setTableData([]);
    setShowTable(false);
    setError("");
    setSuccess(false);
    setStats(null);
  };

  const scrollTable = (direction: "left" | "right") => {
    if (scrollContainerRef) {
      const amount = 400;
      scrollContainerRef.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] bg-gradient-to-tl from-zinc-950 via-black/30 to-emerald-950/80 p-6">
      <Card className="w-full max-w-[95vw] border-[#1a1a1a] bg-black shadow-xl backdrop-blur-md">
        <CardHeader className="border-b border-[#1a1a1a] bg-black">
          <CardTitle className="text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-400" />
            Insert Drug Data
          </CardTitle>
          <CardDescription className="text-gray-400">
            Upload a CSV file to preview, edit, and insert drug records into the
            database. Multi-value fields (names, diseases, etc.) should be
            separated by semicolons (;).
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Upload Zone */}
          {!showTable && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                ${
                  isDragActive
                    ? "border-green-500 bg-green-500/10"
                    : csvFile
                    ? "border-green-400 bg-green-400/5"
                    : "border-gray-700 hover:border-gray-500 hover:bg-zinc-900/50"
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-3">
                {csvFile ? (
                  <>
                    <Check className="h-12 w-12 text-green-400" />
                    <p className="text-green-400 font-medium text-lg">
                      {csvFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(csvFile.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-green-900/20 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-gray-300 text-lg font-medium">
                      {isDragActive
                        ? "Drop the CSV file here"
                        : "Drag & drop a CSV file, or click to browse"}
                    </p>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <p>
                        Expected columns: primary_name, source_type,
                        botanical_description, botanical_names, sanskrit_names,
                        vernacular_names, diseases, usage_methods,
                        research_articles, research_thesis, photo_urls,
                        contributor_names, contributor_ages, contributor_addresses,
                        contributor_gurus, contributor_practice_durations
                      </p>
                      <p>
                        Use semicolons (;) to separate multiple values in a
                        single field
                      </p>
                    </div>
                  </>
                )}
            </div>
              <input
                id="test-file-input"
                type="file"
                accept=".csv"
                className="mt-4 p-2 bg-zinc-800 text-white rounded border border-zinc-700 w-full cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onDrop([file]);
                  }
                }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="mt-4 bg-red-950/30 border-red-500/50 text-red-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {success && (
            <Alert className="mt-4 bg-green-950/30 border-green-500/50 text-green-300">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {stats ? (
                  <span>
                    Processed data successfully. Created{" "}
                    <strong>{stats.inserted}</strong> new drug record(s) and
                    merged information into <strong>{stats.updated}</strong>{" "}
                    existing drug record(s) without duplicating database
                    records.
                  </span>
                ) : (
                  <span>
                    Drug records with all related data (names, diseases, usage
                    methods, research, photos, contributors) have been inserted
                    successfully.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Editable Table */}
          {showTable && tableData.length > 0 && (
            <div className="mt-4 space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-300 border-none px-3 py-1"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    {tableData.length} row(s) · {COLUMNS.length} columns
                  </Badge>
                  <p className="text-sm text-gray-400">
                    Edit data below · Use{" "}
                    <code className="text-green-400 bg-zinc-800 px-1 rounded text-xs">
                      ;
                    </code>{" "}
                    for multiple values
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => scrollTable("left")}
                    className="text-gray-300 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => scrollTable("right")}
                    className="text-gray-300 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    className="text-gray-300 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addRow}
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Row
                  </Button>
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="rounded-md border border-[#1a1a1a] overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <div
                    className="overflow-x-auto"
                    ref={(el) => setScrollContainerRef(el)}
                  >
                    <table className="w-max min-w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-zinc-900 border-b border-zinc-800">
                          <th className="text-left text-xs font-semibold text-gray-400 px-3 py-3 w-10 sticky left-0 bg-zinc-900 z-20">
                            #
                          </th>
                          {COLUMNS.map((col) => (
                            <th
                              key={col.key}
                              className="text-left text-xs font-semibold text-gray-400 px-2 py-3 min-w-[180px]"
                            >
                              <div>{col.label}</div>
                              {"hint" in col && col.hint && (
                                <div className="text-[10px] text-gray-600 font-normal mt-0.5">
                                  {col.hint}
                                </div>
                              )}
                            </th>
                          ))}
                          <th className="text-center text-xs font-semibold text-gray-400 px-3 py-3 w-16 sticky right-0 bg-zinc-900 z-20">
                            Del
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
                          >
                            <td className="px-3 py-1.5 text-xs text-gray-500 font-mono sticky left-0 bg-black z-10">
                              {rowIdx + 1}
                            </td>
                            {COLUMNS.map((col) => (
                              <td key={col.key} className="px-2 py-1.5">
                                {"type" in col && col.type === "select" ? (
                                  <select
                                    value={row[col.key]}
                                    onChange={(e) =>
                                      updateCell(
                                        rowIdx,
                                        col.key,
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white text-sm rounded-md px-2 h-8 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer"
                                  >
                                    <option value="">Select...</option>
                                    {SOURCE_TYPES.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <Input
                                    value={row[col.key]}
                                    onChange={(e) =>
                                      updateCell(
                                        rowIdx,
                                        col.key,
                                        e.target.value
                                      )
                                    }
                                    placeholder={col.label.replace(" *", "")}
                                    className="bg-zinc-800/50 border-zinc-700 text-white text-sm h-8 focus-visible:ring-green-500 focus-visible:ring-1 min-w-[160px]"
                                  />
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-1.5 text-center sticky right-0 bg-black z-10">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteRow(rowIdx)}
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/30 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Column legend */}
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 px-1">
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  drug → primary_name, source_type, botanical_description
                </span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  drug_names → botanical, sanskrit, vernacular names
                </span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  disease → diseases
                </span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  usage_method → usage methods
                </span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  research → articles, thesis
                </span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  drug_photos → photo URLs
                </span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">
                  contributor → names, ages, addresses, gurus, practice durations
                </span>
              </div>

              {/* Insert Button */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={handleInsert}
                  disabled={isInserting || tableData.length === 0}
                  className="bg-gradient-to-r from-green-950 to-green-600 hover:from-green-900 hover:to-green-700 text-white font-semibold px-8 py-2 cursor-pointer"
                >
                  {isInserting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inserting into database...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Insert {tableData.length} Record(s) to Database
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-[#1a1a1a] bg-black flex justify-center">
          <div className="text-xs text-gray-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> Multi-value fields use
            semicolons (;) as separators
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InsertDataPage;
