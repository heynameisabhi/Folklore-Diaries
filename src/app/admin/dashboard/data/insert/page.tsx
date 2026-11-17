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
  Sparkles,
  Layers,
  ShieldCheck,
  Image as ImageIcon,
  FolderUp,
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
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { SingleDrugInsertForm } from "@/components/SingleDrugInsertForm";
import { useAuth } from "@/components/useAuth";

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

export default function AdminInsertDataPage() {
  useAuth(["admin"]); // Only admins have insertion privileges

  const [activeTab, setActiveTab] = useState<string>("single");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<DrugRow[]>([]);
  const [isInserting, setIsInserting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<{ inserted: number; updated: number } | null>(null);
  const [showTable, setShowTable] = useState(false);

  const [scrollContainerRef, setScrollContainerRef] =
    useState<HTMLDivElement | null>(null);

  // Batch media upload & auto-matching state
  const [uploadedMediaFiles, setUploadedMediaFiles] = useState<
    { originalName: string; url: string }[]
  >([]);
  const [isUploadingBatchPhotos, setIsUploadingBatchPhotos] = useState(false);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [rowPhotoUploadingIndex, setRowPhotoUploadingIndex] = useState<number | null>(null);

  // Helper function to auto-match photos to drug rows
  const matchPhotosToRows = useCallback(
    (
      rows: DrugRow[],
      photos: { originalName: string; url: string }[]
    ) => {
      if (photos.length === 0) return { updatedRows: rows, matches: 0 };
      let matches = 0;

      const updatedRows = rows.map((row) => {
        let rowUrls = row.photo_urls
          ? row.photo_urls
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        let rowMatched = false;

        photos.forEach(({ originalName, url }) => {
          const baseNameWithoutExt = originalName
            .replace(/\.[^/.]+$/, "")
            .toLowerCase();
          const fullOriginalLower = originalName.toLowerCase();
          const primaryLower = (row.primary_name || "").toLowerCase().trim();

          // Check 1: Does row's photo_urls contain the filename?
          const hasFilenameInPhotos = rowUrls.some((u) => {
            const uLower = u.toLowerCase();
            return (
              uLower === fullOriginalLower ||
              uLower === baseNameWithoutExt ||
              uLower.endsWith(`/${fullOriginalLower}`)
            );
          });

          if (hasFilenameInPhotos) {
            rowUrls = rowUrls.map((u) => {
              const uLower = u.toLowerCase();
              if (
                uLower === fullOriginalLower ||
                uLower === baseNameWithoutExt ||
                uLower.endsWith(`/${fullOriginalLower}`)
              ) {
                rowMatched = true;
                return url;
              }
              return u;
            });
          } else if (
            primaryLower &&
            (primaryLower === baseNameWithoutExt ||
              baseNameWithoutExt.startsWith(primaryLower) ||
              baseNameWithoutExt.includes(primaryLower))
          ) {
            // Check 2: Does image name start with or equal the primary name? (e.g. tulsi.jpg matches Tulsi)
            if (!rowUrls.includes(url)) {
              rowUrls.push(url);
              rowMatched = true;
            }
          }
        });

        if (rowMatched) matches++;
        return {
          ...row,
          photo_urls: Array.from(new Set(rowUrls)).join("; "),
        };
      });

      return { updatedRows, matches };
    },
    []
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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

            let rowsToSet = parsed;
            if (uploadedMediaFiles.length > 0) {
              const { updatedRows, matches } = matchPhotosToRows(
                parsed,
                uploadedMediaFiles
              );
              rowsToSet = updatedRows;
              setMatchedCount(matches);
              if (matches > 0) {
                toast.success(
                  `Auto-matched previously uploaded images to ${matches} drug row(s)!`
                );
              }
            }

            setTableData(rowsToSet);
            setShowTable(true);
          };
          reader.readAsText(file);
        } else {
          setError("Please upload a valid CSV file.");
        }
      }
    },
    [uploadedMediaFiles, matchPhotosToRows]
  );

  const onBatchPhotoDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploadingBatchPhotos(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("folder", "herbs");
      acceptedFiles.forEach((file) => {
        uploadFormData.append("files", file);
      });

      const res = await axios.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && Array.isArray(res.data.files)) {
        const newUploaded = res.data.files.map((f: any) => ({
          originalName: f.originalName,
          url: f.url,
        }));

        const allPhotos = [...uploadedMediaFiles, ...newUploaded];
        setUploadedMediaFiles(allPhotos);

        if (tableData.length > 0) {
          const { updatedRows, matches } = matchPhotosToRows(
            tableData,
            allPhotos
          );
          setTableData(updatedRows);
          setMatchedCount(matches);
          toast.success(
            `Uploaded ${newUploaded.length} photograph${
              newUploaded.length > 1 ? "s" : ""
            }! Auto-matched ${matches} drug row(s) in preview table.`
          );
        } else {
          toast.success(
            `Uploaded ${newUploaded.length} photograph${
              newUploaded.length > 1 ? "s" : ""
            }! They will auto-match when you drop your CSV.`
          );
        }
      } else {
        toast.error(res.data?.error || "Failed to upload photographs");
      }
    } catch (err: any) {
      console.error("Batch photo upload error:", err);
      toast.error(
        err.response?.data?.error || "Failed to upload photographs"
      );
    } finally {
      setIsUploadingBatchPhotos(false);
    }
  };

  const {
    getRootProps: getBatchPhotoRootProps,
    getInputProps: getBatchPhotoInputProps,
    isDragActive: isBatchPhotoDragActive,
  } = useDropzone({
    onDrop: onBatchPhotoDrop,
    accept: {
      "image/*": [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".avif",
        ".tif",
        ".tiff",
        ".bmp",
      ],
    },
    disabled: isUploadingBatchPhotos,
  });

  const handleRowPhotoUpload = async (rowIndex: number, file: File) => {
    setRowPhotoUploadingIndex(rowIndex);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("folder", "herbs");
      uploadFormData.append("file", file);

      const res = await axios.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.files?.[0]?.url) {
        const publicUrl = res.data.files[0].url;
        setTableData((prev) =>
          prev.map((row, i) => {
            if (i !== rowIndex) return row;
            const currentUrls = row.photo_urls
              ? row.photo_urls
                  .split(";")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
            return {
              ...row,
              photo_urls: [...currentUrls, publicUrl].join("; "),
            };
          })
        );
        toast.success(`Photo attached to Row #${rowIndex + 1}!`);
      } else {
        toast.error(res.data?.error || "Photo upload failed");
      }
    } catch (err: any) {
      console.error("Row photo upload error:", err);
      toast.error(err.response?.data?.error || "Failed to upload photo");
    } finally {
      setRowPhotoUploadingIndex(null);
    }
  };

  const removeRowPhoto = (rowIndex: number, urlToRemove: string) => {
    setTableData((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;
        const currentUrls = row.photo_urls
          ? row.photo_urls
              .split(";")
              .map((s) => s.trim())
              .filter((u) => u && u !== urlToRemove)
          : [];
        return {
          ...row,
          photo_urls: currentUrls.join("; "),
        };
      })
    );
  };

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
    setUploadedMediaFiles([]);
    setMatchedCount(null);
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
    <div
      style={{
        ["--ins-bg" as any]: "#F3EEE0",
        ["--ins-surface" as any]: "#FDFBF4",
        ["--ins-sunk" as any]: "#EAE2CC",
        ["--ins-line" as any]: "#D9CFB3",
        ["--ins-accent" as any]: "#8A5A00",
        ["--ins-accent-soft" as any]: "#F3E3B8",
        ["--ins-ink" as any]: "#1B2A1F",
        ["--ins-muted" as any]: "#56655A",
        color: "var(--ins-ink)",
      }}
      className="ins-scope flex flex-col items-center min-h-[calc(100vh-80px)] p-4 md:p-8 pb-24 overflow-y-auto"
    >
      <style>{`
        .ins-scope {
          color: var(--ins-ink) !important;
        }
        .ins-scope [data-slot="card"],
        .ins-scope .bg-card,
        .ins-scope [class*="bg-zinc-9"] {
          background-color: var(--ins-surface) !important;
          border-color: var(--ins-line) !important;
          color: var(--ins-ink) !important;
        }
        .ins-scope [class*="bg-zinc-8"] {
          background-color: var(--ins-sunk) !important;
          border-color: var(--ins-line) !important;
          color: var(--ins-ink) !important;
        }
        .ins-scope [class*="border-zinc-"] {
          border-color: var(--ins-line) !important;
        }
        .ins-scope .text-white,
        .ins-scope [class*="text-zinc-1"],
        .ins-scope [class*="text-zinc-2"] {
          color: var(--ins-ink) !important;
        }
        .ins-scope [class*="text-zinc-4"],
        .ins-scope [class*="text-zinc-5"] {
          color: var(--ins-muted) !important;
        }
        .ins-scope input:not([type="checkbox"]):not([type="radio"]),
        .ins-scope select,
        .ins-scope textarea {
          background-color: #FFFFFF !important;
          border-color: var(--ins-line) !important;
          color: var(--ins-ink) !important;
        }
        .ins-scope button.bg-emerald-600 {
          background-color: var(--ins-accent) !important;
          color: #ffffff !important;
        }
      `}</style>
      <div className="w-full max-w-5xl space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFBF4] p-4 rounded-2xl border border-[#D9CFB3] shadow-xs">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-[#F3E3B8] text-[#8A5A00] flex items-center justify-center border border-[#D9CFB3] shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-serif font-bold text-[#1B2A1F]">Drug Ingestion Management</h1>
                <Badge className="bg-[#F3E3B8] text-[#8A5A00] border border-[#D9CFB3] text-[10px] px-2 py-0.5 font-semibold">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Curator Only
                </Badge>
              </div>
              <p className="text-xs text-[#56655A]">Single drug detail entry or bulk CSV data import</p>
            </div>
          </div>

          <div className="flex items-center bg-[#EAE2CC] p-1 rounded-xl border border-[#D9CFB3] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "single"
                  ? "bg-[#8A5A00] text-white shadow-xs"
                  : "text-[#56655A] hover:text-[#1B2A1F]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Single Insertion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-[#8A5A00] text-white shadow-xs"
                  : "text-[#56655A] hover:text-[#1B2A1F]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk CSV Insertion
            </button>
          </div>
        </div>

        {/* Tab 1: Single Entry Form */}
        {activeTab === "single" && (
          <div className="animate-in fade-in-50 duration-300">
            <SingleDrugInsertForm returnHref="/admin/dashboard" />
          </div>
        )}

        {/* Tab 2: Bulk CSV Upload */}
        {activeTab === "bulk" && (
          <Card className="w-full border border-[#D9CFB3] bg-[#FDFBF4] text-[#1B2A1F] shadow-xs rounded-2xl animate-in fade-in-50 duration-300">
            <CardHeader className="border-b border-[#D9CFB3] bg-[#FDFBF4]">
              <CardTitle className="text-[#1B2A1F] font-serif font-bold text-xl flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#8A5A00]" />
                Bulk CSV Upload & Preview
              </CardTitle>
              <CardDescription className="text-[#56655A]">
                Upload a CSV file to preview, edit, and insert multiple drug records into the
                database repository. Multi-value fields should be separated by semicolons (;).
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Upload Zones: Dual Card (CSV Dataset + Batch Photographs) */}
              {!showTable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card 1: CSV Metadata Dropzone */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isDragActive
                        ? "border-[#8A5A00] bg-[#F3E3B8]/30 scale-[0.99]"
                        : csvFile
                        ? "border-[#3F7A4B] bg-[#D5E6D3]/30"
                        : "border-[#D9CFB3] hover:border-[#8A5A00] hover:bg-[#EAE2CC]/30 bg-white/60"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-3 my-auto py-2">
                      {csvFile ? (
                        <>
                          <div className="h-14 w-14 rounded-full bg-[#D5E6D3] flex items-center justify-center border border-[#3F7A4B]/40">
                            <Check className="h-7 w-7 text-[#3F7A4B]" />
                          </div>
                          <div>
                            <p className="text-[#3F7A4B] font-semibold text-base">
                              {csvFile.name}
                            </p>
                            <p className="text-xs text-[#56655A]">
                              {(csvFile.size / 1024).toFixed(2)} KB · Ready to preview
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-14 w-14 rounded-full bg-[#F3E3B8] flex items-center justify-center border border-[#D9CFB3] text-[#8A5A00]">
                            <FileSpreadsheet className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[#1B2A1F] text-base font-serif font-bold">
                              1. Upload CSV Dataset
                            </p>
                            <p className="text-xs text-[#56655A]">
                              Drag & drop a <code className="bg-[#EAE2CC] px-1 rounded text-[#8A5A00]">.csv</code> file, or click to browse
                            </p>
                          </div>
                          <div className="text-[11px] text-[#56655A] mt-2 bg-[#EAE2CC]/40 p-2.5 rounded-xl border border-[#D9CFB3] text-left w-full space-y-1">
                            <p className="font-semibold text-[#1B2A1F]">
                              Key Columns Recognized:
                            </p>
                            <p className="line-clamp-2">
                              primary_name, source_type, botanical_names, sanskrit_names, vernacular_names, diseases, usage_methods, photo_urls...
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      id="test-file-input"
                      type="file"
                      accept=".csv"
                      className="mt-3 p-1.5 bg-white text-[#1B2A1F] rounded-xl border border-[#D9CFB3] w-full cursor-pointer text-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onDrop([file]);
                        }
                      }}
                    />
                  </div>

                  {/* Card 2: Batch Photographs Dropzone */}
                  <div
                    {...getBatchPhotoRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isBatchPhotoDragActive
                        ? "border-[#8A5A00] bg-[#F3E3B8]/30 scale-[0.99]"
                        : uploadedMediaFiles.length > 0
                        ? "border-[#3F7A4B] bg-[#D5E6D3]/20"
                        : "border-[#D9CFB3] hover:border-[#8A5A00] hover:bg-[#EAE2CC]/30 bg-white/60"
                    } ${isUploadingBatchPhotos ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input {...getBatchPhotoInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-3 my-auto py-2">
                      <div className="h-14 w-14 rounded-full bg-[#EAE2CC] flex items-center justify-center border border-[#D9CFB3] text-[#8A5A00]">
                        {isUploadingBatchPhotos ? (
                          <Loader2 className="h-7 w-7 animate-spin text-[#8A5A00]" />
                        ) : (
                          <ImageIcon className="h-7 w-7 text-[#8A5A00]" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[#1B2A1F] text-base font-serif font-bold">
                          2. Batch Photographs (Optional)
                        </p>
                        <p className="text-xs text-[#56655A]">
                          {isUploadingBatchPhotos
                            ? "Uploading photographs to Supabase CDN..."
                            : isBatchPhotoDragActive
                            ? "Drop photographs here..."
                            : "Drag & drop photos (e.g. tulsi.jpg, neem.png)"}
                        </p>
                      </div>

                      {uploadedMediaFiles.length > 0 ? (
                        <div className="w-full bg-white/80 border border-[#3F7A4B]/30 p-2.5 rounded-xl text-left text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold text-[#1B2A1F]">
                            <span className="flex items-center gap-1.5 text-[#3F7A4B]">
                              <Check className="w-4 h-4" />
                              {uploadedMediaFiles.length} photo(s) on CDN
                            </span>
                            {matchedCount !== null && matchedCount > 0 && (
                              <Badge className="bg-[#3F7A4B] text-white text-[10px] px-2 py-0.5">
                                {matchedCount} row(s) matched
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-[#56655A] truncate">
                            Latest: {uploadedMediaFiles[uploadedMediaFiles.length - 1].originalName}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#56655A] mt-2 bg-[#EAE2CC]/40 p-2.5 rounded-xl border border-[#D9CFB3] text-left w-full space-y-1">
                          <p className="font-semibold text-[#1B2A1F]">
                            Smart Auto-Matching:
                          </p>
                          <p>
                            Filenames in your CSV (or image files named after plants) will be matched and converted to public CDN URLs automatically!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-[11px] text-[#56655A] text-center font-medium">
                      PNG, JPG, WEBP, TIFF · Up to 25 MB each · Supabase CDN
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert
                  variant="destructive"
                  className="mt-4 bg-[#F6E2CF] border-[#B4531A]/40 text-[#B4531A]"
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
                <Alert className="mt-4 bg-[#D5E6D3] border-[#3F7A4B]/40 text-[#1B2A1F]">
                  <Check className="h-4 w-4 text-[#3F7A4B]" />
                  <AlertTitle className="font-semibold text-[#1B2A1F]">Success</AlertTitle>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D9CFB3] bg-white text-[#8A5A00] hover:bg-[#F3E3B8] shadow-xs cursor-pointer transition-colors ${
                          isUploadingBatchPhotos ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        title="Batch upload photographs to auto-match with table rows"
                      >
                        {isUploadingBatchPhotos ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8A5A00]" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-[#8A5A00]" />
                        )}
                        <span>
                          {uploadedMediaFiles.length > 0
                            ? `${uploadedMediaFiles.length} Photos (${matchedCount || 0} matched)`
                            : "Add Batch Photos"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isUploadingBatchPhotos}
                          onChange={(e) => {
                            const files = e.target.files
                              ? Array.from(e.target.files)
                              : [];
                            if (files.length > 0) onBatchPhotoDrop(files);
                          }}
                        />
                      </label>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => scrollTable("left")}
                        className="text-[#1B2A1F] border-[#D9CFB3] bg-white hover:bg-[#EAE2CC] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => scrollTable("right")}
                        className="text-[#1B2A1F] border-[#D9CFB3] bg-white hover:bg-[#EAE2CC] cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="text-[#1B2A1F] border-[#D9CFB3] bg-white hover:bg-[#EAE2CC] cursor-pointer"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addRow}
                        className="bg-[#8A5A00] hover:bg-[#704800] text-white cursor-pointer font-medium"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Row
                      </Button>
                    </div>
                  </div>

                  {/* Scrollable Table */}
                  <div className="rounded-xl border border-[#D9CFB3] bg-white overflow-hidden shadow-xs">
                    <div className="max-h-[500px] overflow-y-auto">
                      <div
                        className="overflow-x-auto"
                        ref={(el) => setScrollContainerRef(el)}
                      >
                        <table className="w-max min-w-full">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[#EAE2CC] border-b border-[#D9CFB3]">
                              <th className="text-left text-xs font-semibold text-[#1B2A1F] px-3 py-3 w-10 sticky left-0 bg-[#EAE2CC] z-20">
                                #
                              </th>
                              {COLUMNS.map((col) => (
                                <th
                                  key={col.key}
                                  className="text-left text-xs font-semibold text-[#1B2A1F] px-2 py-3 min-w-[180px]"
                                >
                                  <div>{col.label}</div>
                                  {"hint" in col && col.hint && (
                                    <div className="text-[10px] text-[#56655A] font-normal mt-0.5">
                                      {col.hint}
                                    </div>
                                  )}
                                </th>
                              ))}
                              <th className="text-center text-xs font-semibold text-[#1B2A1F] px-3 py-3 w-16 sticky right-0 bg-[#EAE2CC] z-20">
                                Del
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="border-b border-[#D9CFB3]/60 hover:bg-[#FDFBF4] transition-colors"
                              >
                                <td className="px-3 py-1.5 text-xs text-[#56655A] font-mono sticky left-0 bg-[#FDFBF4] z-10">
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
                                        className="w-full bg-white border border-[#D9CFB3] text-[#1B2A1F] text-xs rounded-md px-2 h-8 focus:ring-[#8A5A00] focus:border-[#8A5A00] appearance-none cursor-pointer"
                                      >
                                        <option value="">Select...</option>
                                        {SOURCE_TYPES.map((t) => (
                                          <option key={t} value={t}>
                                            {t}
                                          </option>
                                        ))}
                                      </select>
                                    ) : col.key === "photo_urls" ? (
                                      <div className="flex flex-col gap-1 min-w-[240px]">
                                        <div className="flex items-center gap-1">
                                          <Input
                                            value={row[col.key]}
                                            onChange={(e) =>
                                              updateCell(
                                                rowIdx,
                                                col.key,
                                                e.target.value
                                              )
                                            }
                                            placeholder="URLs or image filename"
                                            className="bg-white border-[#D9CFB3] text-[#1B2A1F] text-xs h-8 focus-visible:ring-[#8A5A00] flex-1 font-mono"
                                          />
                                          <label
                                            title="Attach photo directly to this drug row"
                                            className={`h-8 px-2 flex items-center justify-center rounded-md border border-[#D9CFB3] bg-[#F3E3B8]/60 hover:bg-[#F3E3B8] text-[#8A5A00] cursor-pointer text-xs font-medium transition-colors shrink-0 ${
                                              rowPhotoUploadingIndex === rowIdx
                                                ? "opacity-60 cursor-not-allowed"
                                                : ""
                                            }`}
                                          >
                                            {rowPhotoUploadingIndex === rowIdx ? (
                                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8A5A00]" />
                                            ) : (
                                              <ImageIcon className="w-3.5 h-3.5 text-[#8A5A00]" />
                                            )}
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              disabled={rowPhotoUploadingIndex === rowIdx}
                                              onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleRowPhotoUpload(rowIdx, f);
                                              }}
                                            />
                                          </label>
                                        </div>
                                        {(() => {
                                          const urls = row.photo_urls
                                            ? row.photo_urls
                                                .split(";")
                                                .map((s) => s.trim())
                                                .filter(Boolean)
                                            : [];
                                          if (urls.length === 0) return null;
                                          return (
                                            <div className="flex flex-wrap gap-1 max-w-[260px]">
                                              {urls.map((u, pIdx) => {
                                                const isUrl =
                                                  u.startsWith("http://") ||
                                                  u.startsWith("https://");
                                                const displayName =
                                                  u.split("/").pop() ||
                                                  `Photo ${pIdx + 1}`;
                                                return (
                                                  <span
                                                    key={pIdx}
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#EAE2CC] text-[#1B2A1F] border border-[#D9CFB3]"
                                                  >
                                                    {isUrl && (
                                                      <img
                                                        src={u}
                                                        alt=""
                                                        className="w-3.5 h-3.5 rounded object-cover"
                                                        onError={(e) => {
                                                          (
                                                            e.target as HTMLElement
                                                          ).style.display =
                                                            "none";
                                                        }}
                                                      />
                                                    )}
                                                    <span
                                                      className="max-w-[70px] truncate font-mono"
                                                      title={u}
                                                    >
                                                      {displayName}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeRowPhoto(
                                                          rowIdx,
                                                          u
                                                        )
                                                      }
                                                      title="Remove this photo from row"
                                                      className="text-red-600 hover:text-red-800 ml-0.5 cursor-pointer"
                                                    >
                                                      <X className="w-2.5 h-2.5" />
                                                    </button>
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          );
                                        })()}
                                      </div>
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
                                        className="bg-white border-[#D9CFB3] text-[#1B2A1F] text-xs h-8 focus-visible:ring-[#8A5A00] min-w-[160px]"
                                      />
                                    )}
                                  </td>
                                ))}
                                <td className="px-3 py-1.5 text-center sticky right-0 bg-[#FDFBF4] z-10">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteRow(rowIdx)}
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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

                  {/* Insert Button */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      onClick={handleInsert}
                      disabled={isInserting || tableData.length === 0}
                      className="bg-[#8A5A00] hover:bg-[#704800] text-white font-semibold px-8 py-2.5 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
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

            <CardFooter className="border-t border-[#D9CFB3] bg-[#EAE2CC]/30 flex justify-center py-3">
              <div className="text-xs text-gray-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Multi-value fields use
                semicolons (;) as separators
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

