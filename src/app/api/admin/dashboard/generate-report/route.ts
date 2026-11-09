import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

interface ReportOptions {
    // Drug & Folk Medicine fields
    drugBasicInfo?: boolean;
    drugDescription?: boolean;
    drugNames?: boolean;
    diseases?: boolean;
    usageMethods?: boolean;
    contributorInfo?: boolean;
    contributorDetails?: boolean;
    researchArticles?: boolean;
    researchThesis?: boolean;
    photoCount?: boolean;
    photoUrls?: boolean;

    // Legacy Grantha compatibility fields
    deckBasicInfo?: boolean;
    deckPhysicalProperties?: boolean;
    deckCreationDetails?: boolean;
    granthaBasicInfo?: boolean;
    granthaDescriptions?: boolean;
    authorDetails?: boolean;
    authorBio?: boolean;
    languageInfo?: boolean;
    imageCount?: boolean;
    imageDetails?: boolean;
    scanningProperties?: boolean;

    // User & Administration
    userBasicInfo?: boolean;
    userContactInfo?: boolean;
    userPermissions?: boolean;

    // Additional Options
    statisticalSummary?: boolean;
    exportMetadata?: boolean;
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// In-memory cache for NotoSans Devanagari font (supports Sanskrit & Hindi)
let cachedFontBinary: string | null = null;

function bufferToBinary(buffer: Buffer | ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    let binaryString = "";
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
        binaryString += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return binaryString;
}

async function loadNotoSansFont(requestUrl?: string): Promise<string | null> {
    if (cachedFontBinary) return cachedFontBinary;
    // 1. Try local disk (Docker, standalone, local dev)
    try {
        const fontPath = path.join(process.cwd(), "public", "NotoSans.ttf");
        if (fs.existsSync(fontPath)) {
            const buffer = fs.readFileSync(fontPath);
            cachedFontBinary = bufferToBinary(buffer);
            return cachedFontBinary;
        }
    } catch (err) {
        console.warn("Could not read NotoSans font from filesystem:", err);
    }

    // 2. Fallback to origin URL in serverless / CDN
    try {
        let origin = "";
        if (requestUrl) {
            origin = new URL(requestUrl).origin;
        } else if (process.env.NEXTAUTH_URL) {
            origin = process.env.NEXTAUTH_URL;
        } else if (process.env.VERCEL_URL) {
            origin = `https://${process.env.VERCEL_URL}`;
        }

        if (origin) {
            const res = await fetch(`${origin}/NotoSans.ttf`);
            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                cachedFontBinary = bufferToBinary(arrayBuffer);
                return cachedFontBinary;
            }
        }
    } catch (err) {
        console.warn("Could not fetch NotoSans font from origin:", err);
    }

    return null;
}

// Clean text for safe rendering while preserving full Sanskrit (Devanagari & IAST diacritics)
function cleanText(text: string | null | undefined): string {
    if (!text) return "";
    // Strip only non-printable control characters (\x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F)
    // Preserves Devanagari (Sanskrit/Hindi), IAST Latin diacritics, accented letters, tabs, and newlines
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

export async function POST(request: Request) {
    try {
        const session = await getAuthSession();
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userRole = session.user.role?.toUpperCase();
        if (userRole !== "ADMIN") {
            return new NextResponse("Forbidden: Admin access required", { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const timeRange: string = body.timeRange || "all";
        const options: ReportOptions = body.reportOptions || {};

        // Normalization: map legacy or new options so both work seamlessly
        const incDrugBasic = options.drugBasicInfo ?? options.deckBasicInfo ?? true;
        const incDrugDesc = options.drugDescription ?? options.granthaDescriptions ?? true;
        const incDrugNames = options.drugNames ?? options.languageInfo ?? options.authorDetails ?? true;
        const incDiseases = options.diseases ?? options.granthaBasicInfo ?? true;
        const incUsageMethods = options.usageMethods ?? true;
        const incContributors = options.contributorInfo ?? options.authorDetails ?? true;
        const incResearch = options.researchArticles ?? options.researchThesis ?? true;
        const incPhotos = options.photoCount ?? options.photoUrls ?? options.imageCount ?? options.imageDetails ?? true;
        const incUsers = options.userBasicInfo ?? options.userPermissions ?? options.userContactInfo ?? false;
        const incStats = options.statisticalSummary ?? true;
        const incMeta = options.exportMetadata ?? true;

        // Date filter
        const now = new Date();
        let startDate: Date | undefined;
        if (timeRange === "week") {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeRange === "month") {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (timeRange === "year") {
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }

        // Fetch data
        const [drugs, users, totalDiseases, totalContributors, totalResearch] = await Promise.all([
            db.drug.findMany({
                where: startDate ? { created_at: { gte: startDate } } : {},
                include: {
                    drug_names: true,
                    drug_disease: {
                        include: { disease: true }
                    },
                    usage_method: true,
                    research: true,
                    drug_photos: true,
                    drug_contributor: {
                        include: { contributor: true }
                    }
                },
                orderBy: { created_at: "desc" }
            }),
            db.users.findMany({
                orderBy: { name: "asc" }
            }),
            db.disease.count(),
            db.contributor.count(),
            db.research.count()
        ]);

        // Initialize PDF Document (Portrait, A4)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const fontBinary = await loadNotoSansFont(request.url);
        const fontName = fontBinary ? "NotoSans" : "helvetica";

        if (fontBinary) {
            doc.addFileToVFS("NotoSans.ttf", fontBinary);
            doc.addFont("NotoSans.ttf", "NotoSans", "normal");
            doc.addFont("NotoSans.ttf", "NotoSans", "bold");
            doc.addFont("NotoSans.ttf", "NotoSans", "italic");
            doc.addFont("NotoSans.ttf", "NotoSans", "bolditalic");
            doc.setFont("NotoSans", "normal");
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Header Banner
        doc.setFillColor(16, 85, 55); // Forest / Emerald green
        doc.rect(0, 0, pageWidth, 30, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont(fontName, "bold");
        doc.text("FOLKLORE DIARIES - REGISTRY REPORT", 14, 15);

        doc.setFontSize(9);
        doc.setFont(fontName, "normal");
        doc.setTextColor(200, 240, 220);
        doc.text("Traditional Medicine & Ethnobotanical Knowledge Repository", 14, 22);

        // Header right metadata
        doc.setFontSize(8);
        doc.setTextColor(230, 245, 235);
        const timeRangeLabel = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);
        doc.text(`Time Filter: ${timeRangeLabel}`, pageWidth - 14, 14, { align: "right" });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 20, { align: "right" });

        let currentY = 38;

        // 2. Executive / Statistical Summary (if selected)
        if (incStats) {
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.setFont(fontName, "bold");
            doc.text("Executive Summary", 14, currentY);
            currentY += 4;

            const statsData = [
                ["Total Drugs in Period", drugs.length.toString()],
                ["Total Cataloged Diseases", totalDiseases.toString()],
                ["Total Folk Contributors", totalContributors.toString()],
                ["Total Research References", totalResearch.toString()],
                ["Total Registered Users", users.length.toString()]
            ];

            autoTable(doc, {
                startY: currentY,
                head: [["Metric", "Count / Value"]],
                body: statsData,
                theme: "striped",
                headStyles: {
                    fillColor: [22, 101, 52],
                    textColor: 255,
                    font: fontName,
                    fontSize: 9,
                    fontStyle: "bold"
                },
                styles: {
                    font: fontName,
                    fontSize: 8,
                    cellPadding: 2.5
                },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 80, halign: "right" }
                },
                margin: { left: 14, right: 14 }
            });

            currentY = (doc as any).lastAutoTable.finalY + 10;
        }

        // 3. Drug Records Section
        if (incDrugBasic && drugs.length > 0) {
            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = 20;
            }

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(13);
            doc.setFont(fontName, "bold");
            doc.text(`Cataloged Drug Records (${drugs.length} entries)`, 14, currentY);
            currentY += 6;

            for (let i = 0; i < drugs.length; i++) {
                const drug = drugs[i];

                // Page break check before starting a new drug entry
                if (currentY > pageHeight - 45) {
                    doc.addPage();
                    currentY = 20;
                }

                // Drug Header
                doc.setFillColor(241, 245, 249);
                doc.rect(14, currentY, pageWidth - 28, 8, "F");

                doc.setTextColor(15, 23, 42);
                doc.setFontSize(10);
                doc.setFont(fontName, "bold");
                const sourceBadge = drug.source_type ? `[${drug.source_type}]` : "";
                doc.text(
                    `${i + 1}. ${cleanText(drug.primary_name || "Untitled Drug")} ${sourceBadge}`,
                    16,
                    currentY + 5.5
                );

                if (drug.created_at) {
                    doc.setFontSize(8);
                    doc.setFont(fontName, "normal");
                    doc.setTextColor(100, 116, 139);
                    doc.text(
                        `Added: ${new Date(drug.created_at).toLocaleDateString()}`,
                        pageWidth - 16,
                        currentY + 5.5,
                        { align: "right" }
                    );
                }
                currentY += 11;

                // Botanical Description (preserves Sanskrit/vernacular botanical notes)
                if (incDrugDesc && drug.botanical_description) {
                    doc.setFontSize(8);
                    doc.setFont(fontName, "normal");
                    doc.setTextColor(71, 85, 105);
                    const descLines = doc.splitTextToSize(
                        cleanText(drug.botanical_description),
                        pageWidth - 28
                    );
                    doc.text(descLines, 14, currentY);
                    currentY += descLines.length * 3.5 + 4;
                }

                // Synonyms & Sanskrit Names Table
                if (incDrugNames && drug.drug_names.length > 0) {
                    const namesData = drug.drug_names.map((n) => [
                        n.type || "OTHER",
                        cleanText(n.name)
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [["Name Type", "Taxonomic / Sanskrit / Regional Name"]],
                        body: namesData,
                        theme: "plain",
                        headStyles: {
                            fillColor: [220, 235, 225],
                            textColor: [20, 80, 50],
                            font: fontName,
                            fontSize: 7.5,
                            fontStyle: "bold"
                        },
                        styles: {
                            font: fontName,
                            fontSize: 7.5,
                            cellPadding: 1.5
                        },
                        columnStyles: {
                            0: { cellWidth: 40 },
                            1: { cellWidth: "auto" }
                        },
                        margin: { left: 14, right: 14 }
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 4;
                }

                // Diseases & Usage Methods (with Sanskrit / Ayurvedic indications)
                const diseasesList = drug.drug_disease
                    .map((dd) => cleanText(dd.disease?.name))
                    .filter(Boolean);
                const usageList = drug.usage_method
                    .map((um) => cleanText(um.method_description))
                    .filter(Boolean);

                if ((incDiseases && diseasesList.length > 0) || (incUsageMethods && usageList.length > 0)) {
                    const medRows: string[][] = [];
                    if (incDiseases && diseasesList.length > 0) {
                        medRows.push(["Diseases / Indications", diseasesList.join(", ")]);
                    }
                    if (incUsageMethods && usageList.length > 0) {
                        medRows.push(["Preparation & Usage", usageList.join(" | ")]);
                    }

                    autoTable(doc, {
                        startY: currentY,
                        body: medRows,
                        theme: "plain",
                        styles: {
                            font: fontName,
                            fontSize: 7.5,
                            cellPadding: 1.5
                        },
                        columnStyles: {
                            0: { cellWidth: 45, fontStyle: "bold", textColor: [50, 60, 70] },
                            1: { cellWidth: "auto" }
                        },
                        margin: { left: 14, right: 14 }
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 4;
                }

                // Folk Healers / Contributors
                if (incContributors && drug.drug_contributor.length > 0) {
                    const contribRows = drug.drug_contributor.map((dc) => [
                        cleanText(dc.contributor?.name || "Anonymous"),
                        dc.contributor?.age ? dc.contributor.age.toString() : "N/A",
                        cleanText(dc.contributor?.address || "N/A"),
                        cleanText(dc.contributor?.guru_name || "N/A"),
                        cleanText(dc.contributor?.practice_duration || "N/A")
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [["Contributor / Healer", "Age", "Address", "Guru", "Experience"]],
                        body: contribRows,
                        theme: "grid",
                        headStyles: {
                            fillColor: [240, 245, 250],
                            textColor: [30, 41, 59],
                            font: fontName,
                            fontSize: 7,
                            fontStyle: "bold"
                        },
                        styles: {
                            font: fontName,
                            fontSize: 7,
                            cellPadding: 1.5
                        },
                        margin: { left: 14, right: 14 }
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 4;
                }

                // Research Literature
                if (incResearch && drug.research.length > 0) {
                    const researchRows = drug.research.map((r) => [
                        r.type || "ARTICLE",
                        cleanText(r.title),
                        cleanText(r.link || "N/A")
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [["Type", "Title / Publication", "Reference Link"]],
                        body: researchRows,
                        theme: "plain",
                        headStyles: {
                            font: fontName,
                            fontSize: 7,
                            fontStyle: "bold"
                        },
                        styles: {
                            font: fontName,
                            fontSize: 7,
                            cellPadding: 1.5
                        },
                        columnStyles: {
                            0: { cellWidth: 25 },
                            1: { cellWidth: 100 },
                            2: { cellWidth: "auto" }
                        },
                        margin: { left: 14, right: 14 }
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 4;
                }

                // Photos count or info
                if (incPhotos && drug.drug_photos.length > 0) {
                    doc.setFontSize(7.5);
                    doc.setFont(fontName, "normal");
                    doc.setTextColor(100, 116, 139);
                    doc.text(`Photographs on record: ${drug.drug_photos.length} image(s)`, 14, currentY + 3);
                    currentY += 6;
                }

                currentY += 4; // Space between drugs
            }
        } else if (incDrugBasic && drugs.length === 0) {
            doc.setFontSize(9);
            doc.setFont(fontName, "italic");
            doc.setTextColor(140, 150, 160);
            doc.text("No drug records found for the selected time range.", 14, currentY);
            currentY += 10;
        }

        // 4. User Accounts Section (if selected)
        if (incUsers && users.length > 0) {
            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = 20;
            }

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.setFont(fontName, "bold");
            doc.text(`User Directory (${users.length} registered)`, 14, currentY);
            currentY += 4;

            const userRows = users.map((u, idx) => [
                (idx + 1).toString(),
                cleanText(u.name || "N/A"),
                cleanText(u.email),
                cleanText(u.role || "USER"),
                cleanText(u.status || "ACTIVE")
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [["#", "User Name", "Email Address", "Role", "Status"]],
                body: userRows,
                theme: "striped",
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: 255,
                    font: fontName,
                    fontSize: 8,
                    fontStyle: "bold"
                },
                styles: {
                    font: fontName,
                    fontSize: 7.5,
                    cellPadding: 2
                },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 65 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25 }
                },
                margin: { left: 14, right: 14 }
            });

            currentY = (doc as any).lastAutoTable.finalY + 10;
        }

        // 5. Page Numbering & Footer Metadata
        if (incMeta) {
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7.5);
                doc.setFont(fontName, "normal");
                doc.setTextColor(150, 160, 170);
                doc.text(
                    `Folklore Diaries Administrative Report · Generated on ${new Date().toLocaleDateString()}`,
                    14,
                    pageHeight - 8
                );
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 8, {
                    align: "right"
                });
            }
        }

        // Output PDF as ArrayBuffer and return as blob response
        const pdfArrayBuffer = doc.output("arraybuffer");
        const headers = new Headers();
        headers.set("Content-Type", "application/pdf");
        headers.set(
            "Content-Disposition",
            `attachment; filename=folklore-report-${timeRange}-${new Date().toISOString().split("T")[0]}.pdf`
        );

        return new NextResponse(Buffer.from(pdfArrayBuffer), {
            status: 200,
            headers
        });
    } catch (error: any) {
        console.error("🔴 Error generating report:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate report" },
            { status: 500 }
        );
    }
}
