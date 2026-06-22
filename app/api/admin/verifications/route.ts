import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const verificationRequests = await db.verificationRequest.findMany({
            where: { status: "PENDING" },
            include: { user: { select: { name: true, email: true, role: true } } },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json({ verificationRequests });
    } catch (error) {
        console.error("Verifications fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { requestId, status } = body;

        const updatedRequest = await db.verificationRequest.update(requestId, { status });

        // Update user status if approved
        if (status === "APPROVED") {
            await db.user.update(updatedRequest.userId, { status: "VERIFIED" });
        }

        // Log the action
        await db.systemLog.create({
                action: "VERIFICATION_UPDATE",
                description: `Verification request ${requestId} - Status: ${status}`,
                userId: (session.user as any).id,
            });

        return NextResponse.json({ verificationRequest: updatedRequest });
    } catch (error) {
        console.error("Verification update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
