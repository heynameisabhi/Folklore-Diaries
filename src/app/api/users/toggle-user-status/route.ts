import { getAuthSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {
        // Only admins can toggle user status
        const session = await getAuthSession();
        if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reqBody = await request.json();
        const { userId, status } = reqBody;

        if (!userId || !status) {
            return NextResponse.json({ error: "User ID or Status not provided." }, { status: 400 });
        }

        const validStatuses = ["ACTIVE", "BLOCKED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
        }

        // Check user exists via supabaseAdmin (bypasses RLS)
        const { data: user, error: findError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

        if (findError || !user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // Update status via supabaseAdmin (bypasses RLS)
        const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({ status })
            .eq("id", userId);

        if (updateError) {
            console.error("Error updating user status:", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(
            { success: true, message: `User status updated to ${status}.` },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}