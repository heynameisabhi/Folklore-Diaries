import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { source_type } from "@prisma/client";

const VALID_SOURCE_TYPES = Object.values(source_type);

interface DrugCSVRow {
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

/**
 * Split a semicolon-separated string into trimmed, non-empty items.
 */
function splitMulti(value: string): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { drugs } = body as { drugs: DrugCSVRow[] };

    if (!Array.isArray(drugs) || drugs.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of drug records is required." },
        { status: 400 }
      );
    }

    // Validate
    const errors: string[] = [];
    drugs.forEach((drug, index) => {
      if (!drug.primary_name?.trim()) {
        errors.push(`Row ${index + 1}: primary_name is required.`);
      }
      const st = drug.source_type?.trim()?.toUpperCase();
      if (st && !VALID_SOURCE_TYPES.includes(st as source_type)) {
        errors.push(
          `Row ${index + 1}: Invalid source_type "${drug.source_type}". Must be one of: ${VALID_SOURCE_TYPES.join(", ")}.`
        );
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed.", details: errors },
        { status: 400 }
      );
    }

    let totalInserted = 0;
    let totalUpdated = 0;

    // Process each drug row individually to prevent Vercel Serverless / PgBouncer transaction timeouts
    for (const row of drugs) {
      await db.$transaction(
        async (tx) => {
          const primaryNameTrimmed = row.primary_name.trim();

          // 1. Check if the drug already exists
          let drugRecord = await tx.drug.findFirst({
            where: {
              primary_name: { equals: primaryNameTrimmed, mode: "insensitive" },
            },
          });

          let drugId: string;

          if (drugRecord) {
            drugId = drugRecord.id;
            // Update botanical description if current is empty but row has one
            if (!drugRecord.botanical_description && row.botanical_description?.trim()) {
              await tx.drug.update({
                where: { id: drugId },
                data: { botanical_description: row.botanical_description.trim() },
              });
            }
            // Update source type if current is empty but row has one
            if (!drugRecord.source_type && row.source_type?.trim()?.toUpperCase()) {
              await tx.drug.update({
                where: { id: drugId },
                data: {
                  source_type: row.source_type.trim().toUpperCase() as source_type,
                },
              });
            }
            totalUpdated++;
          } else {
            drugRecord = await tx.drug.create({
              data: {
                primary_name: primaryNameTrimmed,
                botanical_description: row.botanical_description?.trim() || null,
                source_type: row.source_type?.trim()?.toUpperCase()
                  ? (row.source_type.trim().toUpperCase() as source_type)
                  : null,
              },
            });
            drugId = drugRecord.id;
            totalInserted++;
          }

          // 2. Insert drug_names (botanical, sanskrit, vernacular)
          const botanicalNames = splitMulti(row.botanical_names);
          const sanskritNames = splitMulti(row.sanskrit_names);
          const vernacularNames = splitMulti(row.vernacular_names);

          const rawNames = [
            ...botanicalNames.map((name) => ({ name, type: "BOTANICAL" as const })),
            ...sanskritNames.map((name) => ({ name, type: "SANSKRIT" as const })),
            ...vernacularNames.map((name) => ({ name, type: "VERNACULAR" as const })),
          ];

          for (const item of rawNames) {
            // Check if this specific name and type already exists for this drug
            const existingName = await tx.drug_names.findFirst({
              where: {
                drug_id: drugId,
                type: item.type,
                name: { equals: item.name, mode: "insensitive" },
              },
            });

            if (!existingName) {
              await tx.drug_names.create({
                data: {
                  name: item.name,
                  type: item.type,
                  drug_id: drugId,
                },
              });
            }
          }

          // 3. Insert diseases + drug_disease junction
          const diseaseNames = splitMulti(row.diseases);
          const diseaseIdMap: Record<string, string> = {};

          for (const diseaseName of diseaseNames) {
            // Find or create disease
            let disease = await tx.disease.findFirst({
              where: {
                name: { equals: diseaseName, mode: "insensitive" },
              },
            });

            if (!disease) {
              disease = await tx.disease.create({
                data: { name: diseaseName },
              });
            }

            diseaseIdMap[diseaseName] = disease.id;

            // Check if drug_disease relation already exists
            const existingRelation = await tx.drug_disease.findFirst({
              where: {
                drug_id: drugId,
                disease_id: disease.id,
              },
            });

            if (!existingRelation) {
              await tx.drug_disease.create({
                data: {
                  drug_id: drugId,
                  disease_id: disease.id,
                },
              });
            }
          }

          // 4. Insert usage_methods
          const usageMethods = splitMulti(row.usage_methods);
          for (const method of usageMethods) {
            const targetDiseaseId =
              diseaseNames.length === 1 ? diseaseIdMap[diseaseNames[0]] : null;

            // Check if this usage method description already exists for the drug (and disease if specified)
            const existingMethod = await tx.usage_method.findFirst({
              where: {
                drug_id: drugId,
                method_description: { equals: method, mode: "insensitive" },
                disease_id: targetDiseaseId,
              },
            });

            if (!existingMethod) {
              await tx.usage_method.create({
                data: {
                  drug_id: drugId,
                  method_description: method,
                  disease_id: targetDiseaseId,
                },
              });
            }
          }

          // 5. Insert research (articles + thesis)
          const articles = splitMulti(row.research_articles);
          const theses = splitMulti(row.research_thesis);

          const rawResearch = [
            ...articles.map((item) => ({ title: item, type: "ARTICLE" as const })),
            ...theses.map((item) => ({ title: item, type: "THESIS" as const })),
          ];

          for (const item of rawResearch) {
            // Check if this research title and type already exists for this drug
            const existingResearch = await tx.research.findFirst({
              where: {
                drug_id: drugId,
                type: item.type,
                title: { equals: item.title, mode: "insensitive" },
              },
            });

            if (!existingResearch) {
              await tx.research.create({
                data: {
                  type: item.type,
                  title: item.title,
                  link: null,
                  drug_id: drugId,
                },
              });
            }
          }

          // 6. Insert drug_photos
          const photoUrls = splitMulti(row.photo_urls);
          for (const url of photoUrls) {
            // Check if photo URL exists for this drug
            const existingPhoto = await tx.drug_photos.findFirst({
              where: {
                drug_id: drugId,
                image_url: { equals: url, mode: "insensitive" },
              },
            });

            if (!existingPhoto) {
              await tx.drug_photos.create({
                data: {
                  image_url: url,
                  drug_id: drugId,
                },
              });
            }
          }

          // 7. Insert contributors + drug_contributor junction
          const contributorNames = splitMulti(row.contributor_names);
          const contributorAges = splitMulti(row.contributor_ages);
          const contributorAddresses = splitMulti(row.contributor_addresses);
          const contributorGurus = splitMulti(row.contributor_gurus);
          const contributorPracticeDurations = splitMulti(row.contributor_practice_durations);

          for (let i = 0; i < contributorNames.length; i++) {
            const contribName = contributorNames[i];

            // Extract other attributes at the same index if they exist
            const rawAge = contributorAges[i];
            const parsedAge = rawAge ? parseInt(rawAge.trim(), 10) : null;
            const contribAge = isNaN(parsedAge as any) ? null : parsedAge;

            const contribAddress = contributorAddresses[i] || null;
            const contribGuru = contributorGurus[i] || null;
            const contribPractice = contributorPracticeDurations[i] || null;

            // Find or create contributor
            let contributor = await tx.contributor.findFirst({
              where: {
                name: { equals: contribName, mode: "insensitive" },
              },
            });

            if (!contributor) {
              contributor = await tx.contributor.create({
                data: {
                  name: contribName,
                  age: contribAge,
                  address: contribAddress,
                  guru_name: contribGuru,
                  practice_duration: contribPractice,
                },
              });
            } else {
              // Update contributor attributes if they are currently null but provided in CSV
              const updates: any = {};
              if (contributor.age === null && contribAge !== null) {
                updates.age = contribAge;
              }
              if (!contributor.address && contribAddress) {
                updates.address = contribAddress;
              }
              if (!contributor.guru_name && contribGuru) {
                updates.guru_name = contribGuru;
              }
              if (!contributor.practice_duration && contribPractice) {
                updates.practice_duration = contribPractice;
              }

              if (Object.keys(updates).length > 0) {
                contributor = await tx.contributor.update({
                  where: { id: contributor.id },
                  data: updates,
                });
              }
            }

            // Check if drug_contributor relation already exists
            const existingRelation = await tx.drug_contributor.findFirst({
              where: {
                drug_id: drugId,
                contributor_id: contributor.id,
              },
            });

            if (!existingRelation) {
              await tx.drug_contributor.create({
                data: {
                  drug_id: drugId,
                  contributor_id: contributor.id,
                },
              });
            }
          }
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully processed drug records: ${totalInserted} newly created, ${totalUpdated} merged with existing records.`,
        insertedCount: totalInserted,
        updatedCount: totalUpdated,
        count: totalInserted + totalUpdated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error inserting drugs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
