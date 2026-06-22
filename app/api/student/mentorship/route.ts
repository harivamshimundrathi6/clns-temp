import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const mentorships = await db.mentorship.findMany({
            where: { studentId: userId },
            include: { mentor: true, mentorshipSessions: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ mentorships });
    } catch (error) {
        console.error("Student mentorships error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
