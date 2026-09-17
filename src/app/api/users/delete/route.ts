import { getAuthSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        // Only admins can delete users
        const session = await getAuthSession();
        if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID not provided." }, { status: 400 });
        }

        // 1. Delete from Supabase Auth (this is the crucial step so they don't get recreated on sync)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
            console.error("Error deleting user from Auth:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // 2. Delete from public.users
        const { error: dbError } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", userId);

        if (dbError) {
            console.error("Error deleting user from DB:", dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json(
            { success: true, message: "User permanently deleted." },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
