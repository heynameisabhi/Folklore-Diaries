import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { userId, status } = reqBody;
        
        if(!userId || !status) {
            return NextResponse.json({error: "User Id or Status not found!"}, {status: 400});
        }

        const user = await db.users.findFirst({
            where: {
                id: userId
            }
        })

        if(!user) {
            return NextResponse.json({error: "User not found!"}, {status: 400});
        }

        const validStatuses = ["ACTIVE", "BLOCKED"]

        if(!validStatuses.includes(status)) {
            return NextResponse.json({error: "Invalid status!"}, {status: 400});
        }

        // update the new status
        await db.users.update({
            where: {
                id: userId,
            },
            data: {
                status: status as any
            }
        })

        return NextResponse.json({success: true, message: `User status updated successfully to ${status}!`}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}