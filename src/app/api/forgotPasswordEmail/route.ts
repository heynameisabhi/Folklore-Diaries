import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;

        if (!email) {
            return NextResponse.json({ error: "Email not found!" }, { status: 400 });
        }

        // Verify the user exists in our profile table
        const user = await db.users.findFirst({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found!" }, { status: 402 });
        }

        // Trigger Supabase Auth's built-in password reset email
        // Supabase will send the reset link automatically — no Nodemailer or custom tokens needed
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.DOMAIN}/resetPassword`,
        });

        if (error) {
            console.error("Supabase reset password error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            {
                message: "Password reset email sent successfully!",
                success: true,
            },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}