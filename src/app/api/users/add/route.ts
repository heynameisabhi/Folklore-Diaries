import { db } from "@/lib/db";
import { RegisterUserAccountValidator } from "@/lib/validators/useraccount";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { name, password, role, email } = RegisterUserAccountValidator.parse(reqBody);

        const user = await db.users.findFirst({
            where: {
                OR: [
                    { name },
                    { email },
                ]
            }
        })

        // if there is already a user then no need to register again
        if(user) {
            return NextResponse.json({
                success: false,
                message: "User already exists"
            }, { status: 400 })
        }

        // if there is no existing user then register the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.users.create({
            data: {
                name,
                password: hashedPassword,
                email: email,
                role: role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
            }
        })

        
        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            data: newUser
        }, { status: 200 })

    } catch (error) {
        if(error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid request data passed: ", error }, {status: 422})
        }

        return NextResponse.json({ message: "Could not register user, please try again later." }, {status: 500})
    }
}