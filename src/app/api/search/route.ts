import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const sourceType = searchParams.get("sourceType")?.trim() || "";
    const diseaseName = searchParams.get("diseaseName")?.trim() || "";
    const researchTitle = searchParams.get("researchTitle")?.trim() || "";

    // Build the where clause for Prisma
    const whereClause: Prisma.drugWhereInput = {};

    // Global text search across primary_name, botanical_description, and related fields
    if (query) {
      whereClause.OR = [
        { primary_name: { contains: query, mode: "insensitive" } },
        { botanical_description: { contains: query, mode: "insensitive" } },
        {
          drug_names: {
            some: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        },
        {
          drug_disease: {
            some: {
              disease: {
                name: { contains: query, mode: "insensitive" },
              },
            },
          },
        },
        {
          usage_method: {
            some: {
              method_description: { contains: query, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // Advanced filters
    if (sourceType) {
      whereClause.source_type = sourceType as any;
    }

    if (diseaseName) {
      whereClause.drug_disease = {
        some: {
          disease: {
            name: { contains: diseaseName, mode: "insensitive" },
          },
        },
      };
    }

    if (researchTitle) {
      whereClause.research = {
        some: {
          title: { contains: researchTitle, mode: "insensitive" },
        },
      };
    }

    const drugs = await db.drug.findMany({
      where: whereClause,
      include: {
        drug_names: true,
        drug_disease: {
          include: {
            disease: true,
          },
        },
        usage_method: {
          include: {
            disease: true,
          },
        },
        research: true,
        drug_photos: true,
      },
    });

    // Format the response:
    // Extract an abstract/summary for the output. 
    // Do NOT include drug_contributor per user requirements.
    const formattedData = drugs.map((d) => {
      // Create a short abstract
      const allNames = d.drug_names.map((n) => n.name).filter(Boolean).join(", ");
      const allDiseases = d.drug_disease
        .map((dd) => dd.disease?.name)
        .filter(Boolean)
        .join(", ");
      
      let abstract = `Primary Name: ${d.primary_name || "Unknown"}. `;
      if (allNames) abstract += `Other Names: ${allNames}. `;
      if (allDiseases) abstract += `Treats: ${allDiseases}. `;
      if (d.source_type) abstract += `Source: ${d.source_type}.`;

      return {
        id: d.id,
        primary_name: d.primary_name,
        botanical_description: d.botanical_description,
        source_type: d.source_type,
        abstract: abstract,
        drug_names: d.drug_names,
        diseases: d.drug_disease.map((dd) => dd.disease?.name).filter(Boolean),
        usage_methods: d.usage_method,
        research: d.research,
        photos: d.drug_photos,
      };
    });

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search data" },
      { status: 500 }
    );
  }
}
