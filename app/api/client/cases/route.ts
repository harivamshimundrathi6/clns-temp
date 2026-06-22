import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const cases = await db.case.findMany({
            where: { clientId: userId },
            include: { advocate: true, hearings: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ cases });
    } catch (error) {
        console.error("Client cases error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, type } = body;

        const newCase = await db.case.create({
                title,
                description,
                type,
                clientId: (session.user as any).id,
            });

        // Log the action
        await db.systemLog.create({
                action: "CASE_CREATE",
                description: `Client created case ${newCase.id}`,
                userId: (session.user as any).id,
            });

        return NextResponse.json({ case: newCase });
    } catch (error) {
        console.error("Case creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
