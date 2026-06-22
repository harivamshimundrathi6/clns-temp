import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await db.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Users fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, status, role } = body;

        const updatedUser = await db.user.update(userId, { status, role });

        // Log the action
        await db.systemLog.create({
                action: "USER_UPDATE",
                description: `Updated user ${userId} - Status: ${status}, Role: ${role}`,
                userId: (session.user as any).id,
            });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("User update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
