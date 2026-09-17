import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * PUT /api/resetPassword
 *
 * Resets a user's password via Supabase Auth.
 * 
 * When the user clicks the reset link in their email, Supabase redirects them
 * to /resetPassword with a session token in the URL hash (#access_token=...).
 * The client-side page should exchange that token and then call this endpoint
 * with the new password, passing the access_token in the Authorization header.
 */
export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { newPassword, accessToken } = reqBody;

        if (!accessToken) {
            return NextResponse.json({ error: "Access token not found!" }, { status: 400 });
        }

        if (!newPassword) {
            return NextResponse.json({ error: "New password not found!" }, { status: 400 });
        }

        // Get the user from the access token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

        if (userError || !user) {
            return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
        }

        // Update the password in Supabase Auth
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error("Supabase update password error:", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            message: "Password changed successfully!",
            success: true,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}