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

        const postings = await db.internshipPosting.findMany({
            where: { authorId: userId },
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ postings });
    } catch (error) {
        console.error("Advocate internships error:", error);
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
        const { title, company, location, description, type, deadline, duration, stipend } = body;

        const newPosting = await db.internshipPosting.create({
            title,
            company,
            location,
            description,
            type,
            deadline: deadline ? new Date(deadline).toISOString() : undefined,
            duration,
            stipend,
            authorId: (session.user as any).id,
            status: "OPEN",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Log the action
        await db.systemLog.create({
            action: "INTERNSHIP_CREATE",
            description: `Created internship posting ${newPosting.id}`,
            userId: (session.user as any).id,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ posting: newPosting });
    } catch (error) {
        console.error("Internship creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
