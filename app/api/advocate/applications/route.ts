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

        // Get all internships posted by this advocate
        const postings = await db.internshipPosting.findMany({
            where: { authorId: userId }
        });

        const postingIds = postings.map(p => p.id).filter(Boolean);

        // Get all applications for these postings
        const applications = await db.internshipApplication.findMany({
            where: { postingId: postingIds[0] } // Firebase limitation - will need to fetch all
        });

        // For Firebase, we need to fetch applications for each posting
        const allApplications = [];
        for (const postingId of postingIds) {
            const postingApps = await db.internshipApplication.findMany({
                where: { postingId }
            });
            allApplications.push(...postingApps);
        }

        // Include student and posting data
        const enrichedApplications = await Promise.all(
            allApplications.map(async (app: any) => {
                const student = await db.user.findUnique({
                    where: { id: app.studentId }
                });
                const posting = await db.internshipPosting.findUnique({
                    where: { id: app.postingId }
                });
                return {
                    ...app,
                    student,
                    posting
                };
            })
        );

        return NextResponse.json({ applications: enrichedApplications });
    } catch (error) {
        console.error("Advocate applications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADVOCATE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId, status, feedback } = body;

        // Update application status
        const updatedApplication = await db.internshipApplication.update(
            applicationId,
            {
                status,
                feedback,
                updatedAt: new Date().toISOString()
            }
        );

        // Log the action
        await db.systemLog.create({
            action: "APPLICATION_REVIEW",
            description: `Advocate reviewed application ${applicationId} - ${status}`,
            userId: (session.user as any).id,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ application: updatedApplication });
    } catch (error) {
        console.error("Application review error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
