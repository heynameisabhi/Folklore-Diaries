import { getAuthSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { RegisterUserAccountValidator } from "@/lib/validators/useraccount";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
    try {
        // Only admins can create users
        const session = await getAuthSession();
        if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const reqBody = await request.json();
        const { name, password, role, email } = RegisterUserAccountValidator.parse(reqBody);

        // Check if the user already exists (via supabaseAdmin to bypass RLS)
        const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .or(`name.eq.${name},email.eq.${email}`)
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "A user with this name or email already exists."
            }, { status: 400 });
        }

        const assignedRole = role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

        // Create the user in Supabase Auth — password stored by Supabase, NOT in our DB
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // auto-confirm so the user can log in immediately
            user_metadata: { role: assignedRole },
            app_metadata: { role: assignedRole }
        });

        if (authError) {
            console.error("Supabase Auth error:", authError);
            return NextResponse.json({
                success: false,
                message: authError.message || "Failed to create auth user"
            }, { status: 400 });
        }


        // Create or update the profile row in public.users via supabaseAdmin (bypasses RLS)
        // We use upsert in case a Supabase background trigger auto-created the row with 'USER'
        const { data: newUser, error: insertError } = await supabaseAdmin
            .from("users")
            .upsert({
                id: authData.user!.id,
                name,
                email,
                role: assignedRole,
            }, { onConflict: 'email' })
            .select()
            .single();

        if (insertError) {
            // Rollback: delete the Supabase Auth user so auth & DB stay in sync
            await supabaseAdmin.auth.admin.deleteUser(authData.user!.id);
            console.error("DB insert error:", insertError);
            return NextResponse.json({
                success: false,
                message: insertError.message || "Failed to create user profile in DB"
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `${assignedRole === "ADMIN" ? "Admin" : "User"} created successfully.`,
            data: newUser
        }, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return the first validation error message so the user knows exactly what's wrong
            const firstError = error.errors[0]?.message || "Invalid request data.";
            return NextResponse.json({ message: firstError }, { status: 422 });
        }

        console.error("Registration error:", error);
        return NextResponse.json({ message: "Could not register user, please try again later." }, { status: 500 });
    }
}