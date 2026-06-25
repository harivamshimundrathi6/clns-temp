"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { 
    sendConsultationBookingEmailToClient, 
    sendConsultationBookingEmailToAdvocate, 
    sendConsultationBookingEmailToAdmin 
} from "@/lib/email";

export async function fetchClientCases() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "CLIENT") {
            return [];
        }

        const cases = await db.case.findMany({
            where: {
                clientId: session.user.id
            },
            include: {
                advocate: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                hearings: {
                    orderBy: { date: "asc" },
                    where: {
                        date: {
                            gte: new Date()
                        }
                    },
                    take: 1
                }
            }
        });

        cases.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

        // Transform for UI consumption if needed, or return as is.
        // The UI needs: 
        // id, title, caseNumber (we don't have this in schema yet, use ID or add field?), 
        // type (not in schema, maybe use title or add field?), 
        // court (in Hearing, not Case directly, but maybe Case has it?), 
        // status, nextHearing, lawyer, progress (mock for now).

        // Let's return the raw data and let the component format it, 
        // or map it here to match the UI interface exactly.
        // For "caseNumber", "type", "court", we might need schema updates later.
        // For now, we'll map what we have.

        return cases.map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            lawyer: c.advocate ? c.advocate.name : "Unassigned",
            lawyerEmail: c.advocate?.email,
            nextHearing: c.hearings?.[0]?.date || null,
            updatedAt: c.updatedAt
        }));

    } catch (error) {
        console.error("Failed to fetch client cases:", error);
        return [];
    }
}

export async function fetchClientStats() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "CLIENT") {
            return null;
        }

        const activeCases = await db.case.count({
            where: {
                clientId: session.user.id,
                status: "OPEN"
            }
        });

        // Add more stats as needed (e.g. pending documents, next hearing)
        return {
            activeCases
        };
    } catch (error) {
        console.error("Failed to fetch client stats:", error);
        return null;
    }
}

export async function fetchCaseDetails(caseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "CLIENT") {
            return null;
        }

        const caseItem = await db.case.findFirst({
            where: {
                id: caseId,
                clientId: session.user.id
            },
            include: {
                advocate: {
                    select: {
                        name: true,
                        email: true,
                        // phone?
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

export async function createClientCase(data: { title: string, description: string, type: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "CLIENT") {
            return { success: false, error: "Unauthorized" };
        }

        const newCase = await db.case.create({
            title: data.title,
            description: data.description,
            type: data.type,
            status: "OPEN", // Unassigned cases can start as OPEN
            clientId: session.user.id,
            // no advocate assigned yet
        });

        revalidatePath("/dashboard/client/cases");
        return { success: true, caseId: newCase.id };
    } catch (error: any) {
        console.error("Failed to create case:", error);
        return { success: false, error: error.message || "Failed to create case" };
    }
}

export async function fetchAvailableAdvocates() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const advocates = await db.user.findMany({
            where: {
                role: "ADVOCATE",
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
                city: true,
                court: true,
            }
        });

        // Sort in memory instead of using Firebase index
        advocates.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        // Filter out specific advocates as requested
        const namesToRemove = ["hari vamshi", "pratheek kasuba"];
        const filteredAdvocates = advocates.filter(adv => !namesToRemove.includes((adv.name || "").toLowerCase()));

        return filteredAdvocates.map(adv => ({
            id: adv.id,
            name: adv.name || "Advocate",
            email: adv.email,
            specialization: adv.barId ? "Verified Advocate" : "General Practice",
            bio: adv.bio || "Experienced legal professional ready to assist you.",
            verified: adv.status === "ACTIVE",
            imageUrl: adv.imageUrl || null,
            city: (adv as any).city || "Hyderabad",
            court: (adv as any).court || "High Court",
            barId: adv.barId || undefined,
        }));
    } catch (error) {
        console.error("Failed to fetch advocates:", error);
        return [];
    }
}

export async function bookConsultation(advocateId: string, data: {
    title: string;
    description: string;
    type?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "CLIENT") {
            return { success: false, error: "Unauthorized" };
        }

        // Check if advocate exists and is active
        const advocate = await db.user.findUnique({
            where: { id: advocateId },
            select: { id: true, role: true, status: true, name: true, email: true }
        });

        if (!advocate || advocate.role !== "ADVOCATE") {
            return { success: false, error: "Advocate not found" };
        }

        // Create a new case for the consultation in the admin queue
        const newCase = await db.case.create({
                title: data.title,
                description: data.description,
                type: data.type || "Consultation",
                status: "PENDING_ASSIGNMENT", // Admin must assign
                clientId: session.user.id,
                advocateId: null, // Not officially assigned yet
                preferredAdvocateId: advocateId, // Store who they want
            } as any);

        // Fetch client details
        const client = await db.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true }
        });

        if (client && client.email && advocate.email) {
            const clientName = client.name || "Client";
            const advName = advocate.name || "Advocate";
            const bookingDetails = {
                title: data.title,
                description: data.description,
                type: data.type || "Consultation"
            };

            // Send confirmation emails asynchronously
            Promise.allSettled([
                sendConsultationBookingEmailToClient(client.email, clientName, advName, bookingDetails),
                sendConsultationBookingEmailToAdvocate(advocate.email, advName, clientName, bookingDetails),
                sendConsultationBookingEmailToAdmin(clientName, advName, bookingDetails)
            ]).catch(e => console.error("Error sending booking emails:", e));
        }

        revalidatePath("/dashboard/client");
        revalidatePath("/dashboard/client/cases");
        revalidatePath("/dashboard/advocate/cases");

        return { success: true, caseId: newCase.id };
    } catch (error) {
        console.error("Failed to book consultation:", error);
        return { success: false, error: "Failed to book consultation" };
    }
}
