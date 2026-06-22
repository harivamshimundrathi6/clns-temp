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

        const hearings = await db.hearing.findMany({
            where: {
                case: { advocateId: userId },
                date: { gt: new Date() },
            },
            include: { case: true },
            orderBy: { date: "asc" }
        });

        return NextResponse.json({ hearings });
    } catch (error) {
        console.error("Advocate hearings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADVOCATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { date, title, court, caseId } = body;

        const newHearing = await db.hearing.create({
                date: new Date(date),
                title,
                court,
                caseId,
            });

        // Log the action
        await db.systemLog.create({
                action: "HEARING_CREATE",
                description: `Created hearing ${newHearing.id} for case ${caseId}`,
                userId: (session.user as any).id,
            });

        return NextResponse.json({ hearing: newHearing });
    } catch (error) {
        console.error("Hearing creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
