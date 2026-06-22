import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const postings = await db.internshipPosting.findMany({
            where: { status: "OPEN" },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({ postings });
    } catch (error) {
        console.error("Student internships error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
