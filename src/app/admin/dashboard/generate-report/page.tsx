"use client";

import { useAuth } from "@/components/useAuth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/checkbox"; 
import {
    FileText,
    Download,
    ArrowLeft,
    Calendar,
    User,
    Image,
    BookOpen,
    Database,
    HeartPulse,
    UserCheck,
    Leaf,
    RotateCcw
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TimeRange = "week" | "month" | "year" | "all";

export interface ReportOptions {
    // Drug Registry Information
    drugBasicInfo: boolean;
    drugDescription: boolean;
    drugNames: boolean;

    // Medical & Therapeutic Information
    diseases: boolean;
    usageMethods: boolean;

    // Traditional Knowledge & Contributors
    contributorInfo: boolean;
    contributorDetails: boolean;

    // Research & Scientific Literature
    researchArticles: boolean;
    researchThesis: boolean;

    // Media & Documentation
    photoCount: boolean;
    photoUrls: boolean;

    // User Administration
    userBasicInfo: boolean;
    userPermissions: boolean;

    // Additional Options
    statisticalSummary: boolean;
    exportMetadata: boolean;
}

const defaultOptions: ReportOptions = {
    drugBasicInfo: true,
    drugDescription: true,
    drugNames: true,
    diseases: true,
    usageMethods: true,
    contributorInfo: true,
    contributorDetails: true,
    researchArticles: true,
    researchThesis: true,
    photoCount: true,
    photoUrls: false,
    userBasicInfo: true,
    userPermissions: true,
    statisticalSummary: true,
    exportMetadata: true,
};

export default function GenerateReport() {
    useAuth(["admin"]);
    const router = useRouter();
    const { data: session, status } = useSession();
    const [timeRange, setTimeRange] = useState<TimeRange>("all");
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportOptions, setReportOptions] = useState<ReportOptions>(defaultOptions);

    const handleOptionChange = (option: keyof ReportOptions, checked: boolean) => {
        setReportOptions(prev => ({
            ...prev,
            [option]: checked
        }));
    };

    const selectAllInCategory = (category: string) => {
        const categoryOptions: Record<string, (keyof ReportOptions)[]> = {
            drugs: ['drugBasicInfo', 'drugDescription', 'drugNames'],
            medical: ['diseases', 'usageMethods'],
            contributors: ['contributorInfo', 'contributorDetails'],
            research: ['researchArticles', 'researchThesis'],
            media: ['photoCount', 'photoUrls'],
            user: ['userBasicInfo', 'userPermissions'],
            additional: ['statisticalSummary', 'exportMetadata']
        };

        if (categoryOptions[category]) {
            const newOptions = { ...reportOptions };
            categoryOptions[category].forEach(option => {
                newOptions[option] = true;
            });
            setReportOptions(newOptions);
        }
    };

    const selectAllOptions = () => {
        const allSelected = Object.keys(reportOptions).reduce((acc, key) => {
            acc[key as keyof ReportOptions] = true;
            return acc;
        }, {} as ReportOptions);
        setReportOptions(allSelected);
    };

    const resetToDefaults = () => {
        setReportOptions(defaultOptions);
    };

    const handleGenerateReport = async () => {
        const hasSelectedOptions = Object.values(reportOptions).some(option => option);
        if (!hasSelectedOptions) {
            toast.error("Please select at least one report option!");
            return;
        }

        try {
            setIsGenerating(true);
            const response = await axios.post(`/api/admin/dashboard/generate-report`, {
                timeRange,
                reportOptions
            }, {
                responseType: 'blob'
            });
            
            // Create a blob from the PDF data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `folklore-registry-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Report generated and downloaded successfully!");
        } catch (error: any) {
            console.error('Error generating report:', error);
            let errorMessage = "Failed to generate report.";
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const parsed = JSON.parse(text);
                    if (parsed.error) errorMessage = parsed.error;
                } catch {
                    // Blob was not JSON
                }
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
                <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-green-500">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
                <div className="p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-zinc-400">Please log in to access this page.</p>
                </div>
            </div>
        );
    }

    const CheckboxItem = ({ 
        id, 
        label, 
        description, 
        checked, 
        onChange 
    }: { 
        id: keyof ReportOptions;
        label: string;
        description: string;
        checked: boolean;
        onChange: (checked: boolean) => void;
    }) => (
        <div className="flex items-start space-x-3">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={onChange}
                className="mt-0.5"
            />
            <div className="flex-1">
                <label htmlFor={id} className="text-sm font-medium text-zinc-200 cursor-pointer">
                    {label}
                </label>
                <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-zinc-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-zinc-400 bg-zinc-800 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-200">Generate Custom Report</h1>
                            <p className="text-zinc-400 mt-1">Export detailed PDF reports from the Folklore Diaries repository</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllOptions}
                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-xs"
                        >
                            Select All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetToDefaults}
                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer text-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Defaults
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Report Options */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Time Range Selection */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm text-white">
                            <CardHeader>
                                <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-400" />
                                    Time Range Filter
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Filter records by creation or entry timestamp
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={timeRange}
                                    onValueChange={(value: TimeRange) => setTimeRange(value)}
                                >
                                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue placeholder="Select time range" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectItem value="week">Last 7 Days</SelectItem>
                                        <SelectItem value="month">Last 30 Days</SelectItem>
                                        <SelectItem value="year">Last 1 Year</SelectItem>
                                        <SelectItem value="all">All Time (Full Repository)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Drug Registry Information */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-emerald-400" />
                                        Drug & Medicine Data
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('drugs')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="drugBasicInfo"
                                    label="Basic Drug Identification"
                                    description="Primary name, source classification (Plant/Animal/Mineral), creation date"
                                    checked={reportOptions.drugBasicInfo}
                                    onChange={(checked) => handleOptionChange('drugBasicInfo', checked)}
                                />
                                <CheckboxItem
                                    id="drugDescription"
                                    label="Botanical & Morphological Description"
                                    description="Habit, habitat, plant parts, morphology and physical characteristics"
                                    checked={reportOptions.drugDescription}
                                    onChange={(checked) => handleOptionChange('drugDescription', checked)}
                                />
                                <CheckboxItem
                                    id="drugNames"
                                    label="Taxonomic & Regional Names"
                                    description="Botanical (Latin), Sanskrit, and Vernacular/Common names"
                                    checked={reportOptions.drugNames}
                                    onChange={(checked) => handleOptionChange('drugNames', checked)}
                                />
                            </CardContent>
                        </Card>

                        {/* Medical & Therapeutic Information */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <HeartPulse className="w-5 h-5 text-emerald-400" />
                                        Therapeutic Indications & Usage
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('medical')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="diseases"
                                    label="Diseases & Indications"
                                    description="Target diseases, conditions, and Ayurvedic diagnoses treated"
                                    checked={reportOptions.diseases}
                                    onChange={(checked) => handleOptionChange('diseases', checked)}
                                />
                                <CheckboxItem
                                    id="usageMethods"
                                    label="Preparation & Usage Methods"
                                    description="Formulations, decoctions, dosage, and administration protocols"
                                    checked={reportOptions.usageMethods}
                                    onChange={(checked) => handleOptionChange('usageMethods', checked)}
                                />
                            </CardContent>
                        </Card>

                        {/* Traditional Knowledge & Contributors */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <UserCheck className="w-5 h-5 text-emerald-400" />
                                        Folk Healers & Traditional Contributors
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('contributors')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="contributorInfo"
                                    label="Contributor Basic Details"
                                    description="Traditional practitioner name, age, and geographical address/region"
                                    checked={reportOptions.contributorInfo}
                                    onChange={(checked) => handleOptionChange('contributorInfo', checked)}
                                />
                                <CheckboxItem
                                    id="contributorDetails"
                                    label="Lineage & Experience"
                                    description="Guru/teacher name and total duration/years of clinical practice"
                                    checked={reportOptions.contributorDetails}
                                    onChange={(checked) => handleOptionChange('contributorDetails', checked)}
                                />
                            </CardContent>
                        </Card>

                        {/* Research & Scientific Literature */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-emerald-400" />
                                        Research & Scientific References
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('research')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="researchArticles"
                                    label="Research Articles & Publications"
                                    description="Published scientific papers and peer-reviewed journal articles"
                                    checked={reportOptions.researchArticles}
                                    onChange={(checked) => handleOptionChange('researchArticles', checked)}
                                />
                                <CheckboxItem
                                    id="researchThesis"
                                    label="Academic Theses & Dissertations"
                                    description="Postgraduate and doctoral theses related to the drug"
                                    checked={reportOptions.researchThesis}
                                    onChange={(checked) => handleOptionChange('researchThesis', checked)}
                                />
                            </CardContent>
                        </Card>

                        {/* Media & Documentation */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <Image className="w-5 h-5 text-emerald-400" />
                                        Photographs & Media
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('media')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="photoCount"
                                    label="Photographic Documentation Count"
                                    description="Include total count of specimen photos cataloged per drug"
                                    checked={reportOptions.photoCount}
                                    onChange={(checked) => handleOptionChange('photoCount', checked)}
                                />
                                <CheckboxItem
                                    id="photoUrls"
                                    label="Direct Image URLs"
                                    description="List raw photo resource URLs in the appendix"
                                    checked={reportOptions.photoUrls}
                                    onChange={(checked) => handleOptionChange('photoUrls', checked)}
                                />
                            </CardContent>
                        </Card>

                        {/* User Administration */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-400" />
                                        User Directory & Roles
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('user')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="userBasicInfo"
                                    label="Registered User Directory"
                                    description="Include list of system user accounts and email addresses"
                                    checked={reportOptions.userBasicInfo}
                                    onChange={(checked) => handleOptionChange('userBasicInfo', checked)}
                                />
                                <CheckboxItem
                                    id="userPermissions"
                                    label="Roles & Account Status"
                                    description="Include access levels (Admin / User) and account standing (Active / Blocked)"
                                    checked={reportOptions.userPermissions}
                                    onChange={(checked) => handleOptionChange('userPermissions', checked)}
                                />
                            </CardContent>
                        </Card>

                        {/* Additional Options */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                        <Database className="w-5 h-5 text-emerald-400" />
                                        Summary & Metadata
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => selectAllInCategory('additional')}
                                        className="cursor-pointer text-xs bg-gray-300/10 text-emerald-400 hover:bg-gray-300/20 hover:text-white"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CheckboxItem
                                    id="statisticalSummary"
                                    label="Executive Summary Table"
                                    description="High-level metric totals (drugs, diseases, contributors, research, users)"
                                    checked={reportOptions.statisticalSummary}
                                    onChange={(checked) => handleOptionChange('statisticalSummary', checked)}
                                />
                                <CheckboxItem
                                    id="exportMetadata"
                                    label="Export Metadata & Pagination"
                                    description="Include generation timestamp, administrative footer, and page numbers"
                                    checked={reportOptions.exportMetadata}
                                    onChange={(checked) => handleOptionChange('exportMetadata', checked)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Panel */}
                    <div className="space-y-6">
                        {/* Generate Button Card */}
                        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-400" />
                                    Export Document
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Compiles selected repository data into a formatted PDF
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={handleGenerateReport}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 cursor-pointer text-white font-medium py-2.5 shadow-lg shadow-emerald-950/40"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                                            Compiling PDF Report...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Generate & Download PDF
                                        </>
                                    )}
                                </Button>

                                <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Selected Period:</span>
                                        <span className="text-zinc-200 capitalize font-medium">{timeRange}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Selected Fields:</span>
                                        <span className="text-emerald-400 font-semibold">
                                            {Object.values(reportOptions).filter(Boolean).length} / {Object.keys(reportOptions).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Format:</span>
                                        <span className="text-zinc-200 font-mono">PDF (.pdf)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
