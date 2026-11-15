import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const session = await getAuthSession();
        if(!session) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // Fetch all verified drug records added by the admin with complete relations
        const recentDrugRecords = await db.drug.findMany({
            orderBy: {
                created_at: "desc",
            },
            take: 100,
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

        const recordCount = await db.drug.count()


        return NextResponse.json({ recentDrugRecords, recordCount, message: "Records fetched successfully" }, { status: 200 });
        
    } catch (error: any) {

        console.log(error.message);
        return NextResponse.json(error.message, { status: 500 });
        
    }
}