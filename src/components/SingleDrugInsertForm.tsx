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
    <Card className="w-full border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-md">
      <CardHeader className="border-b border-zinc-800/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Single Drug Entry
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Enter individual folklore medicine details. Multi-value fields can be separated with semicolons (;).
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit bg-emerald-950/40 text-emerald-300 border-emerald-800/60 px-3 py-1 text-xs"
          >
            Direct Database Insertion
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Success Alert */}
        {successResult && (
          <Alert className="mb-6 bg-emerald-950/40 border-emerald-500/50 text-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <AlertTitle className="text-base font-semibold text-emerald-300">
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
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
                  className="text-zinc-400 hover:text-white cursor-pointer"
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
            className="mb-6 bg-red-950/40 border-red-500/50 text-red-300"
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
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100">
                1. Basic Drug Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="primary_name" className="text-zinc-200">
                  Primary Name <span className="text-emerald-400 font-bold">*</span>
                </Label>
                <Input
                  id="primary_name"
                  value={formData.primary_name}
                  onChange={(e) => handleChange("primary_name", e.target.value)}
                  placeholder="e.g. Tulasi, Ashwagandha, Neem"
                  required
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-xs text-zinc-400">
                  Main identifier used for search and drug profile creation.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_type" className="text-zinc-200">
                  Source Type
                </Label>
                <Select
                  value={formData.source_type}
                  onValueChange={(val) => handleChange("source_type", val)}
                >
                  <SelectTrigger
                    id="source_type"
                    className="w-full bg-zinc-800/70 border-zinc-700 text-white"
                  >
                    <SelectValue placeholder="Select Source Type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectItem value="PLANT">PLANT</SelectItem>
                    <SelectItem value="ANIMAL">ANIMAL</SelectItem>
                    <SelectItem value="MINERAL">MINERAL</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-400">
                  Origin classification (Plant, Animal, or Mineral).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="botanical_description" className="text-zinc-200">
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
                className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Taxonomic & Regional Names */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100">
                2. Botanical & Regional Names
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="botanical_names" className="text-zinc-200">
                  Botanical Names (Latin)
                </Label>
                <Input
                  id="botanical_names"
                  value={formData.botanical_names}
                  onChange={(e) =>
                    handleChange("botanical_names", e.target.value)
                  }
                  placeholder="Ocimum tenuiflorum; Ocimum sanctum"
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sanskrit_names" className="text-zinc-200">
                  Sanskrit Names
                </Label>
                <Input
                  id="sanskrit_names"
                  value={formData.sanskrit_names}
                  onChange={(e) =>
                    handleChange("sanskrit_names", e.target.value)
                  }
                  placeholder="Surasa; Tulasi; Vaishnavi"
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vernacular_names" className="text-zinc-200">
                  Vernacular / Common Names
                </Label>
                <Input
                  id="vernacular_names"
                  value={formData.vernacular_names}
                  onChange={(e) =>
                    handleChange("vernacular_names", e.target.value)
                  }
                  placeholder="Holy Basil; Tulsi; Thulasi"
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple with semicolon (;)
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Therapeutic Indications & Methods */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100">
                3. Therapeutic Uses & Indications
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="diseases" className="text-zinc-200">
                  Target Diseases / Indications
                </Label>
                <Textarea
                  id="diseases"
                  rows={3}
                  value={formData.diseases}
                  onChange={(e) => handleChange("diseases", e.target.value)}
                  placeholder="e.g. Fever; Kasa (Cough); Svasa (Asthma); Skin Infections"
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple diseases with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_methods" className="text-zinc-200">
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
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple methods with semicolon (;)
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Traditional Healer / Contributor Details */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100">
                4. Traditional Healer / Contributor Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="contributor_names" className="text-zinc-200">
                  Contributor / Healer Name
                </Label>
                <Input
                  id="contributor_names"
                  value={formData.contributor_names}
                  onChange={(e) =>
                    handleChange("contributor_names", e.target.value)
                  }
                  placeholder="e.g. Vaidya Ram Sharma"
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributor_ages" className="text-zinc-200">
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
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contributor_practice_durations"
                  className="text-zinc-200"
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
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributor_gurus" className="text-zinc-200">
                  Guru / Traditional Lineage
                </Label>
                <Input
                  id="contributor_gurus"
                  value={formData.contributor_gurus}
                  onChange={(e) =>
                    handleChange("contributor_gurus", e.target.value)
                  }
                  placeholder="e.g. Guru Shankara Bhat"
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="contributor_addresses"
                  className="text-zinc-200"
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
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Note: If multiple contributors are associated with this record, separate each field with a semicolon (;).
            </p>
          </div>

          {/* Section 5: Research & Scientific Documentation */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100">
                5. Research & Scientific References
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="research_articles" className="text-zinc-200">
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
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple articles with semicolon (;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="research_thesis" className="text-zinc-200">
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
                  className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-400">
                  Separate multiple theses with semicolon (;)
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Photo URLs */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100">
                6. Photographs & Documentation Media
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo_urls" className="text-zinc-200">
                Photo URLs
              </Label>
              <Textarea
                id="photo_urls"
                rows={2}
                value={formData.photo_urls}
                onChange={(e) => handleChange("photo_urls", e.target.value)}
                placeholder="e.g. https://example.com/photos/tulsi_whole_plant.jpg; https://example.com/photos/tulsi_leaves.jpg"
                className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
              <p className="text-[11px] text-zinc-400">
                Separate multiple image URLs with semicolon (;)
              </p>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.primary_name.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-medium px-8 py-2.5 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
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

      <CardFooter className="border-t border-zinc-800/60 bg-zinc-950/90 py-3 px-6 flex justify-between items-center text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-zinc-400" />
          Fields with (*) are required. Existing drug names will be safely updated without duplicates.
        </span>
        <span className="hidden sm:inline">Folklore Diaries Drug Registry</span>
      </CardFooter>
    </Card>
  );
}

