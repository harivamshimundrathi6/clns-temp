import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADVOCATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const clients = await db.user.findMany({
            where: {
                cases: {
                    some: { advocateId: userId }
                }
            },
            distinct: ['id'],
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ clients });
    } catch (error) {
        console.error("Advocate clients error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
