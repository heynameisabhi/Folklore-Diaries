"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Info,
  BookOpen,
  UserCheck,
  Image as ImageIcon,
  HeartPulse,
  Leaf,
  Upload,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "sonner";
import Link from "next/link";

export interface SingleDrugFormData {
  primary_name: string;
  source_type: string;
  botanical_description: string;
  botanical_names: string;
  sanskrit_names: string;
  vernacular_names: string;
  diseases: string;
  usage_methods: string;
  research_articles: string;
  research_thesis: string;
  photo_urls: string;
  contributor_names: string;
  contributor_ages: string;
  contributor_addresses: string;
  contributor_gurus: string;
  contributor_practice_durations: string;
}

const initialFormData: SingleDrugFormData = {
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

export function SingleDrugInsertForm({
  returnHref = "/admin/dashboard",
}: {
  returnHref?: string;
}) {
  const [formData, setFormData] = useState<SingleDrugFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    inserted: number;
    updated: number;
    drugName: string;
  } | null>(null);

  const handleChange = (
    field: keyof SingleDrugFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setError(null);
    setSuccessResult(null);
  };

  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const handlePhotoUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploadingPhotos(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("folder", "herbs");
      acceptedFiles.forEach((file) => {
        uploadFormData.append("files", file);
      });

      const res = await axios.post("/api/upload", uploadFormData);

      if (res.data?.success && Array.isArray(res.data.files)) {
        const newUrls = res.data.files.map((f: any) => f.url).filter(Boolean);
        if (newUrls.length > 0) {
          setFormData((prev) => {
            const existing = prev.photo_urls
              ? prev.photo_urls.split(";").map((s) => s.trim()).filter(Boolean)
              : [];
            const combined = [...existing, ...newUrls];
            return { ...prev, photo_urls: combined.join("; ") };
          });
          toast.success(
            `Successfully uploaded ${newUrls.length} photograph${
              newUrls.length > 1 ? "s" : ""
            }!`
          );
        }
      } else {
        toast.error(res.data?.error || "Failed to upload photographs");
      }
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast.error(err.response?.data?.error || "Failed to upload photographs");
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    setFormData((prev) => {
      const urls = prev.photo_urls
        .split(";")
        .map((s) => s.trim())
        .filter((u) => u && u !== urlToRemove);
      return { ...prev, photo_urls: urls.join("; ") };
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handlePhotoUpload,
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
    disabled: isUploadingPhotos || isSubmitting,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    const trimmedPrimaryName = formData.primary_name.trim();
    if (!trimmedPrimaryName) {
      setError("Primary Name is required to register a drug record.");
      toast.error("Primary Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        drugs: [
          {
            primary_name: trimmedPrimaryName,
            source_type: formData.source_type || "",
            botanical_description: formData.botanical_description.trim(),
            botanical_names: formData.botanical_names.trim(),
            sanskrit_names: formData.sanskrit_names.trim(),
            vernacular_names: formData.vernacular_names.trim(),
            diseases: formData.diseases.trim(),
            usage_methods: formData.usage_methods.trim(),
            research_articles: formData.research_articles.trim(),
            research_thesis: formData.research_thesis.trim(),
            photo_urls: formData.photo_urls.trim(),
            contributor_names: formData.contributor_names.trim(),
            contributor_ages: formData.contributor_ages.trim(),
            contributor_addresses: formData.contributor_addresses.trim(),
            contributor_gurus: formData.contributor_gurus.trim(),
            contributor_practice_durations:
              formData.contributor_practice_durations.trim(),
          },
        ],
      };

      const response = await axios.post("/api/insert-drugs", payload);
      const { insertedCount, updatedCount } = response.data;

      setSuccessResult({
        inserted: insertedCount,
        updated: updatedCount,
        drugName: trimmedPrimaryName,
      });

      toast.success(
        insertedCount > 0
          ? `Drug "${trimmedPrimaryName}" added successfully!`
          : `Drug "${trimmedPrimaryName}" merged/updated successfully!`
      );
    } catch (err: any) {
      console.error("Single drug insert error:", err);
      const errorMsg =
        err.response?.data?.error || "Failed to insert drug record. Please try again.";
      const details = err.response?.data?.details;
      setError(details ? `${errorMsg}\n${details.join("\n")}` : errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border border-[#D9CFB3] bg-[#FDFBF4] text-[#1B2A1F] rounded-2xl shadow-xs">
      <CardHeader className="border-b border-[#D9CFB3] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-serif font-bold text-[#1B2A1F] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#8A5A00]" />
              Single Drug Entry
            </CardTitle>
            <CardDescription className="text-[#56655A] mt-1">
              Enter individual folklore medicine details. Multi-value fields can be separated with semicolons (;).
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit bg-[#F3E3B8] text-[#8A5A00] border-[#D9CFB3] px-3 py-1 text-xs font-semibold"
          >
            Direct Database Insertion
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Success Alert */}
        {successResult && (
          <Alert className="mb-6 bg-[#D5E6D3] border-[#3F7A4B]/40 text-[#1B2A1F]">
            <CheckCircle2 className="h-5 w-5 text-[#3F7A4B]" />
            <AlertTitle className="text-base font-semibold text-[#1B2A1F]">
              Drug Record Successfully Processed!
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="text-sm">
                <strong>{successResult.drugName}</strong> has been{" "}
                {successResult.inserted > 0
                  ? "created as a new record"
                  : "merged with the existing record"}{" "}
                in the database. All related taxonomy, indications, methods, references, and contributor records have been mapped.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleReset}
                  className="bg-[#8A5A00] hover:bg-[#704800] text-white cursor-pointer rounded-xl font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Insert Another Drug
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <Link href="/dashboard/manual-search">
                    Search In Database
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="text-[#56655A] hover:text-[#1B2A1F] cursor-pointer"
                >
                  <Link href={returnHref}>Return to Dashboard</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-[#F6E2CF] border-[#B4531A]/40 text-[#B4531A]"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Unable to Save Drug Record</AlertTitle>
            <AlertDescription className="whitespace-pre-line text-sm mt-1">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="rounded-2xl border border-[#D9CFB3] bg-[#EAE2CC]/30 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9CFB3] pb-3">
              <Leaf className="w-5 h-5 text-[#8A5A00]" />
              <h3 className="text-base font-serif font-bold text-[#1B2A1F]">
                1. Basic Drug Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="primary_name" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Primary Name <span className="text-[#B4531A] font-bold">*</span>
                </Label>
                <Input
                  id="primary_name"
                  value={formData.primary_name}
                  onChange={(e) => handleChange("primary_name", e.target.value)}
                  placeholder="e.g. Tulasi, Ashwagandha, Neem"
                  required
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-xs text-[#56655A]">
                  Main identifier used for search and drug profile creation.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_type" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Source Type
                </Label>
                <Select
                  value={formData.source_type}
                  onValueChange={(val) => handleChange("source_type", val)}
                >
                  <SelectTrigger
                    id="source_type"
                    className="w-full bg-white border-[#D9CFB3] text-[#1B2A1F] rounded-xl"
                  >
                    <SelectValue placeholder="Select Source Type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FDFBF4] border-[#D9CFB3] text-[#1B2A1F]">
                    <SelectItem value="PLANT">PLANT</SelectItem>
                    <SelectItem value="ANIMAL">ANIMAL</SelectItem>
                    <SelectItem value="MINERAL">MINERAL</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#56655A]">
                  Origin classification (Plant, Animal, or Mineral).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="botanical_description" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                Botanical / Morphological Description
              </Label>
              <Textarea
                id="botanical_description"
                rows={3}
                value={formData.botanical_description}
                onChange={(e) =>
                  handleChange("botanical_description", e.target.value)
                }
                placeholder="Enter morphology details, plant habitat, physical characteristics, leaves, flowers, seeds, roots..."
                className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
              />
            </div>
          </div>

          {/* Section 2: Taxonomic & Regional Names */}
          <div className="rounded-2xl border border-[#D9CFB3] bg-[#EAE2CC]/30 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9CFB3] pb-3">
              <BookOpen className="w-5 h-5 text-[#8A5A00]" />
              <h3 className="text-base font-serif font-bold text-[#1B2A1F]">
                2. Botanical & Regional Names
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="botanical_names" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Botanical Names (Latin)
                </Label>
                <Input
                  id="botanical_names"
                  value={formData.botanical_names}
                  onChange={(e) =>
                    handleChange("botanical_names", e.target.value)
                  }
                  placeholder="Ocimum tenuiflorum; Ocimum sanctum"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sanskrit_names" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Sanskrit Names
                </Label>
                <Input
                  id="sanskrit_names"
                  value={formData.sanskrit_names}
                  onChange={(e) =>
                    handleChange("sanskrit_names", e.target.value)
                  }
                  placeholder="Surasa; Tulasi; Vaishnavi"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vernacular_names" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Vernacular / Common Names
                </Label>
                <Input
                  id="vernacular_names"
                  value={formData.vernacular_names}
                  onChange={(e) =>
                    handleChange("vernacular_names", e.target.value)
                  }
                  placeholder="Holy Basil; Tulsi; Thulasi"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple with semicolon (;)
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Therapeutic Indications & Methods */}
          <div className="rounded-2xl border border-[#D9CFB3] bg-[#EAE2CC]/30 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9CFB3] pb-3">
              <HeartPulse className="w-5 h-5 text-[#8A5A00]" />
              <h3 className="text-base font-serif font-bold text-[#1B2A1F]">
                3. Therapeutic Uses & Indications
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="diseases" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Target Diseases / Indications
                </Label>
                <Textarea
                  id="diseases"
                  rows={3}
                  value={formData.diseases}
                  onChange={(e) => handleChange("diseases", e.target.value)}
                  placeholder="e.g. Fever; Kasa (Cough); Svasa (Asthma); Skin Infections"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple diseases with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_methods" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Usage & Preparation Methods
                </Label>
                <Textarea
                  id="usage_methods"
                  rows={3}
                  value={formData.usage_methods}
                  onChange={(e) =>
                    handleChange("usage_methods", e.target.value)
                  }
                  placeholder="e.g. Fresh leaf juice 10ml with honey twice daily; Decoction of root for chronic fever"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple methods with semicolon (;)
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Traditional Healer / Contributor Details */}
          <div className="rounded-2xl border border-[#D9CFB3] bg-[#EAE2CC]/30 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9CFB3] pb-3">
              <UserCheck className="w-5 h-5 text-[#8A5A00]" />
              <h3 className="text-base font-serif font-bold text-[#1B2A1F]">
                4. Traditional Healer / Contributor Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="contributor_names" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Contributor / Healer Name
                </Label>
                <Input
                  id="contributor_names"
                  value={formData.contributor_names}
                  onChange={(e) =>
                    handleChange("contributor_names", e.target.value)
                  }
                  placeholder="e.g. Vaidya Ram Sharma"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributor_ages" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Age
                </Label>
                <Input
                  id="contributor_ages"
                  type="number"
                  min="1"
                  max="130"
                  value={formData.contributor_ages}
                  onChange={(e) =>
                    handleChange("contributor_ages", e.target.value)
                  }
                  placeholder="e.g. 65"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contributor_practice_durations"
                  className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider"
                >
                  Practice Duration / Experience
                </Label>
                <Input
                  id="contributor_practice_durations"
                  value={formData.contributor_practice_durations}
                  onChange={(e) =>
                    handleChange(
                      "contributor_practice_durations",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 35 years"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributor_gurus" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Guru / Traditional Lineage
                </Label>
                <Input
                  id="contributor_gurus"
                  value={formData.contributor_gurus}
                  onChange={(e) =>
                    handleChange("contributor_gurus", e.target.value)
                  }
                  placeholder="e.g. Guru Shankara Bhat"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="contributor_addresses"
                  className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider"
                >
                  Address / Village / District
                </Label>
                <Input
                  id="contributor_addresses"
                  value={formData.contributor_addresses}
                  onChange={(e) =>
                    handleChange("contributor_addresses", e.target.value)
                  }
                  placeholder="e.g. Village Bilagi, Siddapur Taluk, Uttara Kannada, Karnataka"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#56655A]">
              Note: If multiple contributors are associated with this record, separate each field with a semicolon (;).
            </p>
          </div>

          {/* Section 5: Research & Scientific Documentation */}
          <div className="rounded-2xl border border-[#D9CFB3] bg-[#EAE2CC]/30 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9CFB3] pb-3">
              <FileText className="w-5 h-5 text-[#8A5A00]" />
              <h3 className="text-base font-serif font-bold text-[#1B2A1F]">
                5. Research & Scientific References
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="research_articles" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Research Articles & Publications
                </Label>
                <Textarea
                  id="research_articles"
                  rows={2}
                  value={formData.research_articles}
                  onChange={(e) =>
                    handleChange("research_articles", e.target.value)
                  }
                  placeholder="e.g. Phytochemical and antibacterial screening of Ocimum sanctum; Antidiabetic action of leaves"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple articles with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="research_thesis" className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider">
                  Theses & Dissertations
                </Label>
                <Textarea
                  id="research_thesis"
                  rows={2}
                  value={formData.research_thesis}
                  onChange={(e) =>
                    handleChange("research_thesis", e.target.value)
                  }
                  placeholder="e.g. Clinical evaluation of Tulasi in Swasa Roga (Ph.D. Thesis)"
                  className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl"
                />
                <p className="text-[11px] text-[#56655A]">
                  Separate multiple theses with semicolon (;)
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Photo URLs */}
          {(() => {
            const photoList = formData.photo_urls
              ? formData.photo_urls
                  .split(";")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];

            return (
              <div className="rounded-2xl border border-[#D9CFB3] bg-[#EAE2CC]/30 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9CFB3] pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#8A5A00]" />
                    <h3 className="text-base font-serif font-bold text-[#1B2A1F]">
                      6. Photographs & Documentation Media
                    </h3>
                  </div>
                  {photoList.length > 0 && (
                    <Badge className="bg-[#8A5A00]/15 text-[#8A5A00] border border-[#8A5A00]/30 text-xs px-2.5 py-0.5 font-medium">
                      {photoList.length} photo{photoList.length > 1 ? "s" : ""} attached
                    </Badge>
                  )}
                </div>

                {/* Dropzone area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-[#8A5A00] bg-[#8A5A00]/10 scale-[0.99]"
                      : "border-[#D9CFB3] hover:border-[#8A5A00] bg-white/70 hover:bg-white"
                  } ${isUploadingPhotos ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#EAE2CC] flex items-center justify-center text-[#8A5A00] shadow-xs">
                      {isUploadingPhotos ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#8A5A00]" />
                      ) : (
                        <Upload className="w-6 h-6 text-[#8A5A00]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1B2A1F]">
                        {isUploadingPhotos
                          ? "Uploading photographs to Supabase CDN..."
                          : isDragActive
                          ? "Drop the photographs here..."
                          : "Click to select or drag & drop photographs"}
                      </p>
                      <p className="text-xs text-[#56655A] mt-0.5">
                        PNG, JPG, JPEG, WEBP, TIFF up to 25 MB each. Photos will be stored securely on cloud CDN.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thumbnails preview grid if photos are present */}
                {photoList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-[#1B2A1F] uppercase tracking-wider">
                      Attached Photographs ({photoList.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {photoList.map((url, idx) => {
                        const filename =
                          url.split("/").pop() || `Photo ${idx + 1}`;
                        return (
                          <div
                            key={idx}
                            className="group relative rounded-xl border border-[#D9CFB3] bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                          >
                            <div className="aspect-square w-full bg-[#EAE2CC]/40 flex items-center justify-center overflow-hidden">
                              <img
                                src={url}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(url)}
                              title="Remove photograph"
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-xs transition-opacity cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="p-1.5 bg-white border-t border-[#D9CFB3]/50">
                              <p
                                className="text-[10px] text-[#56655A] truncate font-mono"
                                title={filename}
                              >
                                {filename}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Textarea for direct URL inputs / fallback */}
                <div className="space-y-1.5 pt-2">
                  <Label
                    htmlFor="photo_urls"
                    className="text-[#1B2A1F] font-semibold text-xs uppercase tracking-wider"
                  >
                    Photo URLs (Auto-populated from upload or manually edited)
                  </Label>
                  <Textarea
                    id="photo_urls"
                    rows={2}
                    value={formData.photo_urls}
                    onChange={(e) =>
                      handleChange("photo_urls", e.target.value)
                    }
                    placeholder="e.g. https://example.com/photos/tulsi_whole_plant.jpg; https://example.com/photos/tulsi_leaves.jpg"
                    className="bg-white border-[#D9CFB3] text-[#1B2A1F] placeholder:text-[#56655A] focus-visible:ring-[#8A5A00] rounded-xl text-xs font-mono"
                  />
                  <p className="text-[11px] text-[#56655A]">
                    Uploaded image URLs are automatically appended here, separated by semicolons (;). You can also paste external image URLs directly.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D9CFB3]">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto border border-[#D9CFB3] bg-white text-[#1B2A1F] hover:bg-[#EAE2CC] rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.primary_name.trim()}
              className="w-full sm:w-auto bg-[#8A5A00] hover:bg-[#704800] text-white font-semibold px-8 py-2.5 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Drug Record...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Save Drug Record
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t border-[#D9CFB3] bg-[#EAE2CC]/30 py-3 px-6 flex justify-between items-center text-xs text-[#56655A]">
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-[#56655A]" />
          Fields with (*) are required. Existing drug names will be safely updated without duplicates.
        </span>
        <span className="hidden sm:inline">Folklore Diaries Drug Registry</span>
      </CardFooter>
    </Card>
  );
}

