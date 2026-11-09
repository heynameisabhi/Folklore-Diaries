import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, source_type } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIFilters {
  keyword: string;
  diseaseName: string;
  sourceType: string;
  fallback?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ success: true, data: [], aiFilters: null }, { status: 200 });
    }

    let aiFilters: AIFilters = {
      keyword: "",
      diseaseName: "",
      sourceType: "",
    };

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    // Attempt AI extraction with Gemini if API key is present
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
          },
        });

        const prompt = `
You are an expert AI query parser for an Ayurvedic and traditional folklore medicine database.
The user asked: "${query}"

Your task is to extract up to 3 filter fields in strict JSON format:
{
  "diseaseName": "<the disease, condition, symptom, or disorder mentioned, e.g. 'Fever', 'Cough', 'Skin Disease', 'Diabetes'. Empty string if none>",
  "sourceType": "<ONLY 'PLANT', 'ANIMAL', or 'MINERAL' if user specifically asked for that category/source. Empty string if not specified>",
  "keyword": "<specific drug/herb/plant name (e.g. 'Tulsi', 'Neem', 'Ashwagandha') or specific preparation method. DO NOT put disease names, source types ('plant', 'herbs'), or generic words ('cure', 'remedy', 'show me', 'treatment') here. Empty string if none>"
}

Rules:
1. If the user asks "plants for fever", diseaseName is "Fever", sourceType is "PLANT", keyword is "".
2. Do NOT duplicate diseaseName into keyword.
3. Respond ONLY with the JSON object, no explanation.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiFilters = {
            diseaseName: typeof parsed.diseaseName === "string" ? parsed.diseaseName.trim() : "",
            sourceType: typeof parsed.sourceType === "string" ? parsed.sourceType.trim().toUpperCase() : "",
            keyword: typeof parsed.keyword === "string" ? parsed.keyword.trim() : "",
          };
        }
      } catch (geminiError: any) {
        console.warn("Gemini extraction failed, falling back to smart keyword matching:", geminiError?.message || geminiError);
        aiFilters = {
          keyword: query,
          diseaseName: "",
          sourceType: "",
          fallback: true,
        };
      }
    } else {
      // No Gemini API key configured, use query as keyword fallback
      aiFilters = {
        keyword: query,
        diseaseName: "",
        sourceType: "",
        fallback: true,
      };
    }

    // Clean up overlapping keywords
    if (
      aiFilters.keyword &&
      aiFilters.diseaseName &&
      (aiFilters.keyword.toLowerCase().includes(aiFilters.diseaseName.toLowerCase()) ||
        aiFilters.diseaseName.toLowerCase().includes(aiFilters.keyword.toLowerCase()))
    ) {
      aiFilters.keyword = "";
    }

    // Filter out common stop words if AI placed them in keyword
    const stopWords = new Set(["plant", "plants", "herb", "herbs", "animal", "mineral", "remedy", "remedies", "cure", "cures", "medicine", "medicines", "treatment", "treatments", "show", "find", "get"]);
    if (aiFilters.keyword && stopWords.has(aiFilters.keyword.toLowerCase())) {
      aiFilters.keyword = "";
    }

    // Build Prisma query conditions
    const andConditions: Prisma.drugWhereInput[] = [];

    // 1. Source Type Filter
    const validSources = ["PLANT", "ANIMAL", "MINERAL"];
    if (aiFilters.sourceType && validSources.includes(aiFilters.sourceType)) {
      andConditions.push({
        source_type: aiFilters.sourceType as source_type,
      });
    }

    // 2. Disease Filter: Check both drug_disease AND usage_method.disease
    if (aiFilters.diseaseName) {
      andConditions.push({
        OR: [
          {
            drug_disease: {
              some: {
                disease: {
                  name: { contains: aiFilters.diseaseName, mode: "insensitive" },
                },
              },
            },
          },
          {
            usage_method: {
              some: {
                disease: {
                  name: { contains: aiFilters.diseaseName, mode: "insensitive" },
                },
              },
            },
          },
          {
            usage_method: {
              some: {
                method_description: { contains: aiFilters.diseaseName, mode: "insensitive" },
              },
            },
          },
        ],
      });
    }

    // 3. Keyword Filter (searches across names, botanical description, and usage methods)
    if (aiFilters.keyword) {
      andConditions.push({
        OR: [
          { primary_name: { contains: aiFilters.keyword, mode: "insensitive" } },
          { botanical_description: { contains: aiFilters.keyword, mode: "insensitive" } },
          {
            drug_names: {
              some: {
                name: { contains: aiFilters.keyword, mode: "insensitive" },
              },
            },
          },
          {
            drug_disease: {
              some: {
                disease: {
                  name: { contains: aiFilters.keyword, mode: "insensitive" },
                },
              },
            },
          },
          {
            usage_method: {
              some: {
                method_description: { contains: aiFilters.keyword, mode: "insensitive" },
              },
            },
          },
        ],
      });
    }

    // If no specific filters were parsed, search across all relevant fields using the raw query
    if (andConditions.length === 0) {
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

    const whereClause: Prisma.drugWhereInput = {
      AND: andConditions,
    };

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

    const formattedData = drugs.map((d) => {
      const allNames = d.drug_names.map((n) => n.name).filter(Boolean).join(", ");
      
      // Combine diseases from drug_disease and usage_method
      const diseaseSet = new Set<string>();
      d.drug_disease.forEach((dd) => {
        if (dd.disease?.name) diseaseSet.add(dd.disease.name);
      });
      d.usage_method.forEach((um) => {
        if (um.disease?.name) diseaseSet.add(um.disease.name);
      });
      const allDiseases = Array.from(diseaseSet).join(", ");

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
        diseases: Array.from(diseaseSet),
        usage_methods: d.usage_method,
        research: d.research,
        photos: d.drug_photos,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
        aiFilters: aiFilters,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("AI Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search data" },
      { status: 500 }
    );
  }
}
