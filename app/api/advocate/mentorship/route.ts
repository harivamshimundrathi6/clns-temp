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

        const mentorships = await db.mentorship.findMany({
            where: { mentorId: userId },
            include: { student: true, mentorshipSessions: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ mentorships });
    } catch (error) {
        console.error("Advocate mentorships error:", error);
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
        const { studentId, programId } = body;

        const newMentorship = await db.mentorship.create({
                mentorId: (session.user as any).id,
                studentId,
                programId,
            });

        // Log the action
        await db.systemLog.create({
                action: "MENTORSHIP_CREATE",
                description: `Created mentorship ${newMentorship.id} with student ${studentId}`,
                userId: (session.user as any).id,
            });

        return NextResponse.json({ mentorship: newMentorship });
    } catch (error) {
        console.error("Mentorship creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
