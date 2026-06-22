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

        const applications = await db.internshipApplication.findMany({
            where: { studentId: userId },
            include: { posting: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("Student applications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { postingId, coverNote } = body;

        // Check if already applied
        const existing = await db.internshipApplication.findFirst({
            where: {
                studentId: (session.user as any).id,
                postingId,
            },
        });

        if (existing) {
            return NextResponse.json({ error: "Already applied" }, { status: 400 });
        }

        const newApplication = await db.internshipApplication.create({
            studentId: (session.user as any).id,
            postingId,
            coverNote,
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Log the action
        await db.systemLog.create({
            action: "APPLICATION_SUBMIT",
            description: `Student applied for internship ${postingId}`,
            userId: (session.user as any).id,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ application: newApplication });
    } catch (error) {
        console.error("Application submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
