import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type UserActivity = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
};

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // Get all users
        const users = await db.users.findMany({
            where: {
                role: {
                    not: "ADMIN"
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            }
        });

        // Format the data
        const formattedUsers: UserActivity[] = users.map(user => {
            return {
                id: user.id,
                name: user.name || "Unnamed User",
                email: user.email,
                role: user.role || "USER",
                status: user.status || "ACTIVE",
            };
        });

        // Get user activity chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const userActivityChart = await Promise.all(
            last7Days.map(async (date) => {
                const active = await db.users.count({
                    where: {
                        status: "ACTIVE",
                        role: {
                            not: "ADMIN"
                        }
                    }
                });

                const blocked = await db.users.count({
                    where: {
                        status: "BLOCKED",
                        role: {
                            not: "ADMIN"
                        }
                    }
                });

                return {
                    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                    active,
                    blocked
                };
            })
        );

        return NextResponse.json({
            users: formattedUsers,
            userActivityChart
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(error.message, { status: 500 });
    }
} 