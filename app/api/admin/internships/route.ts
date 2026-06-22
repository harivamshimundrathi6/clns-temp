import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const postings = await db.internshipPosting.findMany({
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ postings });
    } catch (error) {
        console.error("Internships fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
