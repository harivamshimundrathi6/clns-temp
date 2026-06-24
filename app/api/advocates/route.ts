import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const advocates = await db.user.findMany({
            where: {
                role: "ADVOCATE",
                status: "ACTIVE",
            },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                barId: true,
                imageUrl: true,
                status: true,
                createdAt: true,
            }
        });

        // Sort by createdAt desc (newest first)
        advocates.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        const namesToRemove = ["hari vamshi", "varun", "clns legal"];
        const filteredAdvocates = advocates.filter(adv => !namesToRemove.includes((adv.name || "").toLowerCase()));

        return NextResponse.json({
            success: true,
            advocates: filteredAdvocates.map(adv => ({
                id: adv.id,
                name: adv.name || "Advocate",
                email: adv.email,
                specialization: "Verified Advocate",
                bio: adv.bio || "Experienced legal professional ready to assist you.",
                verified: true,
                imageUrl: adv.imageUrl || null,
                barId: adv.barId || undefined,
                createdAt: adv.createdAt
            }))
        });
    } catch (error) {
        console.error("Failed to fetch public advocates:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
