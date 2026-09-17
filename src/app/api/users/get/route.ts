import { getAuthSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const session = await getAuthSession();
        if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get("search")?.trim() || "";

        // Use supabaseAdmin to bypass RLS on the users table
        let query = supabaseAdmin
            .from("users")
            .select("id, name, email, role, status");

        if (searchQuery) {
            query = query.or(
                `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
            );
        }

        const { data: users, error } = await query;

        if (error) {
            console.error("Error fetching users:", error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json(users ?? [], { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}