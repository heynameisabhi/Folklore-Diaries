import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, source_type } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "admin";

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const sourceType = searchParams.get("sourceType")?.trim() || "";
    const disease = searchParams.get("disease")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const sortBy = searchParams.get("sortBy") === "primary_name" ? "primary_name" : "created_at";
    const sortOrder: Prisma.SortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Prisma.drugWhereInput[] = [];

    // Filter by source type
    if (sourceType && ["PLANT", "ANIMAL", "MINERAL"].includes(sourceType.toUpperCase())) {
      andConditions.push({
        source_type: sourceType.toUpperCase() as source_type,
      });
    }

    // Filter by disease
    if (disease) {
      andConditions.push({
        OR: [
          {
            drug_disease: {
              some: {
                disease: {
                  name: { contains: disease, mode: "insensitive" },
                },
              },
            },
          },
          {
            usage_method: {
              some: {
                disease: {
                  name: { contains: disease, mode: "insensitive" },
                },
              },
            },
          },
        ],
      });
    }

    // Filter by text search query
    if (query) {
      andConditions.push({
        OR: [
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
        ],
      });
    }

    const where: Prisma.drugWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [totalMatching, drugs, totalAll, plantCount, animalCount, mineralCount] = await Promise.all([
      db.drug.count({ where }),
      db.drug.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
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
          ...(isAdmin
            ? {
                drug_contributor: {
                  include: {
                    contributor: true,
                  },
                },
              }
            : {}),
        },
      }),
      db.drug.count(),
      db.drug.count({ where: { source_type: "PLANT" } }),
      db.drug.count({ where: { source_type: "ANIMAL" } }),
      db.drug.count({ where: { source_type: "MINERAL" } }),
    ]);

    const formattedDrugs = drugs.map((d: any) => {
      // Gather all distinct disease names
      const diseases = new Set<string>();
      d.drug_disease?.forEach((dd: any) => {
        if (dd.disease?.name) diseases.add(dd.disease.name);
      });
      d.usage_method?.forEach((um: any) => {
        if (um.disease?.name) diseases.add(um.disease.name);
      });

      return {
        id: d.id,
        primary_name: d.primary_name,
        botanical_description: d.botanical_description,
        source_type: d.source_type,
        created_at: d.created_at,
        drug_names: d.drug_names || [],
        diseases: Array.from(diseases),
        usage_methods: d.usage_method || [],
        research: d.research || [],
        photos: d.drug_photos || [],
        contributors: isAdmin
          ? (d.drug_contributor || []).map((dc: any) => dc.contributor).filter(Boolean)
          : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedDrugs,
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit),
      },
      stats: {
        totalAll,
        plants: plantCount,
        animals: animalCount,
        minerals: mineralCount,
      },
      isAdmin,
    });
  } catch (error: any) {
    console.error("Error fetching drug records:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch drug records" },
      { status: 500 }
    );
  }
}

