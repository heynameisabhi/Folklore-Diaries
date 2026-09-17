import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Old password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { message: 'New password must be different from current password.' },
        { status: 400 }
      );
    }

    // Verify the user exists in our profile table
    const user = await db.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    // Verify the current (old) password via Supabase Auth
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { message: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    // Find the Supabase Auth user by email to get their auth UUID
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Failed to list auth users:', listError);
      return NextResponse.json(
        { message: 'An internal server error occurred.' },
        { status: 500 }
      );
    }

    const authUser = authUsers.users.find((u) => u.email === user.email);

    if (!authUser) {
      return NextResponse.json(
        { message: 'Auth user not found. Please contact support.' },
        { status: 404 }
      );
    }

    // Update the password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return NextResponse.json(
        { message: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password changed successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}