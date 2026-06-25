"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- Stats & Overview ---

export async function fetchAdvocateStats() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return null;
        }

        // Simplified Firebase-compatible queries
        const [allApplications, allMentorships] = await Promise.all([
            db.internshipApplication.findMany({ where: { status: "PENDING" } }),
            db.mentorship.findMany({ where: { mentorId: session.user.id } })
        ]);

        const pendingApps = allApplications.length;
        const pendingMentorships = allMentorships.filter((m: any) => m.status === "PENDING").length;
        const activeMentees = allMentorships.filter((m: any) => m.status === "ACTIVE").length;

        return {
            pendingApps,
            pendingMentorships,
            activeMentees
        };
    } catch (error) {
        console.error("Failed to fetch advocate stats:", error);
        return null;
    }
}

// --- Internship Management ---

export async function fetchPendingApplications() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        // Fetching ALL pending applications. 
        // In a real app, you might only want applications for postings *managed* by this advocate.
        const apps = await db.internshipApplication.findMany({
            where: { status: "PENDING" },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        college: true,
                        bio: true,
                        resumeUrl: true,
                    }
                },
                posting: true
            }
        });
        
        return apps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (error) {
        console.error("Failed to fetch pending applications:", error);
        return [];
    }
}

export async function updateApplicationStatus(applicationId: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED") {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        await db.internshipApplication.update(
            applicationId,
            { status, updatedAt: new Date().toISOString() }
        );

        revalidatePath("/dashboard/advocate");
        revalidatePath("/dashboard/advocate/internships");
        return { success: true };
    } catch (error) {
        console.error("Failed to update application status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// --- Mentorship Management ---

export async function fetchMentorshipRequests() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        const requests = await db.mentorship.findMany({
            where: {
                mentorId: session.user.id,
                status: "PENDING"
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        college: true,
                        bio: true
                    }
                }
            }
        });
        return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Failed to fetch mentorship requests:", error);
        return [];
    }
}

export async function updateMentorshipStatus(mentorshipId: string, status: "ACTIVE" | "REJECTED" | "COMPLETED") {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // status "ACTIVE" means Accepted.
        await db.mentorship.update(mentorshipId, { status });

        revalidatePath("/dashboard/advocate");
        revalidatePath("/dashboard/advocate/mentorship");
        return { success: true };
    } catch (error) {
        console.error("Failed to update mentorship status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// --- My Mentees ---

export async function fetchMentees() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        const mentorships = await db.mentorship.findMany({
            where: { mentorId: session.user.id }
        });
        mentorships.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const activeMentorships = mentorships.filter((m: any) => m.status === "ACTIVE");

        const mentees = await Promise.all(
            activeMentorships.map(async (mentorship: any) => {
                const student = await db.user.findUnique({
                    where: { id: mentorship.studentId }
                });
                return {
                    ...student,
                    mentorshipId: mentorship.id,
                    startedAt: mentorship.createdAt
                };
            })
        );

        return mentees;
    } catch (error) {
        console.error("Failed to fetch mentees:", error);
        return [];
    }
}

// --- Internship Creation ---

export async function createInternship(data: {
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
    stipend?: string;
    duration?: string;
    deadline?: Date;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        await db.internshipPosting.create({
            title: data.title,
            description: data.description,
            company: data.company,
            location: data.location,
            type: data.type,
            stipend: data.stipend,
            duration: data.duration,
            deadline: data.deadline ? data.deadline.toISOString() : undefined,
            authorId: session.user.id,
            status: "OPEN",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        revalidatePath("/dashboard/student"); // Update student dashboard
        revalidatePath("/dashboard/advocate"); // Update likely advocate lists
        return { success: true };
    } catch (error) {
        console.error("Failed to create internship:", error);
        return { success: false, error: "Failed to create internship" };
    }
}

export async function updateInternship(id: string, data: {
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
    stipend?: string;
    duration?: string;
    deadline?: Date;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // Check ownership
        const existing = await db.internshipPosting.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!existing || existing.authorId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" };
        }

        await db.internshipPosting.update(id, {
            title: data.title,
            description: data.description,
            company: data.company,
            location: data.location,
            type: data.type,
            stipend: data.stipend,
            duration: data.duration,
            deadline: data.deadline,
        });

        revalidatePath("/dashboard/student");
        revalidatePath("/dashboard/advocate/internships");
        return { success: true };
    } catch (error) {
        console.error("Failed to update internship:", error);
        return { success: false, error: "Failed to update internship" };
    }
}

export async function toggleInternshipStatus(id: string, status: "OPEN" | "CLOSED" | "PAUSED") {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // Check ownership
        const existing = await db.internshipPosting.findUnique({
            where: { id: id }
        });

        if (!existing || existing.authorId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" };
        }

        await db.internshipPosting.update(
            id,
            { status, updatedAt: new Date().toISOString() }
        );

        revalidatePath("/dashboard/student");
        revalidatePath("/dashboard/advocate/internships");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle internship status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// --- New Actions for Dashboard Restructure (Sprint 3) ---

export async function fetchAdvocateInternships() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        const internships = await db.internshipPosting.findMany({
            where: {
                authorId: session.user.id
            },
            include: {
                _count: {
                    select: { applications: true }
                }
            }
        });
        
        return internships.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Failed to fetch advocate internships:", error);
        return [];
    }
}

export async function fetchAdvocateHearings() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        const hearings = await db.hearing.findMany({
            where: {
                case: {
                    advocateId: session.user.id
                }
            },
            include: {
                case: true
            }
        });

        // Manually fetch the client for each case, as firebase-db mock doesn't do deep includes
        for (const hearing of hearings) {
            if (hearing.case && hearing.case.clientId) {
                const clientDoc = await db.user.findUnique({ where: { id: hearing.case.clientId } });
                if (clientDoc) {
                    hearing.case.client = { name: clientDoc.name };
                }
            }
        }

        // Convert all dates to standard ISO strings to avoid client-side serialization issues with Firebase Timestamps
        const normalizedHearings = hearings.map(hearing => {
            let normalizedDate = hearing.date;
            if (hearing.date && typeof hearing.date === 'object') {
                if ('seconds' in hearing.date) normalizedDate = new Date(hearing.date.seconds * 1000).toISOString();
                else if ('_seconds' in hearing.date) normalizedDate = new Date(hearing.date._seconds * 1000).toISOString();
            }
            // Ensure it's a string or valid Date for the client
            if (normalizedDate instanceof Date) {
                normalizedDate = normalizedDate.toISOString();
            }
            return { ...hearing, date: normalizedDate };
        });

        return normalizedHearings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
        console.error("Failed to fetch advocate hearings:", error);
        return [];
    }
}

export async function fetchAdvocateClients() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        // Fetch clients who have cases assigned to this advocate
        const clients = await db.user.findMany({
            where: {
                role: "CLIENT",
                cases: {
                    some: {
                        advocateId: session.user.id
                    }
                }
            },
            include: {
                _count: {
                    select: { cases: { where: { advocateId: session.user.id } } }
                }
            }
        });

        // Map to a friendlier structure if needed, or return as is
        return clients.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: "N/A", // Schema doesn't have phone yet
            activeCases: client._count.cases,
            lastActive: client.updatedAt
        }));
    } catch (error) {
        console.error("Failed to fetch advocate clients:", error);
        return [];
    }
}

export async function fetchAdvocateCases() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        const cases = await db.case.findMany({
            where: {
                advocateId: session.user.id
            },
            include: {
                client: {
                    select: { name: true, email: true }
                },
                hearings: {
                    orderBy: { date: "asc" },
                    take: 1
                }
            }
        });
        return cases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
        console.error("Failed to fetch advocate cases:", error);
        return [];
    }
}

// --- Sprint 4: CRUD Actions ---

export async function fetchClientsForSelect() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        // For now, fetch ALL clients? Or just assigned ones?
        // User said "Select Client (Dropdown)". If creating a new case, maybe for a NEW client?
        // Let's fetch all users with role CLIENT for now to be safe.
        const clients = await db.user.findMany({
            where: { role: "CLIENT" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" }
        });
        return clients;
    } catch (error) {
        console.error("Failed to fetch clients for select:", error);
        return [];
    }
}

export async function createCase(data: {
    title: string;
    type: string;
    description?: string;
    clientId: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        await db.case.create({
            title: data.title,
            type: data.type,
            description: data.description,
            clientId: data.clientId,
            advocateId: session.user.id,
            status: "OPEN",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        revalidatePath("/dashboard/advocate/cases");
        revalidatePath("/dashboard/advocate/clients");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create case:", error);
        return { success: false, error: error.message || "Failed to create case" };
    }
}

export async function createHearing(data: {
    caseId: string;
    date: Date;
    title: string; // Purpose
    court?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // Verify case ownership? Or assume dropdown filters it?
        // Better to check.
        const existingCase = await db.case.findUnique({
            where: { id: data.caseId },
            select: { advocateId: true }
        });

        if (!existingCase || existingCase.advocateId !== session.user.id) {
            return { success: false, error: "Unauthorized or Invalid Case" };
        }

        await db.hearing.create({
                caseId: data.caseId,
                date: data.date,
                title: data.title,
                court: data.court
            });

        revalidatePath("/dashboard/advocate/hearings");
        revalidatePath("/dashboard/advocate/cases"); // Hearings list inside case details might update
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create hearing:", error);
        return { success: false, error: error.message || "Failed to create hearing" };
    }
}

export async function fetchAcceptedApplications() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") return [];

        const apps = await db.internshipApplication.findMany({
            where: {
                status: "ACCEPTED"
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        college: true,
                        bio: true,
                        resumeUrl: true,
                    }
                },
                posting: true
            }
        });
        
        // Filter by authorId in memory since it's a nested relationship
        const filteredApps = apps.filter(app => app.posting?.authorId === session.user.id);
        return filteredApps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
        console.error("Failed to fetch accepted applications:", error);
        return [];
    }
}

export async function updateHearing(hearingId: string, data: {
    date: Date;
    title: string;
    court?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // Verify hearing ownership through case
        const existingHearing = await db.hearing.findUnique({
            where: { id: hearingId }
        });

        if (!existingHearing) {
            return { success: false, error: "Hearing not found" };
        }

        const existingCase = await db.case.findUnique({
            where: { id: existingHearing.caseId }
        });

        if (!existingCase || existingCase.advocateId !== session.user.id) {
            return { success: false, error: "Unauthorized or hearing not found" };
        }

        await db.hearing.update(
            hearingId,
            {
                date: data.date.toISOString(),
                title: data.title,
                court: data.court,
                updatedAt: new Date().toISOString()
            }
        );

        revalidatePath("/dashboard/advocate/hearings");
        revalidatePath("/dashboard/advocate/cases");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update hearing:", error);
        return { success: false, error: error.message || "Failed to update hearing" };
    }
}

export async function deleteHearing(hearingId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // Verify hearing ownership through case
        const existingHearing = await db.hearing.findUnique({
            where: { id: hearingId },
            include: {
                case: {
                    select: { advocateId: true }
                }
            }
        });

        if (!existingHearing || existingHearing.case.advocateId !== session.user.id) {
            return { success: false, error: "Unauthorized or hearing not found" };
        }

        await db.hearing.delete(hearingId);

        revalidatePath("/dashboard/advocate/hearings");
        revalidatePath("/dashboard/advocate/cases");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete hearing:", error);
        return { success: false, error: error.message || "Failed to delete hearing" };
    }
}

export async function fetchHearingDetails(hearingId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return null;
        }

        const hearing = await db.hearing.findFirst({
            where: {
                id: hearingId,
                case: {
                    advocateId: session.user.id
                }
            },
            include: {
                case: {
                    select: {
                        id: true,
                        title: true,
                        client: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return hearing;
    } catch (error) {
        console.error("Failed to fetch hearing details:", error);
        return null;
    }
}

export async function fetchCaseDetails(caseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return null;
        }

        const caseItem = await db.case.findFirst({
            where: {
                id: caseId,
                advocateId: session.user.id
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                hearings: {
                    orderBy: { date: "desc" }
                }
            }
        });

        return caseItem;
    } catch (error) {
        console.error("Failed to fetch case details:", error);
        return null;
    }
}

export async function updateCaseStatus(caseId: string, status: "OPEN" | "CLOSED" | "PENDING") {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADVOCATE") {
            return { success: false, error: "Unauthorized" };
        }

        // Verify case ownership
        const existingCase = await db.case.findUnique({
            where: { id: caseId }
        });

        if (!existingCase || existingCase.advocateId !== session.user.id) {
            return { success: false, error: "Unauthorized or case not found" };
        }

        await db.case.update(
            caseId,
            { status, updatedAt: new Date().toISOString() }
        );

        revalidatePath("/dashboard/advocate/cases");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update case status:", error);
        return { success: false, error: error.message || "Failed to update case status" };
    }
}