import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    if (!genAI) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            keyword: {
              type: SchemaType.STRING,
              description: "A general search keyword extracted from the query (like a plant name, usage, or description). Empty string if none.",
            },
            diseaseName: {
              type: SchemaType.STRING,
              description: "A disease or symptom mentioned in the query (e.g., 'Fever', 'Cough', 'Skin Disease'). Empty string if none.",
            },
            sourceType: {
              type: SchemaType.STRING,
              description: "The source type of the drug. Must be exactly 'PLANT', 'ANIMAL', or 'MINERAL'. Empty string if none.",
            },
          },
        },
      },
    });

    const prompt = `
      You are an AI assistant for a traditional medicine database.
      Extract search filters from the user's query: "${query}"
      
      Rules:
      - 'diseaseName': extract any medical conditions, diseases, or symptoms.
      - 'sourceType': ONLY use 'PLANT', 'ANIMAL', or 'MINERAL'.
      - 'keyword': extract any other significant search terms (like plant names or specific treatments).
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const aiFilters = JSON.parse(responseText);

    // Build the where clause for Prisma
    const whereClause: Prisma.drugWhereInput = {};

    if (aiFilters.keyword) {
      whereClause.OR = [
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
          usage_method: {
            some: {
              method_description: { contains: aiFilters.keyword, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (aiFilters.sourceType) {
      whereClause.source_type = aiFilters.sourceType as any;
    }

    if (aiFilters.diseaseName) {
      whereClause.drug_disease = {
        some: {
          disease: {
            name: { contains: aiFilters.diseaseName, mode: "insensitive" },
          },
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

    const formattedData = drugs.map((d) => {
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

    return NextResponse.json({ 
      success: true, 
      data: formattedData,
      aiFilters: aiFilters // Send back the parsed filters for the UI to display
    }, { status: 200 });

  } catch (error: any) {
    console.error("AI Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search data" },
      { status: 500 }
    );
  }
}
