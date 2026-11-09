import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { source_type, drug_name_type, research_type } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user?.role?.toUpperCase() === "ADMIN";

    const drug = await db.drug.findUnique({
      where: { id },
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
    });

    if (!drug) {
      return NextResponse.json({ error: "Drug record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: drug });
  } catch (error: any) {
    console.error("Error fetching drug:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch drug record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required to delete records." },
        { status: 403 }
      );
    }

    const existingDrug = await db.drug.findUnique({
      where: { id },
    });

    if (!existingDrug) {
      return NextResponse.json({ error: "Drug record not found" }, { status: 404 });
    }

    // Safely delete in transaction
    await db.$transaction(async (tx) => {
      // 1. Delete relations
      await tx.drug_names.deleteMany({ where: { drug_id: id } });
      await tx.drug_disease.deleteMany({ where: { drug_id: id } });
      await tx.usage_method.deleteMany({ where: { drug_id: id } });
      await tx.drug_contributor.deleteMany({ where: { drug_id: id } });
      await tx.research.deleteMany({ where: { drug_id: id } });
      await tx.drug_photos.deleteMany({ where: { drug_id: id } });

      // 2. Delete drug record itself
      await tx.drug.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: `Formulation "${existingDrug.primary_name || "Record"}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Error deleting drug record:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete drug record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required to edit records." },
        { status: 403 }
      );
    }

    const existingDrug = await db.drug.findUnique({
      where: { id },
    });

    if (!existingDrug) {
      return NextResponse.json({ error: "Drug record not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      primary_name,
      source_type: inputSourceType,
      botanical_description,
      drug_names = [],
      diseases = [],
      usage_methods = [],
      research = [],
      contributor,
    } = body;

    if (!primary_name?.trim()) {
      return NextResponse.json({ error: "Primary name is required." }, { status: 400 });
    }

    const cleanSourceType = inputSourceType?.trim()?.toUpperCase();
    if (cleanSourceType && !["PLANT", "ANIMAL", "MINERAL"].includes(cleanSourceType)) {
      return NextResponse.json(
        { error: 'Invalid source type. Must be "PLANT", "ANIMAL", or "MINERAL".' },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      // 1. Update basic drug fields
      await tx.drug.update({
        where: { id },
        data: {
          primary_name: primary_name.trim(),
          botanical_description: botanical_description?.trim() || null,
          source_type: (cleanSourceType as source_type) || null,
        },
      });

      // 2. Replace drug_names
      await tx.drug_names.deleteMany({ where: { drug_id: id } });
      if (Array.isArray(drug_names) && drug_names.length > 0) {
        for (const dn of drug_names) {
          if (dn.name?.trim()) {
            const rawType = dn.type?.toUpperCase();
            const validType = ["BOTANICAL", "SANSKRIT", "VERNACULAR"].includes(rawType)
              ? (rawType as drug_name_type)
              : null;
            await tx.drug_names.create({
              data: {
                drug_id: id,
                name: dn.name.trim(),
                type: validType,
              },
            });
          }
        }
      }

      // 3. Replace diseases & drug_disease
      await tx.drug_disease.deleteMany({ where: { drug_id: id } });
      const diseaseIdMap: Record<string, string> = {};
      if (Array.isArray(diseases) && diseases.length > 0) {
        for (const diseaseName of diseases) {
          const trimmed = diseaseName?.trim();
          if (trimmed) {
            let disease = await tx.disease.findUnique({
              where: { name: trimmed },
            });
            if (!disease) {
              disease = await tx.disease.create({
                data: { name: trimmed },
              });
            }
            diseaseIdMap[trimmed.toLowerCase()] = disease.id;
            await tx.drug_disease.create({
              data: {
                drug_id: id,
                disease_id: disease.id,
              },
            });
          }
        }
      }

      // 4. Replace usage_methods
      await tx.usage_method.deleteMany({ where: { drug_id: id } });
      if (Array.isArray(usage_methods) && usage_methods.length > 0) {
        for (const um of usage_methods) {
          const desc = typeof um === "string" ? um.trim() : um.method_description?.trim();
          if (desc) {
            let diseaseId: string | null = null;
            const targetDisease = typeof um === "object" ? um.diseaseName?.trim() : null;
            if (targetDisease) {
              diseaseId = diseaseIdMap[targetDisease.toLowerCase()] || null;
            }
            await tx.usage_method.create({
              data: {
                drug_id: id,
                method_description: desc,
                disease_id: diseaseId,
              },
            });
          }
        }
      }

      // 5. Replace research
      await tx.research.deleteMany({ where: { drug_id: id } });
      if (Array.isArray(research) && research.length > 0) {
        for (const r of research) {
          if (r.title?.trim()) {
            const rawType = r.type?.toUpperCase();
            const validType = ["ARTICLE", "THESIS"].includes(rawType)
              ? (rawType as research_type)
              : null;
            await tx.research.create({
              data: {
                drug_id: id,
                title: r.title.trim(),
                type: validType,
                link: r.link?.trim() || null,
              },
            });
          }
        }
      }

      // 6. Contributor update (if provided)
      if (contributor && contributor.name?.trim()) {
        let existingContributorId: string | null = null;
        const currentLink = await tx.drug_contributor.findFirst({
          where: { drug_id: id },
        });

        if (currentLink && currentLink.contributor_id) {
          existingContributorId = currentLink.contributor_id;
          await tx.contributor.update({
            where: { id: existingContributorId },
            data: {
              name: contributor.name.trim(),
              age: contributor.age ? parseInt(contributor.age, 10) || null : null,
              address: contributor.address?.trim() || null,
              guru_name: contributor.guru_name?.trim() || null,
              practice_duration: contributor.practice_duration?.trim() || null,
            },
          });
        } else {
          const newContributor = await tx.contributor.create({
            data: {
              name: contributor.name.trim(),
              age: contributor.age ? parseInt(contributor.age, 10) || null : null,
              address: contributor.address?.trim() || null,
              guru_name: contributor.guru_name?.trim() || null,
              practice_duration: contributor.practice_duration?.trim() || null,
            },
          });
          await tx.drug_contributor.create({
            data: {
              drug_id: id,
              contributor_id: newContributor.id,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Formulation "${primary_name.trim()}" updated successfully.`,
    });
  } catch (error: any) {
    console.error("Error updating drug record:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update drug record" },
      { status: 500 }
    );
  }
}

