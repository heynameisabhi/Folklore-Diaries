import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!params.userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await db.users.findUnique({
            where: {
                id: params.userId,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const response = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user details" },
            { status: 500 }
        );
    }
} 