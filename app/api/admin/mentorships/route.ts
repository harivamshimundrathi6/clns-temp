import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mentorships = await db.mentorship.findMany({
            include: { mentor: true, student: true, _count: { select: { mentorshipSessions: true } } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ mentorships });
    } catch (error) {
        console.error("Mentorships fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
