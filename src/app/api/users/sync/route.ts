import { getAuthSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Only admins can trigger a sync
        const session = await getAuthSession();
        if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch all users from Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) {
            console.error("Error fetching Supabase Auth users:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        const authUsers = authData.users;

        // 2. Fetch all existing emails in public.users
        const { data: existingUsers, error: fetchError } = await supabaseAdmin
            .from("users")
            .select("email");

        if (fetchError) {
            console.error("Error fetching existing users:", fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const existingEmails = new Set((existingUsers ?? []).map((u: any) => u.email));

        // 3. Find auth users not yet in public.users
        const toInsert = authUsers
            .filter((authUser) => authUser.email && !existingEmails.has(authUser.email))
            .map((authUser) => ({
                id: authUser.id, // keep same UUID as auth.users for consistency
                email: authUser.email!,
                name:
                    authUser.user_metadata?.name ||
                    authUser.email!.split("@")[0], // fallback: use email prefix as name
                role: "USER",
                status: "ACTIVE",
            }));

        if (toInsert.length === 0) {
            return NextResponse.json({
                success: true,
                synced: 0,
                message: "All auth users are already synced. Nothing to do.",
            });
        }

        // 4. Insert the missing users into public.users
        const { error: insertError } = await supabaseAdmin
            .from("users")
            .insert(toInsert);

        if (insertError) {
            console.error("Error inserting synced users:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            synced: toInsert.length,
            message: `Successfully synced ${toInsert.length} user(s) from Supabase Auth.`,
        });

    } catch (error: any) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
